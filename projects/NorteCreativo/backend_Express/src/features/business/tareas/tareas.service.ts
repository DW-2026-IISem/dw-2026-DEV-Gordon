import { AppError } from '../../../shared/errors/app-error';
import { HitosRepository } from '../hitos/hitos.repository';
import { CreateTareaDto, PatchTareaDto, TareaResponseDto, UpdateTareaDto, toTareaResponse } from './dto';
import { Tarea } from './tarea.model';
import { TareasRepository } from './tareas.repository';

export class TareasService {
  constructor(
    private readonly repository: TareasRepository = new TareasRepository(),
    private readonly hitos: HitosRepository = new HitosRepository()
  ) {}

  private async findOrFail(id: number, conHito = false): Promise<Tarea> {
    const tarea = conHito ? await this.repository.findByIdWithHito(id) : await this.repository.findById(id);
    if (!tarea) throw new AppError(404, 'Tarea no encontrada');
    return tarea;
  }

  // El hito debe existir (404). Sin regla extra sobre su estado.
  private async validarHito(hitoId: unknown): Promise<void> {
    const id = Number(hitoId);
    if (hitoId === undefined || hitoId === null || !Number.isInteger(id) || id < 1) {
      throw new AppError(400, 'Error de validación', ['hito_id es requerido y debe ser un entero positivo']);
    }
    if (!(await this.hitos.findById(id))) throw new AppError(404, 'Hito no encontrado');
  }

  public async getAll(): Promise<TareaResponseDto[]> {
    return (await this.repository.findAllActive()).map(toTareaResponse);
  }

  public async getOne(id: number): Promise<TareaResponseDto> {
    return toTareaResponse(await this.findOrFail(id, true));
  }

  public async create(body: CreateTareaDto): Promise<TareaResponseDto> {
    await this.validarHito(body.hito_id);
    return toTareaResponse(await this.repository.create(body));
  }

  // PUT reemplaza el recurso completo: los opcionales omitidos quedan en null/default.
  public async updatePut(id: number, body: UpdateTareaDto): Promise<TareaResponseDto> {
    const tarea = await this.findOrFail(id);
    await this.validarHito(body.hito_id);
    if (body.nombre === undefined) throw new AppError(400, 'Error de validación', ['nombre es requerido en PUT']);
    await this.repository.update(tarea, {
      hito_id: body.hito_id,
      nombre: body.nombre,
      descripcion: body.descripcion ?? null,
      status: body.status ?? 'active',
    });
    return toTareaResponse(tarea);
  }

  // PATCH solo modifica los campos enviados; si cambia hito_id se valida su existencia.
  public async updatePatch(id: number, body: PatchTareaDto): Promise<TareaResponseDto> {
    const tarea = await this.findOrFail(id);
    if (body.hito_id !== undefined) await this.validarHito(body.hito_id);
    await this.repository.update(tarea, body);
    return toTareaResponse(tarea);
  }

  public async deletePhysical(id: number): Promise<void> {
    await this.repository.delete(await this.findOrFail(id));
  }

  public async deleteLogical(id: number): Promise<TareaResponseDto> {
    const tarea = await this.findOrFail(id);
    await this.repository.update(tarea, { status: 'inactive' });
    return toTareaResponse(tarea);
  }
}
