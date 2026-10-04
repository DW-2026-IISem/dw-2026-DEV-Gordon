import { AppError } from '../../../shared/errors/app-error';
import { ClientesRepository } from '../clientes/clientes.repository';
import { Campania } from './campania.model';
import { CampaniasRepository } from './campanias.repository';
import {
  CampaniaResponseDto,
  CreateCampaniaDto,
  PatchCampaniaDto,
  UpdateCampaniaDto,
  toCampaniaResponse,
} from './dto';

export class CampaniasService {
  constructor(
    private readonly repository: CampaniasRepository = new CampaniasRepository(),
    private readonly clientes: ClientesRepository = new ClientesRepository()
  ) {}

  private async findOrFail(id: number, conCliente = false): Promise<Campania> {
    const campania = conCliente ? await this.repository.findByIdWithCliente(id) : await this.repository.findById(id);
    if (!campania) throw new AppError(404, 'Campaña no encontrada');
    return campania;
  }

  // El cliente debe existir (404) y estar activo (409): un cliente inactivo no admite campañas.
  private async validarCliente(clienteId: unknown): Promise<void> {
    const id = Number(clienteId);
    if (clienteId === undefined || clienteId === null || !Number.isInteger(id) || id < 1) {
      throw new AppError(400, 'Error de validación', ['cliente_id es requerido y debe ser un entero positivo']);
    }
    const cliente = await this.clientes.findById(id);
    if (!cliente) throw new AppError(404, 'Cliente no encontrado');
    if (cliente.status === 'inactive') throw new AppError(409, 'No se crea campaña para un cliente inactivo');
  }

  public async getAll(): Promise<CampaniaResponseDto[]> {
    return (await this.repository.findAllActive()).map(toCampaniaResponse);
  }

  public async getOne(id: number): Promise<CampaniaResponseDto> {
    return toCampaniaResponse(await this.findOrFail(id, true));
  }

  public async create(body: CreateCampaniaDto): Promise<CampaniaResponseDto> {
    await this.validarCliente(body.cliente_id);
    return toCampaniaResponse(await this.repository.create(body));
  }

  // PUT reemplaza el recurso completo: los opcionales omitidos quedan en null/default.
  public async updatePut(id: number, body: UpdateCampaniaDto): Promise<CampaniaResponseDto> {
    const campania = await this.findOrFail(id);
    await this.validarCliente(body.cliente_id);
    if (body.nombre === undefined) throw new AppError(400, 'Error de validación', ['nombre es requerido en PUT']);
    await this.repository.update(campania, {
      cliente_id: body.cliente_id,
      nombre: body.nombre,
      descripcion: body.descripcion ?? null,
      status: body.status ?? 'active',
    });
    return toCampaniaResponse(campania);
  }

  // PATCH solo modifica los campos enviados; si cambia cliente_id se aplica la misma regla que en create.
  public async updatePatch(id: number, body: PatchCampaniaDto): Promise<CampaniaResponseDto> {
    const campania = await this.findOrFail(id);
    if (body.cliente_id !== undefined) await this.validarCliente(body.cliente_id);
    await this.repository.update(campania, body);
    return toCampaniaResponse(campania);
  }

  public async deletePhysical(id: number): Promise<void> {
    await this.repository.delete(await this.findOrFail(id));
  }

  public async deleteLogical(id: number): Promise<CampaniaResponseDto> {
    const campania = await this.findOrFail(id);
    await this.repository.update(campania, { status: 'inactive' });
    return toCampaniaResponse(campania);
  }
}
