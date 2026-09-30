import { Request, Response } from 'express';
import { ForeignKeyConstraintError, UniqueConstraintError, ValidationError } from 'sequelize';
import { sequelize } from '../../../database/db';
import { Hito } from '../hito/hito.model';
import { Tarea } from '../tarea/tarea.model';
import { Entregable } from '../entregable/entregable.model';
import { VersionEntregable } from '../version-entregable/version-entregable.model';
import { Aprobacion } from './aprobacion.model';
import { debeCerrarHito, EntregableUltimaVersion } from './cierre-hito.evaluator';
import '../hito/hito.associations';
import '../tarea/tarea.associations';
import '../entregable/entregable.associations';
import '../version-entregable/version-entregable.associations';
import './aprobacion.associations';

const VEREDICTOS = ['APROBADA', 'RECHAZADA'] as const;

// Error de regla de negocio lanzado dentro de la transacción: provoca el rollback y se traduce a HTTP.
class ReglaError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

const handleError = (error: unknown, res: Response): Response => {
  if (error instanceof ReglaError) {
    return res.status(error.status).json({ message: error.message });
  }
  if (error instanceof UniqueConstraintError) {
    return res.status(409).json({ message: 'Registro duplicado' });
  }
  if (error instanceof ForeignKeyConstraintError) {
    return res.status(409).json({ message: 'La versión de entregable no es válida para esta operación' });
  }
  if (error instanceof ValidationError) {
    return res.status(400).json({
      message: 'Error de validación',
      errors: error.errors.map((e) => e.message),
    });
  }
  console.error(error);
  return res.status(500).json({ message: 'Error interno del servidor' });
};

const entero = (valor: unknown): number | null => {
  const n = Number(valor);
  return valor !== undefined && valor !== null && valor !== '' && Number.isInteger(n) && n > 0 ? n : null;
};

export class AprobacionController {
  static async getAll(_req: Request, res: Response) {
    try {
      const aprobaciones = await Aprobacion.findAll({ where: { status: 'active' }, order: [['id', 'ASC']] });
      return res.status(200).json({ aprobaciones });
    } catch (error) {
      return handleError(error, res);
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const id = entero(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: 'El id debe ser un entero positivo' });
      }
      const aprobacion = await Aprobacion.findByPk(id, {
        include: [{ model: VersionEntregable, as: 'version' }],
      });
      if (!aprobacion) {
        return res.status(404).json({ message: 'Aprobación no encontrada' });
      }
      return res.status(200).json({ aprobacion });
    } catch (error) {
      return handleError(error, res);
    }
  }

  // CerrarHito: registra el veredicto y, si todos los entregables del hito quedan APROBADOS, cierra el hito.
  // Todo ocurre en una sola transacción; cualquier error revierte todo.
  static async create(req: Request, res: Response) {
    try {
      const { version_entregable_id, aprobador_id, estado, comentario } = req.body ?? {};

      const errores: string[] = [];
      const versionId = entero(version_entregable_id);
      const aprobadorId = entero(aprobador_id);
      if (versionId === null) errores.push('version_entregable_id es requerido y debe ser un entero positivo');
      if (aprobadorId === null) errores.push('aprobador_id es requerido y debe ser un entero positivo');
      if (typeof estado !== 'string' || !(VEREDICTOS as readonly string[]).includes(estado)) {
        errores.push(`estado debe ser uno de: ${VEREDICTOS.join(', ')}`);
      }
      if (comentario !== undefined && comentario !== null && typeof comentario !== 'string') {
        errores.push('comentario debe ser texto');
      }
      if (errores.length > 0) {
        return res.status(400).json({ message: 'Error de validación', errors: errores });
      }

      const veredicto = estado as (typeof VEREDICTOS)[number];

      const resultado = await sequelize.transaction(async (t) => {
        const version = await VersionEntregable.findByPk(versionId!, { transaction: t });
        if (!version) throw new ReglaError(404, 'Versión de entregable no encontrada');

        const entregable = await Entregable.findByPk(version.entregable_id, { transaction: t });
        if (!entregable) throw new ReglaError(404, 'Entregable de la versión no encontrado');

        const tarea = await Tarea.findByPk(entregable.tarea_id, { transaction: t });
        if (!tarea) throw new ReglaError(404, 'Tarea del entregable no encontrada');

        // Bloqueo de fila: serializa aprobaciones concurrentes sobre el mismo hito.
        const hito = await Hito.findByPk(tarea.hito_id, { transaction: t, lock: t.LOCK.UPDATE });
        if (!hito) throw new ReglaError(404, 'Hito de la tarea no encontrado');

        // RN-06
        if (hito.estado !== 'ABIERTO') {
          throw new ReglaError(409, 'El hito ya esta cerrado y no admite nuevas aprobaciones');
        }

        const aprobacion = await Aprobacion.create(
          {
            version_entregable_id: version.id,
            estado: veredicto,
            aprobador_id: aprobadorId!,
            comentario: typeof comentario === 'string' ? comentario : null,
          },
          { transaction: t }
        );
        await version.update({ estado: veredicto }, { transaction: t });

        // RN-01: un rechazo nunca cierra el hito (la aprobación sí queda guardada).
        if (veredicto === 'RECHAZADA') {
          return { aprobacion, hito_cerrado: false, hito_id: hito.id, fecha_cierre: null as Date | null };
        }

        // Consultas secuenciales a propósito: comparten la misma conexión/transacción.
        const lista: EntregableUltimaVersion[] = [];
        const tareas = await Tarea.findAll({ where: { hito_id: hito.id }, transaction: t });
        for (const tareaHito of tareas) {
          const entregables = await Entregable.findAll({ where: { tarea_id: tareaHito.id }, transaction: t });
          for (const e of entregables) {
            const ultima = await VersionEntregable.findOne({
              where: { entregable_id: e.id },
              order: [['numero_version', 'DESC']],
              transaction: t,
            });
            lista.push({ entregable_id: e.id, ultima_version_estado: ultima?.estado ?? null });
          }
        }

        if (!debeCerrarHito(lista)) {
          return { aprobacion, hito_cerrado: false, hito_id: hito.id, fecha_cierre: null as Date | null };
        }

        const fechaCierre = new Date();
        await hito.update({ estado: 'CERRADO', fecha_cierre: fechaCierre }, { transaction: t });
        return { aprobacion, hito_cerrado: true, hito_id: hito.id, fecha_cierre: fechaCierre as Date | null };
      });

      return res.status(201).json(resultado);
    } catch (error) {
      return handleError(error, res);
    }
  }
}
