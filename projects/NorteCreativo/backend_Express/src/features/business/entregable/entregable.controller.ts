import { Request, Response } from 'express';
import { ForeignKeyConstraintError, UniqueConstraintError, ValidationError } from 'sequelize';
import { Tarea } from '../tarea/tarea.model';
import { Entregable } from './entregable.model';
import './entregable.associations';

const CAMPOS_EDITABLES = [
  'tarea_id',
  'fecha_inicio',
  'fecha_fin',
  'total',
  'estado',
  'observaciones',
  'status',
] as const;

const pickCampos = (body: Record<string, unknown> = {}) => {
  const data: Record<string, unknown> = {};
  for (const campo of CAMPOS_EDITABLES) {
    if (body[campo] !== undefined) data[campo] = body[campo];
  }
  return data;
};

const handleError = (error: unknown, res: Response): Response => {
  if (error instanceof UniqueConstraintError) {
    return res.status(409).json({ message: 'Registro duplicado' });
  }
  if (error instanceof ForeignKeyConstraintError) {
    return res.status(409).json({ message: 'El tarea_id no es válido para esta operación' });
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

const findEntregable = async (req: Request, res: Response, include = false): Promise<Entregable | null> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ message: 'El id debe ser un entero positivo' });
    return null;
  }
  const entregable = await Entregable.findByPk(id, include ? { include: [{ model: Tarea, as: 'tarea' }] } : {});
  if (!entregable) {
    res.status(404).json({ message: 'Entregable no encontrado' });
    return null;
  }
  return entregable;
};

// La tarea debe existir (404). Sin regla extra sobre su estado. Devuelve true si se puede continuar.
const validarTarea = async (tareaId: unknown, res: Response): Promise<boolean> => {
  const id = Number(tareaId);
  if (tareaId === undefined || tareaId === null || !Number.isInteger(id) || id < 1) {
    res.status(400).json({
      message: 'Error de validación',
      errors: ['tarea_id es requerido y debe ser un entero positivo'],
    });
    return false;
  }
  if (!(await Tarea.findByPk(id))) {
    res.status(404).json({ message: 'Tarea no encontrada' });
    return false;
  }
  return true;
};

export class EntregableController {
  static async getAll(_req: Request, res: Response) {
    try {
      const entregables = await Entregable.findAll({ where: { status: 'active' }, order: [['id', 'ASC']] });
      return res.status(200).json({ entregables });
    } catch (error) {
      return handleError(error, res);
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const entregable = await findEntregable(req, res, true);
      if (!entregable) return;
      return res.status(200).json({ entregable });
    } catch (error) {
      return handleError(error, res);
    }
  }

  // Si no llega fecha_inicio se asigna la fecha actual.
  static async create(req: Request, res: Response) {
    try {
      const data = pickCampos(req.body);
      if (!(await validarTarea(data.tarea_id, res))) return;
      if (data.fecha_inicio === undefined || data.fecha_inicio === null || data.fecha_inicio === '') {
        data.fecha_inicio = new Date();
      }
      const entregable = await Entregable.create(data as any);
      return res.status(201).json({ entregable });
    } catch (error) {
      return handleError(error, res);
    }
  }

  // PUT reemplaza el recurso completo: los opcionales omitidos quedan en null/default.
  static async updatePut(req: Request, res: Response) {
    try {
      const entregable = await findEntregable(req, res);
      if (!entregable) return;
      const data = pickCampos(req.body);
      if (!(await validarTarea(data.tarea_id, res))) return;
      await entregable.update({
        tarea_id: data.tarea_id,
        fecha_inicio: data.fecha_inicio ?? null,
        fecha_fin: data.fecha_fin ?? null,
        total: data.total ?? null,
        estado: data.estado ?? 'EN_PROCESO',
        observaciones: data.observaciones ?? null,
        status: data.status ?? 'active',
      } as any);
      return res.status(200).json({ entregable });
    } catch (error) {
      return handleError(error, res);
    }
  }

  // PATCH solo modifica los campos enviados; si cambia tarea_id se valida su existencia.
  static async updatePatch(req: Request, res: Response) {
    try {
      const entregable = await findEntregable(req, res);
      if (!entregable) return;
      const data = pickCampos(req.body);
      if (data.tarea_id !== undefined && !(await validarTarea(data.tarea_id, res))) return;
      await entregable.update(data as any);
      return res.status(200).json({ entregable });
    } catch (error) {
      return handleError(error, res);
    }
  }

  static async deletePhysical(req: Request, res: Response) {
    try {
      const entregable = await findEntregable(req, res);
      if (!entregable) return;
      await entregable.destroy();
      return res.status(200).json({ message: 'Entregable eliminado' });
    } catch (error) {
      if (error instanceof ForeignKeyConstraintError) {
        return res.status(409).json({ message: 'No se puede eliminar: el entregable tiene versiones asociadas' });
      }
      return handleError(error, res);
    }
  }

  static async deleteLogical(req: Request, res: Response) {
    try {
      const entregable = await findEntregable(req, res);
      if (!entregable) return;
      await entregable.update({ status: 'inactive' });
      return res.status(200).json({ entregable });
    } catch (error) {
      return handleError(error, res);
    }
  }
}
