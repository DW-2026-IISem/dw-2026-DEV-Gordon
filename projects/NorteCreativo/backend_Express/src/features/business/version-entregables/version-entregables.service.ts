import { AppError } from '../../../shared/errors/app-error';
import { EntregablesRepository } from '../entregables/entregables.repository';
import {
  CAMPOS_DEL_SISTEMA,
  CreateVersionEntregableDto,
  PatchVersionEntregableDto,
  UpdateVersionEntregableDto,
  VersionEntregableResponseDto,
  toVersionEntregableResponse,
} from './dto';
import { VersionEntregable } from './version-entregable.model';
import { VersionEntregablesRepository } from './version-entregables.repository';

export class VersionEntregablesService {
  constructor(
    private readonly repository: VersionEntregablesRepository = new VersionEntregablesRepository(),
    private readonly entregables: EntregablesRepository = new EntregablesRepository()
  ) {}

  private async findOrFail(id: number, conEntregable = false): Promise<VersionEntregable> {
    const version = conEntregable ? await this.repository.findByIdWithEntregable(id) : await this.repository.findById(id);
    if (!version) throw new AppError(404, 'Versión de entregable no encontrada');
    return version;
  }

  // estado y numero_version los controla el sistema: si llegan en el body -> 400.
  private rechazarCamposDelSistema(body: object): void {
    const enviados = CAMPOS_DEL_SISTEMA.filter((c) => Object.prototype.hasOwnProperty.call(body, c));
    if (enviados.length === 0) return;
    throw new AppError(400, 'Error de validación', [
      `estado y numero_version los controla el sistema (recibido: ${enviados.join(', ')})`,
    ]);
  }

  // RN-04: una versión APROBADA es inmutable.
  private validarNoAprobada(version: VersionEntregable): void {
    if (version.estado === 'APROBADA') {
      throw new AppError(409, 'Una versión APROBADA no se puede modificar ni eliminar (RN-04)');
    }
  }

  // entregable_id en PUT/PATCH: no se puede mover la versión a otro entregable.
  private validarEntregableInmutable(version: VersionEntregable, entregableId: unknown): void {
    if (entregableId !== undefined && Number(entregableId) !== version.entregable_id) {
      throw new AppError(400, 'Error de validación', [
        'entregable_id no se puede cambiar: una versión pertenece siempre al mismo entregable',
      ]);
    }
  }

  // Campos editables presentes en el body (sin entregable_id ni campos del sistema).
  private editables(body: UpdateVersionEntregableDto) {
    const { fecha_inicio, fecha_fin, total, observaciones, status } = body;
    const data: Record<string, unknown> = { fecha_inicio, fecha_fin, total, observaciones, status };
    for (const k of Object.keys(data)) if (data[k] === undefined) delete data[k];
    return data;
  }

  public async getAll(): Promise<VersionEntregableResponseDto[]> {
    return (await this.repository.findAllActive()).map(toVersionEntregableResponse);
  }

  public async getOne(id: number): Promise<VersionEntregableResponseDto> {
    return toVersionEntregableResponse(await this.findOrFail(id, true));
  }

  // numero_version = siguiente número del entregable; estado siempre nace EN_REVISION.
  public async create(body: CreateVersionEntregableDto): Promise<VersionEntregableResponseDto> {
    this.rechazarCamposDelSistema(body);

    const entregableId = Number(body.entregable_id);
    if (body.entregable_id == null || !Number.isInteger(entregableId) || entregableId < 1) {
      throw new AppError(400, 'Error de validación', ['entregable_id es requerido y debe ser un entero positivo']);
    }

    const entregable = await this.entregables.findByIdWithTareaYHito(entregableId);
    if (!entregable) throw new AppError(404, 'Entregable no encontrado');

    // RN-06: un hito CERRADO no admite versiones nuevas.
    const hito = (entregable as any).tarea?.hito;
    if (hito?.estado === 'CERRADO') {
      throw new AppError(409, 'No se crean versiones para un entregable cuyo hito está CERRADO (RN-06)');
    }

    // Equivale a count + 1; se parte del máximo para no chocar con el UNIQUE si se borró una versión intermedia.
    const numeroVersion = ((await this.repository.maxNumeroVersion(entregableId)) || 0) + 1;

    const version = await this.repository.create({
      ...this.editables(body),
      entregable_id: entregableId,
      numero_version: numeroVersion,
    } as any);
    return toVersionEntregableResponse(version);
  }

  // PUT reemplaza los campos editables: los opcionales omitidos quedan en null/default.
  public async updatePut(id: number, body: UpdateVersionEntregableDto): Promise<VersionEntregableResponseDto> {
    const version = await this.findOrFail(id);
    this.rechazarCamposDelSistema(body);
    this.validarEntregableInmutable(version, body.entregable_id);
    this.validarNoAprobada(version);
    await this.repository.update(version, {
      fecha_inicio: (body.fecha_inicio as any) ?? null,
      fecha_fin: (body.fecha_fin as any) ?? null,
      total: body.total ?? null,
      observaciones: body.observaciones ?? null,
      status: body.status ?? 'active',
    });
    return toVersionEntregableResponse(version);
  }

  public async updatePatch(id: number, body: PatchVersionEntregableDto): Promise<VersionEntregableResponseDto> {
    const version = await this.findOrFail(id);
    this.rechazarCamposDelSistema(body);
    this.validarEntregableInmutable(version, body.entregable_id);
    this.validarNoAprobada(version);
    await this.repository.update(version, this.editables(body) as any);
    return toVersionEntregableResponse(version);
  }

  public async deletePhysical(id: number): Promise<void> {
    const version = await this.findOrFail(id);
    this.validarNoAprobada(version);
    await this.repository.delete(version);
  }

  public async deleteLogical(id: number): Promise<VersionEntregableResponseDto> {
    const version = await this.findOrFail(id);
    this.validarNoAprobada(version);
    await this.repository.update(version, { status: 'inactive' });
    return toVersionEntregableResponse(version);
  }
}
