import { pickFields } from '../../../../shared/http/pick-fields';
import { ESTADOS_CLIENTE, TIPOS_DOCUMENTO } from '../cliente.model';

export const CAMPOS_CLIENTE = ['tipo_documento', 'numero_documento', 'nombre', 'telefono', 'email', 'status'] as const;

export interface CreateClienteDto {
  tipo_documento: (typeof TIPOS_DOCUMENTO)[number];
  numero_documento: string;
  nombre: string;
  telefono?: string | null;
  email?: string | null;
  status?: (typeof ESTADOS_CLIENTE)[number];
}

export const toCreateClienteDto = (body: unknown): CreateClienteDto => pickFields(body, CAMPOS_CLIENTE) as unknown as CreateClienteDto;
