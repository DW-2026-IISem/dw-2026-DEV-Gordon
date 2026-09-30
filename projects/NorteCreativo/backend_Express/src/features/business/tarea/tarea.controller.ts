import { Request, Response } from 'express';
import { ForeignKeyConstraintError, UniqueConstraintError, ValidationError } from 'sequelize';
import { Hito } from '../hito/hito.model';
import { Tarea } from './tarea.model';
import './tarea.associations';

const CAMPOS_EDITABLES = ['hito_id', 'nombre', 'descripcion', 'status'] as const;

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
    return res.status(409).json({ message: 'El hito_id no es válido para esta operación' });
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

const findTarea = async (req: Request, res: Response, include = false): Promise<Tarea | null> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ message: 'El id debe ser un entero positivo' });
    return null;
  }
  const tarea = await Tarea.findByPk(id, include ? { include: [{ model: Hito, as: 'hito' }] } : {});
  if (!tarea) {
    res.status(404).json({ message: 'Tarea no encontrada' });
    return null;
  }
  return tarea;
};

// El hito debe existir (404). Sin regla extra sobre su estado. Devuelve true si se puede continuar.
const validarHito = async (hitoId: unknown, res: Response): Promise<boolean> => {
  const id = Number(hitoId);
  if (hitoId === undefined || hitoId === null || !Number.isInteger(id) || id < 1) {
    res.status(400).json({
      message: 'Error de validación',
      errors: ['hito_id es requerido y debe ser un entero positivo'],
    });
    return false;
  }
  if (!(await Hito.findByPk(id))) {
    res.status(404).json({ message: 'Hito no encontrado' });
    return false;
  }
  return true;
};

export class TareaController {
  static async getAll(_req: Request, res: Response) {
    try {
      const tareas = await Tarea.findAll({ where: { status: 'active' }, order: [['id', 'ASC']] });
      return res.status(200).json({ tareas });
    } catch (error) {
      return handleError(error, res);
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const tarea = await findTarea(req, res, true);
      if (!tarea) return;
      return res.status(200).json({ tarea });
    } catch (error) {
      return handleError(error, res);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const data = pickCampos(req.body);
      if (!(await validarHito(data.hito_id, res))) return;
      const tarea = await Tarea.create(data as any);
      return res.status(201).json({ tarea });
    } catch (error) {
      return handleError(error, res);
    }
  }

  // PUT reemplaza el recurso completo: los opcionales omitidos quedan en null/default.
  static async updatePut(req: Request, res: Response) {
    try {
      const tarea = await findTarea(req, res);
      if (!tarea) return;
      const data = pickCampos(req.body);
      if (!(await validarHito(data.hito_id, res))) return;
      if (data.nombre === undefined) {
        return res.status(400).json({
          message: 'Error de validación',
          errors: ['nombre es requerido en PUT'],
        });
      }
      await tarea.update({
        hito_id: data.hito_id,
        nombre: data.nombre,
        descripcion: data.descripcion ?? null,
        status: data.status ?? 'active',
      } as any);
      return res.status(200).json({ tarea });
    } catch (error) {
      return handleError(error, res);
    }
  }

  // PATCH solo modifica los campos enviados; si cambia hito_id se valida su existencia.
  static async updatePatch(req: Request, res: Response) {
    try {
      const tarea = await findTarea(req, res);
      if (!tarea) return;
      const data = pickCampos(req.body);
      if (data.hito_id !== undefined && !(await validarHito(data.hito_id, res))) return;
      await tarea.update(data as any);
      return res.status(200).json({ tarea });
    } catch (error) {
      return handleError(error, res);
    }
  }

  static async deletePhysical(req: Request, res: Response) {
    try {
      const tarea = await findTarea(req, res);
      if (!tarea) return;
      await tarea.destroy();
      return res.status(200).json({ message: 'Tarea eliminada' });
    } catch (error) {
      return handleError(error, res);
    }
  }

  static async deleteLogical(req: Request, res: Response) {
    try {
      const tarea = await findTarea(req, res);
      if (!tarea) return;
      await tarea.update({ status: 'inactive' });
      return res.status(200).json({ tarea });
    } catch (error) {
      return handleError(error, res);
    }
  }
}
