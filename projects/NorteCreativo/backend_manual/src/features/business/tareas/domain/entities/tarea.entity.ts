export interface TareaProps {
  id?: number | null;
  hitoId: number;
  nombre: string;
  descripcion?: string | null;
  isActive?: boolean;
}

export class Tarea {
  readonly id: number | null;
  readonly hitoId: number;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly isActive: boolean;

  constructor(props: TareaProps) {
    this.id = props.id ?? null;
    this.hitoId = props.hitoId;
    this.nombre = props.nombre;
    this.descripcion = props.descripcion ?? null;
    this.isActive = props.isActive ?? true;
  }
}
