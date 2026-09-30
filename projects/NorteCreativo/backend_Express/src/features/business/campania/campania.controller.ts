import { Request, Response } from 'express';
import { ForeignKeyConstraintError, UniqueConstraintError, ValidationError } from 'sequelize';
import { Cliente } from '../cliente/cliente.model';
import { Campania } from './campania.model';
import './campania.associations';

const CAMPOS_EDITABLES = ['cliente_id', 'nombre', 'descripcion', 'status'] as const;

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
    return res.status(409).json({ message: 'El cliente_id no es válido para esta operación' });
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

const findCampania = async (req: Request, res: Response, include = false): Promise<Campania | null> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ message: 'El id debe ser un entero positivo' });
    return null;
  }
  const campania = await Campania.findByPk(id, include ? { include: [{ model: Cliente, as: 'cliente' }] } : {});
  if (!campania) {
    res.status(404).json({ message: 'Campaña no encontrada' });
    return null;
  }
  return campania;
};

// Valida que el cliente exista (404) y esté activo (409). Devuelve true si se puede continuar.
const validarCliente = async (clienteId: unknown, res: Response): Promise<boolean> => {
  const id = Number(clienteId);
  if (clienteId === undefined || clienteId === null || !Number.isInteger(id) || id < 1) {
    res.status(400).json({
      message: 'Error de validación',
      errors: ['cliente_id es requerido y debe ser un entero positivo'],
    });
    return false;
  }
  const cliente = await Cliente.findByPk(id);
  if (!cliente) {
    res.status(404).json({ message: 'Cliente no encontrado' });
    return false;
  }
  if (cliente.status === 'inactive') {
    res.status(409).json({ message: 'No se crea campaña para un cliente inactivo' });
    return false;
  }
  return true;
};

export class CampaniaController {
  static async getAll(_req: Request, res: Response) {
    try {
      const campanias = await Campania.findAll({ where: { status: 'active' }, order: [['id', 'ASC']] });
      return res.status(200).json({ campanias });
    } catch (error) {
      return handleError(error, res);
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const campania = await findCampania(req, res, true);
      if (!campania) return;
      return res.status(200).json({ campania });
    } catch (error) {
      return handleError(error, res);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const data = pickCampos(req.body);
      if (!(await validarCliente(data.cliente_id, res))) return;
      const campania = await Campania.create(data as any);
      return res.status(201).json({ campania });
    } catch (error) {
      return handleError(error, res);
    }
  }

  // PUT reemplaza el recurso completo: los opcionales omitidos quedan en null/default.
  static async updatePut(req: Request, res: Response) {
    try {
      const campania = await findCampania(req, res);
      if (!campania) return;
      const data = pickCampos(req.body);
      if (!(await validarCliente(data.cliente_id, res))) return;
      if (data.nombre === undefined) {
        return res.status(400).json({
          message: 'Error de validación',
          errors: ['nombre es requerido en PUT'],
        });
      }
      await campania.update({
        cliente_id: data.cliente_id,
        nombre: data.nombre,
        descripcion: data.descripcion ?? null,
        status: data.status ?? 'active',
      } as any);
      return res.status(200).json({ campania });
    } catch (error) {
      return handleError(error, res);
    }
  }

  // PATCH solo modifica los campos enviados; si cambia cliente_id se aplica la misma regla que en create.
  static async updatePatch(req: Request, res: Response) {
    try {
      const campania = await findCampania(req, res);
      if (!campania) return;
      const data = pickCampos(req.body);
      if (data.cliente_id !== undefined && !(await validarCliente(data.cliente_id, res))) return;
      await campania.update(data as any);
      return res.status(200).json({ campania });
    } catch (error) {
      return handleError(error, res);
    }
  }

  static async deletePhysical(req: Request, res: Response) {
    try {
      const campania = await findCampania(req, res);
      if (!campania) return;
      await campania.destroy();
      return res.status(200).json({ message: 'Campaña eliminada' });
    } catch (error) {
      return handleError(error, res);
    }
  }

  static async deleteLogical(req: Request, res: Response) {
    try {
      const campania = await findCampania(req, res);
      if (!campania) return;
      await campania.update({ status: 'inactive' });
      return res.status(200).json({ campania });
    } catch (error) {
      return handleError(error, res);
    }
  }
}
