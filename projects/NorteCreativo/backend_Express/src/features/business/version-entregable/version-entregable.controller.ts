import { Request, Response } from 'express';
import { ForeignKeyConstraintError, UniqueConstraintError, ValidationError } from 'sequelize';
import { Entregable } from '../entregable/entregable.model';
import { Tarea } from '../tarea/tarea.model';
import { Hito } from '../hitos/hito.model';
import { VersionEntregable } from './version-entregable.model';
import '../entregable/entregable.associations';
import '../tarea/tarea.associations';
import './version-entregable.associations';

// entregable_id solo se fija al crear; numero_version y estado los controla el sistema.
const CAMPOS_EDITABLES = ['fecha_inicio', 'fecha_fin', 'total', 'observaciones', 'status'] as const;
const CAMPOS_DEL_SISTEMA = ['estado', 'numero_version'] as const;

const pickCampos = (body: Record<string, unknown> = {}) => {
  const data: Record<string, unknown> = {};
  for (const campo of CAMPOS_EDITABLES) {
    if (body[campo] !== undefined) data[campo] = body[campo];
  }
  return data;
};

const handleError = (error: unknown, res: Response): Response => {
  if (error instanceof UniqueConstraintError) {
    return res.status(409).json({ message: 'Ya existe una versión con ese numero_version para el entregable' });
  }
  if (error instanceof ForeignKeyConstraintError) {
    return res.status(409).json({ message: 'El entregable_id no es válido para esta operación' });
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

// 400 si el body intenta fijar estado o numero_version. Devuelve true si se puede continuar.
const rechazarCamposDelSistema = (body: Record<string, unknown> = {}, res: Response): boolean => {
  const enviados = CAMPOS_DEL_SISTEMA.filter((c) => Object.prototype.hasOwnProperty.call(body ?? {}, c));
  if (enviados.length === 0) return true;
  res.status(400).json({
    message: 'Error de validación',
    errors: [`estado y numero_version los controla el sistema (recibido: ${enviados.join(', ')})`],
  });
  return false;
};

const findVersion = async (req: Request, res: Response, include = false): Promise<VersionEntregable | null> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ message: 'El id debe ser un entero positivo' });
    return null;
  }
  const version = await VersionEntregable.findByPk(
    id,
    include ? { include: [{ model: Entregable, as: 'entregable' }] } : {}
  );
  if (!version) {
    res.status(404).json({ message: 'Versión de entregable no encontrada' });
    return null;
  }
  return version;
};

// RN-04: una versión APROBADA es inmutable. Devuelve true si se puede continuar.
const validarNoAprobada = (version: VersionEntregable, res: Response): boolean => {
  if (version.estado === 'APROBADA') {
    res.status(409).json({ message: 'Una versión APROBADA no se puede modificar ni eliminar (RN-04)' });
    return false;
  }
  return true;
};

// entregable_id en PUT/PATCH: no se puede mover la versión a otro entregable.
const validarEntregableInmutable = (version: VersionEntregable, body: Record<string, unknown> = {}, res: Response) => {
  if (body?.entregable_id !== undefined && Number(body.entregable_id) !== version.entregable_id) {
    res.status(400).json({
      message: 'Error de validación',
      errors: ['entregable_id no se puede cambiar: una versión pertenece siempre al mismo entregable'],
    });
    return false;
  }
  return true;
};

export class VersionEntregableController {
  static async getAll(_req: Request, res: Response) {
    try {
      const versiones = await VersionEntregable.findAll({ where: { status: 'active' }, order: [['id', 'ASC']] });
      return res.status(200).json({ versiones });
    } catch (error) {
      return handleError(error, res);
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const version = await findVersion(req, res, true);
      if (!version) return;
      return res.status(200).json({ version });
    } catch (error) {
      return handleError(error, res);
    }
  }

  // numero_version = siguiente número del entregable; estado siempre nace EN_REVISION.
  static async create(req: Request, res: Response) {
    try {
      if (!rechazarCamposDelSistema(req.body, res)) return;

      const entregableId = Number(req.body?.entregable_id);
      if (req.body?.entregable_id == null || !Number.isInteger(entregableId) || entregableId < 1) {
        return res.status(400).json({
          message: 'Error de validación',
          errors: ['entregable_id es requerido y debe ser un entero positivo'],
        });
      }

      const entregable = await Entregable.findByPk(entregableId, {
        include: [{ model: Tarea, as: 'tarea', include: [{ model: Hito, as: 'hito' }] }],
      });
      if (!entregable) {
        return res.status(404).json({ message: 'Entregable no encontrado' });
      }

      // RN-06: un hito CERRADO no admite versiones nuevas.
      const hito = (entregable as any).tarea?.hito as Hito | undefined;
      if (hito?.estado === 'CERRADO') {
        return res.status(409).json({ message: 'No se crean versiones para un entregable cuyo hito está CERRADO (RN-06)' });
      }

      // Equivale a count + 1; se parte del máximo para no chocar con el UNIQUE si se borró una versión intermedia.
      const maximo = (await VersionEntregable.max('numero_version', { where: { entregable_id: entregableId } })) as number | null;
      const numeroVersion = (Number(maximo) || 0) + 1;

      const version = await VersionEntregable.create({
        ...pickCampos(req.body),
        entregable_id: entregableId,
        numero_version: numeroVersion,
      } as any);
      return res.status(201).json({ version });
    } catch (error) {
      return handleError(error, res);
    }
  }

  // PUT reemplaza los campos editables: los opcionales omitidos quedan en null/default.
  static async updatePut(req: Request, res: Response) {
    try {
      const version = await findVersion(req, res);
      if (!version) return;
      if (!rechazarCamposDelSistema(req.body, res)) return;
      if (!validarEntregableInmutable(version, req.body, res)) return;
      if (!validarNoAprobada(version, res)) return;
      const data = pickCampos(req.body);
      await version.update({
        fecha_inicio: data.fecha_inicio ?? null,
        fecha_fin: data.fecha_fin ?? null,
        total: data.total ?? null,
        observaciones: data.observaciones ?? null,
        status: data.status ?? 'active',
      } as any);
      return res.status(200).json({ version });
    } catch (error) {
      return handleError(error, res);
    }
  }

  static async updatePatch(req: Request, res: Response) {
    try {
      const version = await findVersion(req, res);
      if (!version) return;
      if (!rechazarCamposDelSistema(req.body, res)) return;
      if (!validarEntregableInmutable(version, req.body, res)) return;
      if (!validarNoAprobada(version, res)) return;
      await version.update(pickCampos(req.body) as any);
      return res.status(200).json({ version });
    } catch (error) {
      return handleError(error, res);
    }
  }

  static async deletePhysical(req: Request, res: Response) {
    try {
      const version = await findVersion(req, res);
      if (!version) return;
      if (!validarNoAprobada(version, res)) return;
      await version.destroy();
      return res.status(200).json({ message: 'Versión de entregable eliminada' });
    } catch (error) {
      if (error instanceof ForeignKeyConstraintError) {
        return res.status(409).json({ message: 'No se puede eliminar: la versión tiene aprobaciones asociadas' });
      }
      return handleError(error, res);
    }
  }

  static async deleteLogical(req: Request, res: Response) {
    try {
      const version = await findVersion(req, res);
      if (!version) return;
      if (!validarNoAprobada(version, res)) return;
      await version.update({ status: 'inactive' });
      return res.status(200).json({ version });
    } catch (error) {
      return handleError(error, res);
    }
  }
}
