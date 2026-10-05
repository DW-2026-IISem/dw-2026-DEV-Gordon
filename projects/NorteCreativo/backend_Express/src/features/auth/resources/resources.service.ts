import { AppError } from '../../../shared/errors/app-error';
import { normalizePath } from '../../../shared/auth/resource-match';
import { CreateResourceDto, PatchResourceDto, ResourceResponseDto, UpdateResourceDto, toResourceResponse } from './dto';
import { METODOS_HTTP, Resource } from './resource.model';
import { ResourcesRepository } from './resources.repository';

const PATH_MAX = 191;

export class ResourcesService {
  constructor(private readonly repository: ResourcesRepository = new ResourcesRepository()) {}

  private async findOrFail(id: number): Promise<Resource> {
    const resource = await this.repository.findById(id);
    if (!resource) throw new AppError(404, 'Recurso no encontrado');
    return resource;
  }

  // method en mayúsculas y path en forma canónica (patrón con :id, sin query ni barra final).
  private normalizarMethod(method: unknown): Resource['method'] {
    const valor = typeof method === 'string' ? method.trim().toUpperCase() : '';
    if (!(METODOS_HTTP as readonly string[]).includes(valor)) {
      throw new AppError(400, 'Error de validación', [`method es requerido y debe ser uno de: ${METODOS_HTTP.join(', ')}`]);
    }
    return valor as Resource['method'];
  }

  private normalizarPath(path: unknown): string {
    if (typeof path !== 'string' || path.trim() === '') {
      throw new AppError(400, 'Error de validación', ['path es requerido y debe ser un texto no vacío']);
    }
    const canonico = normalizePath(path.trim());
    if (canonico.length > PATH_MAX) {
      throw new AppError(400, 'Error de validación', [`path no puede superar ${PATH_MAX} caracteres`]);
    }
    return canonico;
  }

  // (method, path) repetido -> 409 (se excluye al propio recurso al editar).
  private async assertOperationAvailable(method: string, path: string, excludeId?: number): Promise<void> {
    const existente = await this.repository.findByOperation(method, path);
    if (existente && existente.id !== excludeId) throw new AppError(409, 'Ya existe un recurso con ese method y path');
  }

  public async getAll(): Promise<ResourceResponseDto[]> {
    return (await this.repository.findAllActive()).map(toResourceResponse);
  }

  public async getOne(id: number): Promise<ResourceResponseDto> {
    return toResourceResponse(await this.findOrFail(id));
  }

  // Un recurso creado por la API nace activo salvo que se indique lo contrario.
  public async create(body: CreateResourceDto): Promise<ResourceResponseDto> {
    const method = this.normalizarMethod(body.method);
    const path = this.normalizarPath(body.path);
    await this.assertOperationAvailable(method, path);
    const resource = await this.repository.create({
      method,
      path,
      description: body.description ?? null,
      status: body.status ?? 'active',
    });
    return toResourceResponse(resource);
  }

  // PUT reemplaza: method y path son obligatorios; description omitida queda en null. No toca status.
  public async updatePut(id: number, body: Partial<UpdateResourceDto>): Promise<ResourceResponseDto> {
    const resource = await this.findOrFail(id);
    const method = this.normalizarMethod(body.method);
    const path = this.normalizarPath(body.path);
    await this.assertOperationAvailable(method, path, resource.id);
    await this.repository.update(resource, { method, path, description: body.description ?? null });
    return toResourceResponse(resource);
  }

  // PATCH solo modifica los campos enviados; la unicidad se evalúa con el par resultante.
  public async updatePatch(id: number, body: PatchResourceDto): Promise<ResourceResponseDto> {
    const resource = await this.findOrFail(id);
    const data: PatchResourceDto = {};
    if (body.method !== undefined) data.method = this.normalizarMethod(body.method);
    if (body.path !== undefined) data.path = this.normalizarPath(body.path);
    if (body.description !== undefined) data.description = body.description;
    if (data.method !== undefined || data.path !== undefined) {
      await this.assertOperationAvailable(data.method ?? resource.method, data.path ?? resource.path, resource.id);
    }
    await this.repository.update(resource, data);
    return toResourceResponse(resource);
  }

  public async deletePhysical(id: number): Promise<void> {
    await this.repository.delete(await this.findOrFail(id));
  }

  public async deleteLogical(id: number): Promise<ResourceResponseDto> {
    const resource = await this.findOrFail(id);
    await this.repository.update(resource, { status: 'inactive' });
    return toResourceResponse(resource);
  }
}
