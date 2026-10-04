import { pickFields } from '../../../../shared/http/pick-fields';
import { ESTADOS_CAMPANIA } from '../campania.model';

export const CAMPOS_CAMPANIA = ['cliente_id', 'nombre', 'descripcion', 'status'] as const;

export interface CreateCampaniaDto {
  cliente_id: number;
  nombre: string;
  descripcion?: string | null;
  status?: (typeof ESTADOS_CAMPANIA)[number];
}

export const toCreateCampaniaDto = (body: unknown): CreateCampaniaDto => pickFields(body, CAMPOS_CAMPANIA) as unknown as CreateCampaniaDto;
