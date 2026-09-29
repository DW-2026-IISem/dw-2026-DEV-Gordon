import { Request, Response } from 'express';
import { UniqueConstraintError, ValidationError } from 'sequelize';
import { Cliente } from './cliente.model';

const CAMPOS_EDITABLES = ['tipo_documento', 'numero_documento', 'nombre', 'telefono', 'email', 'status'] as const;

const pickCampos = (body: Record<string, unknown> = {}) => {
  const data: Record<string, unknown> = {};
  for (const campo of CAMPOS_EDITABLES) {
    if (body[campo] !== undefined) data[campo] = body[campo];
  }
  return data;
};

const handleError = (error: unknown, res: Response): Response => {
  if (error instanceof UniqueConstraintError) {
    return res.status(409).json({ message: 'El numero_documento ya está registrado' });
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

const findCliente = async (req: Request, res: Response): Promise<Cliente | null> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ message: 'El id debe ser un entero positivo' });
    return null;
  }
  const cliente = await Cliente.findByPk(id);
  if (!cliente) {
    res.status(404).json({ message: 'Cliente no encontrado' });
    return null;
  }
  return cliente;
};

export class ClienteController {
  static async getAll(_req: Request, res: Response) {
    try {
      const clientes = await Cliente.findAll({ where: { status: 'active' }, order: [['id', 'ASC']] });
      return res.status(200).json({ clientes });
    } catch (error) {
      return handleError(error, res);
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const cliente = await findCliente(req, res);
      if (!cliente) return;
      return res.status(200).json({ cliente });
    } catch (error) {
      return handleError(error, res);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const cliente = await Cliente.create(pickCampos(req.body) as any);
      return res.status(201).json({ cliente });
    } catch (error) {
      return handleError(error, res);
    }
  }

  // PUT reemplaza el recurso completo: los opcionales omitidos quedan en null/default.
  static async updatePut(req: Request, res: Response) {
    try {
      const cliente = await findCliente(req, res);
      if (!cliente) return;
      const data = pickCampos(req.body);
      const faltantes = ['tipo_documento', 'numero_documento', 'nombre'].filter((c) => data[c] === undefined);
      if (faltantes.length > 0) {
        return res.status(400).json({
          message: 'Error de validación',
          errors: faltantes.map((c) => `${c} es requerido en PUT`),
        });
      }
      await cliente.update({
        tipo_documento: data.tipo_documento,
        numero_documento: data.numero_documento,
        nombre: data.nombre,
        telefono: data.telefono ?? null,
        email: data.email ?? null,
        status: data.status ?? 'active',
      } as any);
      return res.status(200).json({ cliente });
    } catch (error) {
      return handleError(error, res);
    }
  }

  // PATCH solo modifica los campos enviados.
  static async updatePatch(req: Request, res: Response) {
    try {
      const cliente = await findCliente(req, res);
      if (!cliente) return;
      await cliente.update(pickCampos(req.body) as any);
      return res.status(200).json({ cliente });
    } catch (error) {
      return handleError(error, res);
    }
  }

  static async deletePhysical(req: Request, res: Response) {
    try {
      const cliente = await findCliente(req, res);
      if (!cliente) return;
      await cliente.destroy();
      return res.status(200).json({ message: 'Cliente eliminado' });
    } catch (error) {
      return handleError(error, res);
    }
  }

  static async deleteLogical(req: Request, res: Response) {
    try {
      const cliente = await findCliente(req, res);
      if (!cliente) return;
      await cliente.update({ status: 'inactive' });
      return res.status(200).json({ cliente });
    } catch (error) {
      return handleError(error, res);
    }
  }
}
