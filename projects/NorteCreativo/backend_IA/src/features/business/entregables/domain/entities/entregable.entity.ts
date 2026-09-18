export const ESTADO_ENTREGABLE_DEFAULT = 'EN_PROCESO';

export interface EntregableProps {
  id?: number;
  tareaId: number;
  fechaInicio?: Date | null;
  fechaFin?: Date | null;
  total?: number | null;
  estado?: string;
  observaciones?: string | null;
}

export class Entregable {
  readonly id?: number;
  readonly tareaId: number;
  readonly fechaInicio: Date | null;
  readonly fechaFin: Date | null;
  readonly total: number | null;
  readonly estado: string;
  readonly observaciones: string | null;

  constructor(props: EntregableProps) {
    this.id = props.id;
    this.tareaId = props.tareaId;
    this.fechaInicio = props.fechaInicio ?? null;
    this.fechaFin = props.fechaFin ?? null;
    this.total = props.total ?? null;
    this.estado = props.estado ?? ESTADO_ENTREGABLE_DEFAULT;
    this.observaciones = props.observaciones ?? null;
  }
}
