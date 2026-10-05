import { pickFields } from '../../../../shared/http/pick-fields';
import { METODOS_HTTP, STATUS_RESOURCE } from '../resource.model';

export const CAMPOS_CREATE_RESOURCE = ['method', 'path', 'description', 'status'] as const;

export interface CreateResourceDto {
  method: (typeof METODOS_HTTP)[number];
  path: string;
  description?: string | null;
  status?: (typeof STATUS_RESOURCE)[number];
}

export const toCreateResourceDto = (body: unknown): CreateResourceDto =>
  pickFields(body, CAMPOS_CREATE_RESOURCE) as unknown as CreateResourceDto;
