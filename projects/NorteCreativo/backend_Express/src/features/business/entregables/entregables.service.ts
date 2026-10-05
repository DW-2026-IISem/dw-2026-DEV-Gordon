import { AppError } from '../../../shared/errors/app-error';
import { TareasRepository } from '../tareas/tareas.repository';
import {
  CreateEntregableDto,
  EntregableResponseDto,
  PatchEntregableDto,
  UpdateEntregableDto,
  toEntregableResponse,
} from './dto';
import { Entregable } from './entregable.model';
import { EntregablesRepository } from './entregables.repository';

export class EntregablesService {
  constructor(
    private readonly repository: EntregablesRepository = new EntregablesRepository(),
    private readonly tareas: TareasRepository = new TareasRepository()
  ) {}

  private async findOrFail(id: number, conTarea = false): Promise<Entregable> {
    const entregable = conTarea ? await this.repository.findByIdWithTarea(id) : await this.repository.findById(id);
    if (!entregable) throw new AppError(404, 'Entregable no encontrado');
    return entregable;
  }

  // La tarea debe existir (404). Sin regla extra sobre su estado.
  private async validarTarea(tareaId: unknown): Promise<void> {
    const id = Number(tareaId);
    if (tareaId === undefined || tareaId === null || !Number.isInteger(id) || id < 1) {
      throw new AppError(400, 'Error de validación', ['tarea_id es requerido y debe ser un entero positivo']);
    }
    if (!(await this.tareas.findById(id))) throw new AppError(404, 'Tarea no encontrada');
  }

  public async getAll(): Promise<EntregableResponseDto[]> {
    return (await this.repository.findAllActive()).map(toEntregableResponse);
  }

  public async getOne(id: number): Promise<EntregableResponseDto> {
    return toEntregableResponse(await this.findOrFail(id, true));
  }

  // Si no llega fecha_inicio se asigna la fecha actual.
  public async create(body: CreateEntregableDto): Promise<EntregableResponseDto> {
    await this.validarTarea(body.tarea_id);
    const sinFecha = body.fecha_inicio === undefined || body.fecha_inicio === null || body.fecha_inicio === '';
    const data = { ...body, fecha_inicio: sinFecha ? new Date() : body.fecha_inicio };
    return toEntregableResponse(await this.repository.create(data as any));
  }

  // PUT reemplaza el recurso completo: los opcionales omitidos quedan en null/default.
  public async updatePut(id: number, body: UpdateEntregableDto): Promise<EntregableResponseDto> {
    const entregable = await this.findOrFail(id);
    await this.validarTarea(body.tarea_id);
    await this.repository.update(entregable, {
      tarea_id: body.tarea_id,
      fecha_inicio: body.fecha_inicio ?? null,
      fecha_fin: body.fecha_fin ?? null,
      total: body.total ?? null,
      estado: body.estado ?? 'EN_PROCESO',
      observaciones: body.observaciones ?? null,
      status: body.status ?? 'active',
    } as any);
    return toEntregableResponse(entregable);
  }

  // PATCH solo modifica los campos enviados; si cambia tarea_id se valida su existencia.
  public async updatePatch(id: number, body: PatchEntregableDto): Promise<EntregableResponseDto> {
    const entregable = await this.findOrFail(id);
    if (body.tarea_id !== undefined) await this.validarTarea(body.tarea_id);
    await this.repository.update(entregable, body as any);
    return toEntregableResponse(entregable);
  }

  public async deletePhysical(id: number): Promise<void> {
    await this.repository.delete(await this.findOrFail(id));
  }

  public async deleteLogical(id: number): Promise<EntregableResponseDto> {
    const entregable = await this.findOrFail(id);
    await this.repository.update(entregable, { status: 'inactive' });
    return toEntregableResponse(entregable);
  }
}
