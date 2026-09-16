export type EntregableEstado = 'EN_PROCESO' | 'ENTREGADO';

export interface EntregableProps {
  id?: number | null;
  tareaId: number;
  fechaInicio?: Date | null;
  fechaFin?: Date | null;
  total?: number | null;
  estado?: EntregableEstado;
  observaciones?: string | null;
}

export class Entregable {
  readonly id: number | null;
  readonly tareaId: number;
  readonly fechaInicio: Date | null;
  readonly fechaFin: Date | null;
  readonly total: number | null;
  readonly estado: EntregableEstado;
  readonly observaciones: string | null;

  constructor(props: EntregableProps) {
    this.id = props.id ?? null;
    this.tareaId = props.tareaId;
    this.fechaInicio = props.fechaInicio ?? null;
    this.fechaFin = props.fechaFin ?? null;
    this.total = props.total ?? null;
    this.estado = props.estado ?? 'EN_PROCESO';
    this.observaciones = props.observaciones ?? null;
  }
}
