import { HitoYaCerradoException } from '../exceptions/hito-ya-cerrado.exception.js';

export const ESTADOS_HITO = ['ABIERTO', 'CERRADO', 'FACTURADO'] as const;

export type EstadoHito = (typeof ESTADOS_HITO)[number];

export interface HitoProps {
  id?: number;
  campaniaId: number;
  nombre: string;
  descripcion?: string | null;
  estado?: EstadoHito;
  fechaCierre?: Date | null;
  isActive?: boolean;
}

export class Hito {
  readonly id?: number;
  readonly campaniaId: number;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly isActive: boolean;

  private _estado: EstadoHito;
  private _fechaCierre: Date | null;

  constructor(props: HitoProps) {
    this.id = props.id;
    this.campaniaId = props.campaniaId;
    this.nombre = props.nombre;
    this.descripcion = props.descripcion ?? null;
    this._estado = props.estado ?? 'ABIERTO';
    this._fechaCierre = props.fechaCierre ?? null;
    this.isActive = props.isActive ?? true;
  }

  get estado(): EstadoHito {
    return this._estado;
  }

  get fechaCierre(): Date | null {
    return this._fechaCierre;
  }

  /**
   * RN-06: solo puede cerrarse un hito ABIERTO.
   */
  cerrar(): void {
    if (this._estado !== 'ABIERTO') {
      throw new HitoYaCerradoException(this.id as number);
    }

    this._estado = 'CERRADO';
    this._fechaCierre = new Date();
  }
}
