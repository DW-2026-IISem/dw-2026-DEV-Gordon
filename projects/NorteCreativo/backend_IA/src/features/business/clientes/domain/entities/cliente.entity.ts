export const TIPOS_DOCUMENTO_CLIENTE = ['CC', 'NIT', 'CE', 'TI', 'PASAPORTE'] as const;

export type TipoDocumentoCliente = (typeof TIPOS_DOCUMENTO_CLIENTE)[number];

export interface ClienteProps {
  id?: number;
  tipoDocumento: TipoDocumentoCliente;
  numeroDocumento: string;
  nombre: string;
  telefono?: string | null;
  email?: string | null;
  estado?: boolean;
}

export class Cliente {
  readonly id?: number;
  readonly tipoDocumento: TipoDocumentoCliente;
  readonly numeroDocumento: string;
  readonly nombre: string;
  readonly telefono: string | null;
  readonly email: string | null;
  readonly estado: boolean;

  constructor(props: ClienteProps) {
    this.id = props.id;
    this.tipoDocumento = props.tipoDocumento;
    this.numeroDocumento = props.numeroDocumento;
    this.nombre = props.nombre;
    this.telefono = props.telefono ?? null;
    this.email = props.email ?? null;
    this.estado = props.estado ?? true;
  }
}
