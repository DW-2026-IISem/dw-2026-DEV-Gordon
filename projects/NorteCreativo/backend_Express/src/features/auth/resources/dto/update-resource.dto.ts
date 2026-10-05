import { pickFields } from '../../../../shared/http/pick-fields';
import { METODOS_HTTP } from '../resource.model';

// PUT/PATCH no editan status: el estado cambia solo por el borrado lógico.
export const CAMPOS_UPDATE_RESOURCE = ['method', 'path', 'description'] as const;

export interface UpdateResourceDto {
  method: (typeof METODOS_HTTP)[number];
  path: string;
  description?: string | null;
}

export const toUpdateResourceDto = (body: unknown): Partial<UpdateResourceDto> =>
  pickFields(body, CAMPOS_UPDATE_RESOURCE) as Partial<UpdateResourceDto>;
