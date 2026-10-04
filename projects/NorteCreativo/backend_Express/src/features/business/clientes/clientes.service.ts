import { AppError } from '../../../shared/errors/app-error';
import { Cliente } from './cliente.model';
import { ClientesRepository } from './clientes.repository';
import {
  ClienteResponseDto,
  CreateClienteDto,
  PatchClienteDto,
  UpdateClienteDto,
  toClienteResponse,
} from './dto';

const MSG_NUMERO_DOCUMENTO = 'El numero_documento ya está registrado';

export class ClientesService {
  constructor(private readonly repository: ClientesRepository = new ClientesRepository()) {}

  private async findOrFail(id: number): Promise<Cliente> {
    const cliente = await this.repository.findById(id);
    if (!cliente) throw new AppError(404, 'Cliente no encontrado');
    return cliente;
  }

  // numero_documento es único (409). Si no es un string no vacío lo valida el modelo (400).
  private async validarNumeroDocumentoUnico(numeroDocumento: unknown, idPropio?: number): Promise<void> {
    if (typeof numeroDocumento !== 'string' || numeroDocumento === '') return;
    const existente = await this.repository.findByNumeroDocumento(numeroDocumento);
    if (existente && existente.id !== idPropio) throw new AppError(409, MSG_NUMERO_DOCUMENTO);
  }

  public async getAll(): Promise<ClienteResponseDto[]> {
    return (await this.repository.findAllActive()).map(toClienteResponse);
  }

  public async getOne(id: number): Promise<ClienteResponseDto> {
    return toClienteResponse(await this.findOrFail(id));
  }

  public async create(body: CreateClienteDto): Promise<ClienteResponseDto> {
    await this.validarNumeroDocumentoUnico(body.numero_documento);
    return toClienteResponse(await this.repository.create(body));
  }

  // PUT reemplaza el recurso completo: los opcionales omitidos quedan en null/default.
  public async updatePut(id: number, body: UpdateClienteDto): Promise<ClienteResponseDto> {
    const cliente = await this.findOrFail(id);
    const faltantes = (['tipo_documento', 'numero_documento', 'nombre'] as const).filter((c) => body[c] === undefined);
    if (faltantes.length > 0) {
      throw new AppError(
        400,
        'Error de validación',
        faltantes.map((c) => `${c} es requerido en PUT`)
      );
    }
    await this.validarNumeroDocumentoUnico(body.numero_documento, cliente.id);
    await this.repository.update(cliente, {
      tipo_documento: body.tipo_documento,
      numero_documento: body.numero_documento,
      nombre: body.nombre,
      telefono: body.telefono ?? null,
      email: body.email ?? null,
      status: body.status ?? 'active',
    });
    return toClienteResponse(cliente);
  }

  // PATCH solo modifica los campos enviados.
  public async updatePatch(id: number, body: PatchClienteDto): Promise<ClienteResponseDto> {
    const cliente = await this.findOrFail(id);
    await this.validarNumeroDocumentoUnico(body.numero_documento, cliente.id);
    await this.repository.update(cliente, body);
    return toClienteResponse(cliente);
  }

  public async deletePhysical(id: number): Promise<void> {
    await this.repository.delete(await this.findOrFail(id));
  }

  public async deleteLogical(id: number): Promise<ClienteResponseDto> {
    const cliente = await this.findOrFail(id);
    await this.repository.update(cliente, { status: 'inactive' });
    return toClienteResponse(cliente);
  }
}
