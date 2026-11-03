import { Status, Timestamps } from './api';

export type TipoDocumento = 'CC' | 'NIT' | 'CE' | 'TI' | 'PASAPORTE';

export interface Cliente extends Timestamps {
  id: number;
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  status: Status;
}

export interface ClientePayload {
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombre: string;
  telefono?: string | null;
  email?: string | null;
}
