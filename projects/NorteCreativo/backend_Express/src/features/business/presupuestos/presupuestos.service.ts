import { AppError } from '../../../shared/errors/app-error';
import { CampaniasRepository } from '../campanias/campanias.repository';
import {
  CreatePresupuestoDto,
  PatchPresupuestoDto,
  PresupuestoResponseDto,
  UpdatePresupuestoDto,
  toPresupuestoResponse,
} from './dto';
import { ESTADOS_PRESUPUESTO, Presupuesto, STATUS_PRESUPUESTO } from './presupuesto.model';
import { PresupuestosRepository } from './presupuestos.repository';

const MSG_APROBADO = 'El presupuesto está APROBADO: ya respalda la facturación y no se edita ni se desactiva';

export class PresupuestosService {
  constructor(
    private readonly repository: PresupuestosRepository = new PresupuestosRepository(),
    private readonly campanias: CampaniasRepository = new CampaniasRepository()
  ) {}

  private async findOrFail(id: number, conCampania = false): Promise<Presupuesto> {
    const presupuesto = conCampania ? await this.repository.findByIdWithCampania(id) : await this.repository.findById(id);
    if (!presupuesto) throw new AppError(404, 'Presupuesto no encontrado');
    return presupuesto;
  }

  // La campaña debe existir (404) y estar activa (409), igual que RN-08 para hitos.
  private async validarCampania(campaniaId: unknown): Promise<void> {
    const id = Number(campaniaId);
    if (campaniaId === undefined || campaniaId === null || campaniaId === '' || !Number.isInteger(id) || id < 1) {
      throw new AppError(400, 'Error de validación', ['campania_id es requerido y debe ser un entero positivo']);
    }
    const campania = await this.campanias.findById(id);
    if (!campania) throw new AppError(404, 'Campaña no encontrada');
    if (campania.status === 'inactive') throw new AppError(409, 'No se crea presupuesto para una campaña inactiva');
  }

  // Valida los campos presentes (sin exigir los requeridos: eso lo decide cada operación).
  private validarCampos(body: PatchPresupuestoDto): void {
    const errores: string[] = [];
    if (body.valor !== undefined) {
      const crudo: unknown = body.valor;
      const n = typeof crudo === 'number' ? crudo : typeof crudo === 'string' && crudo.trim() !== '' ? Number(crudo) : NaN;
      if (!Number.isFinite(n) || n <= 0) errores.push('valor debe ser un número mayor que 0');
      else if (n >= 1e12) errores.push('valor excede el máximo permitido');
    }
    if (body.estado !== undefined && !(ESTADOS_PRESUPUESTO as readonly string[]).includes(body.estado as string)) {
      errores.push(`estado debe ser uno de: ${ESTADOS_PRESUPUESTO.join(', ')}`);
    }
    if (body.status !== undefined && !(STATUS_PRESUPUESTO as readonly string[]).includes(body.status as string)) {
      errores.push(`status debe ser uno de: ${STATUS_PRESUPUESTO.join(', ')}`);
    }
    if (body.fecha !== undefined && Number.isNaN(new Date(body.fecha).getTime())) {
      errores.push('fecha debe ser una fecha válida');
    }
    if (body.observaciones !== undefined && body.observaciones !== null && typeof body.observaciones !== 'string') {
      errores.push('observaciones debe ser texto');
    }
    if (errores.length > 0) throw new AppError(400, 'Error de validación', errores);
  }

  // Un presupuesto APROBADO es inmutable (protege lo que respalda las facturas).
  private rechazarSiAprobado(presupuesto: Presupuesto): void {
    if (presupuesto.estado === 'APROBADO') throw new AppError(409, MSG_APROBADO);
  }

  public async getAll(): Promise<PresupuestoResponseDto[]> {
    return (await this.repository.findAllActive()).map(toPresupuestoResponse);
  }

  public async getOne(id: number): Promise<PresupuestoResponseDto> {
    return toPresupuestoResponse(await this.findOrFail(id, true));
  }

  public async create(body: CreatePresupuestoDto): Promise<PresupuestoResponseDto> {
    this.validarCampos(body);
    await this.validarCampania(body.campania_id);
    if (body.valor === undefined) throw new AppError(400, 'Error de validación', ['valor es requerido']);
    return toPresupuestoResponse(await this.repository.create(body));
  }

  // PUT reemplaza el recurso completo: los opcionales omitidos quedan en null/default.
  public async updatePut(id: number, body: UpdatePresupuestoDto): Promise<PresupuestoResponseDto> {
    const presupuesto = await this.findOrFail(id);
    this.rechazarSiAprobado(presupuesto);
    this.validarCampos(body);
    await this.validarCampania(body.campania_id);
    if (body.valor === undefined) throw new AppError(400, 'Error de validación', ['valor es requerido en PUT']);
    await this.repository.update(presupuesto, {
      campania_id: body.campania_id,
      fecha: body.fecha !== undefined ? new Date(body.fecha) : new Date(),
      valor: body.valor,
      estado: body.estado ?? 'BORRADOR',
      observaciones: body.observaciones ?? null,
      status: body.status ?? 'active',
    });
    return toPresupuestoResponse(presupuesto);
  }

  // PATCH solo modifica los campos enviados. BORRADOR -> APROBADO es la única forma de aprobar; después queda inmutable.
  public async updatePatch(id: number, body: PatchPresupuestoDto): Promise<PresupuestoResponseDto> {
    const presupuesto = await this.findOrFail(id);
    this.rechazarSiAprobado(presupuesto);
    this.validarCampos(body);
    if (body.campania_id !== undefined) await this.validarCampania(body.campania_id);
    await this.repository.update(presupuesto, body);
    return toPresupuestoResponse(presupuesto);
  }

  public async deletePhysical(id: number): Promise<void> {
    const presupuesto = await this.findOrFail(id);
    this.rechazarSiAprobado(presupuesto);
    await this.repository.delete(presupuesto);
  }

  public async deleteLogical(id: number): Promise<PresupuestoResponseDto> {
    const presupuesto = await this.findOrFail(id);
    this.rechazarSiAprobado(presupuesto);
    await this.repository.update(presupuesto, { status: 'inactive' });
    return toPresupuestoResponse(presupuesto);
  }
}
