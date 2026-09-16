export type VersionEstado = 'EN_REVISION' | 'APROBADA' | 'RECHAZADA';

export interface VersionEntregableProps {
  id?: number | null;
  entregableId: number;
  numeroVersion: number;
  fechaInicio?: Date | null;
  fechaFin?: Date | null;
  total?: number | null;
  estado?: VersionEstado;
  observaciones?: string | null;
}

export class VersionEntregable {
  readonly id: number | null;
  readonly entregableId: number;
  readonly numeroVersion: number;
  readonly fechaInicio: Date | null;
  readonly fechaFin: Date | null;
  readonly total: number | null;
  estado: VersionEstado;
  readonly observaciones: string | null;

  constructor(props: VersionEntregableProps) {
    this.id = props.id ?? null;
    this.entregableId = props.entregableId;
    this.numeroVersion = props.numeroVersion;
    this.fechaInicio = props.fechaInicio ?? null;
    this.fechaFin = props.fechaFin ?? null;
    this.total = props.total ?? null;
    this.estado = props.estado ?? 'EN_REVISION';
    this.observaciones = props.observaciones ?? null;
  }
}
