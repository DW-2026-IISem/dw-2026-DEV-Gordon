export const ESTADOS_APROBACION = ['PENDIENTE', 'APROBADA', 'RECHAZADA'] as const;

export type EstadoAprobacion = (typeof ESTADOS_APROBACION)[number];

export interface AprobacionProps {
  id?: number;
  versionEntregableId: number;
  estado: EstadoAprobacion;
  aprobadorId: number;
  comentario?: string | null;
  fecha?: Date;
}

export class Aprobacion {
  readonly id?: number;
  readonly versionEntregableId: number;
  readonly estado: EstadoAprobacion;
  readonly aprobadorId: number;
  readonly comentario: string | null;
  readonly fecha: Date;

  constructor(props: AprobacionProps) {
    this.id = props.id;
    this.versionEntregableId = props.versionEntregableId;
    this.estado = props.estado;
    this.aprobadorId = props.aprobadorId;
    this.comentario = props.comentario ?? null;
    this.fecha = props.fecha ?? new Date();
  }
}
