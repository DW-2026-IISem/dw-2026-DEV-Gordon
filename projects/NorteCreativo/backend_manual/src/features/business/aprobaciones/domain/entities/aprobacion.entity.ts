export type AprobacionEstado = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

export interface AprobacionProps {
  id?: number | null;
  versionEntregableId: number;
  estado: AprobacionEstado;
  aprobadorId: number;
  comentario?: string | null;
  fecha?: Date;
}

export class Aprobacion {
  readonly id: number | null;
  readonly versionEntregableId: number;
  readonly estado: AprobacionEstado;
  readonly aprobadorId: number;
  readonly comentario: string | null;
  readonly fecha: Date;

  constructor(props: AprobacionProps) {
    this.id = props.id ?? null;
    this.versionEntregableId = props.versionEntregableId;
    this.estado = props.estado;
    this.aprobadorId = props.aprobadorId;
    this.comentario = props.comentario ?? null;
    this.fecha = props.fecha ?? new Date();
  }
}
