export type ClienteEstado = 'active' | 'inactive';

export interface ClienteProps {
  id?: number | null;
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  telefono?: string | null;
  email?: string | null;
  estado?: ClienteEstado;
}

export class Cliente {
  readonly id: number | null;
  readonly tipoDocumento: string;
  readonly numeroDocumento: string;
  readonly nombre: string;
  readonly telefono: string | null;
  readonly email: string | null;
  readonly estado: ClienteEstado;

  constructor(props: ClienteProps) {
    this.id = props.id ?? null;
    this.tipoDocumento = props.tipoDocumento;
    this.numeroDocumento = props.numeroDocumento;
    this.nombre = props.nombre;
    this.telefono = props.telefono ?? null;
    this.email = props.email ?? null;
    this.estado = props.estado ?? 'active';
  }
}
