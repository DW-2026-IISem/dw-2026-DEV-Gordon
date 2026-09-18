export interface TareaProps {
  id?: number;
  hitoId: number;
  nombre: string;
  descripcion?: string | null;
  isActive?: boolean;
}

export class Tarea {
  readonly id?: number;
  readonly hitoId: number;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly isActive: boolean;

  constructor(props: TareaProps) {
    this.id = props.id;
    this.hitoId = props.hitoId;
    this.nombre = props.nombre;
    this.descripcion = props.descripcion ?? null;
    this.isActive = props.isActive ?? true;
  }
}
