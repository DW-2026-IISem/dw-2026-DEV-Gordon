export const ESTADOS_VERSION_ENTREGABLE = ['EN_REVISION', 'APROBADA', 'RECHAZADA'] as const;

export type EstadoVersionEntregable = (typeof ESTADOS_VERSION_ENTREGABLE)[number];

export interface VersionEntregableProps {
  id?: number;
  entregableId: number;
  numeroVersion: number;
  fechaInicio?: Date | null;
  fechaFin?: Date | null;
  total?: number | null;
  estado?: EstadoVersionEntregable;
  observaciones?: string | null;
}

export class VersionEntregable {
  readonly id?: number;
  readonly entregableId: number;
  readonly numeroVersion: number;
  readonly fechaInicio: Date | null;
  readonly fechaFin: Date | null;
  readonly total: number | null;
  readonly estado: EstadoVersionEntregable;
  readonly observaciones: string | null;

  constructor(props: VersionEntregableProps) {
    this.id = props.id;
    this.entregableId = props.entregableId;
    this.numeroVersion = props.numeroVersion;
    this.fechaInicio = props.fechaInicio ?? null;
    this.fechaFin = props.fechaFin ?? null;
    this.total = props.total ?? null;
    this.estado = props.estado ?? 'EN_REVISION';
    this.observaciones = props.observaciones ?? null;
  }
}
