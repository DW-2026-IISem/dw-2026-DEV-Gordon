import { pickFields } from '../../../../shared/http/pick-fields';

// numero, importes y estado NO son entradas: los calcula el sistema.
export const CAMPOS_FACTURA = ['campania_id', 'hito_ids'] as const;

export interface CreateFacturaDto {
  campania_id: number;
  hito_ids: number[];
}

// El service valida el contenido: aquí solo se filtran los campos permitidos.
export const toCreateFacturaDto = (body: unknown): CreateFacturaDto => pickFields(body, CAMPOS_FACTURA) as unknown as CreateFacturaDto;
