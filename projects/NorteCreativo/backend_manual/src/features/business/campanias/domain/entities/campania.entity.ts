export interface CampaniaProps {
  id?: number | null;
  clienteId: number;
  nombre: string;
  descripcion?: string | null;
  isActive?: boolean;
}

export class Campania {
  readonly id: number | null;
  readonly clienteId: number;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly isActive: boolean;

  constructor(props: CampaniaProps) {
    this.id = props.id ?? null;
    this.clienteId = props.clienteId;
    this.nombre = props.nombre;
    this.descripcion = props.descripcion ?? null;
    this.isActive = props.isActive ?? true;
  }
}
