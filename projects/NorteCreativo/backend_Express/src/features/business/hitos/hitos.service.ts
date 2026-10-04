import { AppError } from '../../../shared/errors/app-error';
import { CampaniasRepository } from '../campanias/campanias.repository';
import { CAMPOS_DE_CIERRE, CreateHitoDto, HitoResponseDto, PatchHitoDto, UpdateHitoDto, toHitoResponse } from './dto';
import { Hito } from './hito.model';
import { HitosRepository } from './hitos.repository';

export class HitosService {
  constructor(
    private readonly repository: HitosRepository = new HitosRepository(),
    private readonly campanias: CampaniasRepository = new CampaniasRepository()
  ) {}

  private async findOrFail(id: number, conCampania = false): Promise<Hito> {
    const hito = conCampania ? await this.repository.findByIdWithCampania(id) : await this.repository.findById(id);
    if (!hito) throw new AppError(404, 'Hito no encontrado');
    return hito;
  }

  // RN-08: la campaña debe existir (404) y estar activa (409).
  private async validarCampania(campaniaId: unknown): Promise<void> {
    const id = Number(campaniaId);
    if (campaniaId === undefined || campaniaId === null || !Number.isInteger(id) || id < 1) {
      throw new AppError(400, 'Error de validación', ['campania_id es requerido y debe ser un entero positivo']);
    }
    const campania = await this.campanias.findById(id);
    if (!campania) throw new AppError(404, 'Campaña no encontrada');
    if (campania.status === 'inactive') throw new AppError(409, 'No se crea hito para una campaña inactiva');
  }

  // El estado del hito solo lo cambia una aprobación: estado o fecha_cierre en el body -> 400.
  private rechazarCamposDeCierre(body: object): void {
    const enviados = CAMPOS_DE_CIERRE.filter((c) => Object.prototype.hasOwnProperty.call(body, c));
    if (enviados.length === 0) return;
    throw new AppError(400, 'Error de validación', [
      `el estado del hito solo lo cambia una aprobación (recibido: ${enviados.join(', ')})`,
    ]);
  }

  public async getAll(): Promise<HitoResponseDto[]> {
    return (await this.repository.findAllActive()).map(toHitoResponse);
  }

  public async getOne(id: number): Promise<HitoResponseDto> {
    return toHitoResponse(await this.findOrFail(id, true));
  }

  // Siempre nace ABIERTO con fecha_cierre null.
  public async create(body: CreateHitoDto): Promise<HitoResponseDto> {
    this.rechazarCamposDeCierre(body);
    await this.validarCampania(body.campania_id);
    return toHitoResponse(await this.repository.create({ ...body, estado: 'ABIERTO', fecha_cierre: null }));
  }

  // PUT reemplaza los campos de negocio; el estado no es editable por HTTP.
  public async updatePut(id: number, body: UpdateHitoDto): Promise<HitoResponseDto> {
    const hito = await this.findOrFail(id);
    this.rechazarCamposDeCierre(body);
    await this.validarCampania(body.campania_id);
    if (body.nombre === undefined) throw new AppError(400, 'Error de validación', ['nombre es requerido en PUT']);
    await this.repository.update(hito, {
      campania_id: body.campania_id,
      nombre: body.nombre,
      descripcion: body.descripcion ?? null,
      status: body.status ?? 'active',
    });
    return toHitoResponse(hito);
  }

  // PATCH solo modifica los campos enviados; si cambia campania_id se aplica RN-08.
  public async updatePatch(id: number, body: PatchHitoDto): Promise<HitoResponseDto> {
    const hito = await this.findOrFail(id);
    this.rechazarCamposDeCierre(body);
    if (body.campania_id !== undefined) await this.validarCampania(body.campania_id);
    await this.repository.update(hito, body);
    return toHitoResponse(hito);
  }

  public async deletePhysical(id: number): Promise<void> {
    await this.repository.delete(await this.findOrFail(id));
  }

  public async deleteLogical(id: number): Promise<HitoResponseDto> {
    const hito = await this.findOrFail(id);
    await this.repository.update(hito, { status: 'inactive' });
    return toHitoResponse(hito);
  }
}
