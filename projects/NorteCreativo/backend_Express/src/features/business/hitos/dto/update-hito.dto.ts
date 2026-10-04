import { pickFields } from '../../../../shared/http/pick-fields';
import { CAMPOS_DE_CIERRE, CAMPOS_HITO, CreateHitoDto } from './create-hito.dto';

// PUT reemplaza los campos de negocio: campania_id y nombre son obligatorios.
export type UpdateHitoDto = Partial<CreateHitoDto>;

export const toUpdateHitoDto = (body: unknown): UpdateHitoDto => pickFields(body, [...CAMPOS_HITO, ...CAMPOS_DE_CIERRE]) as UpdateHitoDto;
