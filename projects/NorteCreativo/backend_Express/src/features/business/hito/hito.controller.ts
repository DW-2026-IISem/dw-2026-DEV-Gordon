import { Request, Response } from 'express';
import { ForeignKeyConstraintError, UniqueConstraintError, ValidationError } from 'sequelize';
import { Campania } from '../campania/campania.model';
import { ESTADOS_HITO, Hito } from './hito.model';
import './hito.associations';

// estado y fecha_cierre no son editables por el cliente: los gobierna resolverEstado.
const CAMPOS_EDITABLES = ['campania_id', 'nombre', 'descripcion', 'status'] as const;

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
    return res.status(409).json({ message: 'El campania_id no es válido para esta operación' });
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

const findHito = async (req: Request, res: Response, include = false): Promise<Hito | null> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ message: 'El id debe ser un entero positivo' });
    return null;
  }
  const hito = await Hito.findByPk(id, include ? { include: [{ model: Campania, as: 'campania' }] } : {});
  if (!hito) {
    res.status(404).json({ message: 'Hito no encontrado' });
    return null;
  }
  return hito;
};

// RN-08: la campaña debe existir (404) y estar activa (409). Devuelve true si se puede continuar.
const validarCampania = async (campaniaId: unknown, res: Response): Promise<boolean> => {
  const id = Number(campaniaId);
  if (campaniaId === undefined || campaniaId === null || !Number.isInteger(id) || id < 1) {
    res.status(400).json({
      message: 'Error de validación',
      errors: ['campania_id es requerido y debe ser un entero positivo'],
    });
    return false;
  }
  const campania = await Campania.findByPk(id);
  if (!campania) {
    res.status(404).json({ message: 'Campaña no encontrada' });
    return false;
  }
  if (campania.status === 'inactive') {
    res.status(409).json({ message: 'No se crea hito para una campaña inactiva' });
    return false;
  }
  return true;
};

// Invariantes de estado (PUT y PATCH): ENUM válido (400), no reabrir (409, RN-06) y CERRADO fija fecha_cierre.
// Devuelve los cambios a aplicar, o null si ya respondió con error.
const resolverEstado = (
  hito: Hito,
  nuevo: unknown,
  res: Response
): { estado?: Hito['estado']; fecha_cierre?: Date } | null => {
  if (nuevo === undefined) return {};
  if (typeof nuevo !== 'string' || !(ESTADOS_HITO as readonly string[]).includes(nuevo)) {
    res.status(400).json({
      message: 'Error de validación',
      errors: [`estado debe ser uno de: ${ESTADOS_HITO.join(', ')}`],
    });
    return null;
  }
  const estado = nuevo as Hito['estado'];
  if (estado === 'ABIERTO' && hito.estado !== 'ABIERTO') {
    res.status(409).json({ message: `Un hito ${hito.estado} no puede volver a ABIERTO` });
    return null;
  }
  if (estado === 'CERRADO' && hito.estado !== 'CERRADO') {
    return { estado, fecha_cierre: new Date() };
  }
  return { estado };
};

export class HitoController {
  static async getAll(_req: Request, res: Response) {
    try {
      const hitos = await Hito.findAll({ where: { status: 'active' }, order: [['id', 'ASC']] });
      return res.status(200).json({ hitos });
    } catch (error) {
      return handleError(error, res);
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const hito = await findHito(req, res, true);
      if (!hito) return;
      return res.status(200).json({ hito });
    } catch (error) {
      return handleError(error, res);
    }
  }

  // Siempre nace ABIERTO con fecha_cierre null: estado y fecha_cierre del body se ignoran.
  static async create(req: Request, res: Response) {
    try {
      const data = pickCampos(req.body);
      if (!(await validarCampania(data.campania_id, res))) return;
      const hito = await Hito.create({ ...data, estado: 'ABIERTO', fecha_cierre: null } as any);
      return res.status(201).json({ hito });
    } catch (error) {
      return handleError(error, res);
    }
  }

  // PUT reemplaza los campos de negocio; el estado solo cambia si se envía (y respeta las invariantes).
  static async updatePut(req: Request, res: Response) {
    try {
      const hito = await findHito(req, res);
      if (!hito) return;
      const data = pickCampos(req.body);
      if (!(await validarCampania(data.campania_id, res))) return;
      if (data.nombre === undefined) {
        return res.status(400).json({
          message: 'Error de validación',
          errors: ['nombre es requerido en PUT'],
        });
      }
      const cambiosEstado = resolverEstado(hito, req.body?.estado, res);
      if (!cambiosEstado) return;
      await hito.update({
        campania_id: data.campania_id,
        nombre: data.nombre,
        descripcion: data.descripcion ?? null,
        status: data.status ?? 'active',
        ...cambiosEstado,
      } as any);
      return res.status(200).json({ hito });
    } catch (error) {
      return handleError(error, res);
    }
  }

  // PATCH solo modifica los campos enviados; si cambia campania_id se aplica RN-08.
  static async updatePatch(req: Request, res: Response) {
    try {
      const hito = await findHito(req, res);
      if (!hito) return;
      const data = pickCampos(req.body);
      if (data.campania_id !== undefined && !(await validarCampania(data.campania_id, res))) return;
      const cambiosEstado = resolverEstado(hito, req.body?.estado, res);
      if (!cambiosEstado) return;
      await hito.update({ ...data, ...cambiosEstado } as any);
      return res.status(200).json({ hito });
    } catch (error) {
      return handleError(error, res);
    }
  }

  static async deletePhysical(req: Request, res: Response) {
    try {
      const hito = await findHito(req, res);
      if (!hito) return;
      await hito.destroy();
      return res.status(200).json({ message: 'Hito eliminado' });
    } catch (error) {
      if (error instanceof ForeignKeyConstraintError) {
        return res.status(409).json({ message: 'No se puede eliminar: el hito tiene tareas asociadas' });
      }
      return handleError(error, res);
    }
  }

  static async deleteLogical(req: Request, res: Response) {
    try {
      const hito = await findHito(req, res);
      if (!hito) return;
      await hito.update({ status: 'inactive' });
      return res.status(200).json({ hito });
    } catch (error) {
      return handleError(error, res);
    }
  }
}
