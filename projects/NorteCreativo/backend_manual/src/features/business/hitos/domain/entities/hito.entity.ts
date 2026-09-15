import { HitoYaCerradoException } from '../exceptions/hito-ya-cerrado.exception.js';

export type HitoEstado = 'ABIERTO' | 'CERRADO' | 'FACTURADO';

export interface HitoProps {
  id?: number | null;
  campaniaId: number;
  nombre: string;
  descripcion?: string | null;
  estado?: HitoEstado;
  fechaCierre?: Date | null;
  isActive?: boolean;
}

export class Hito {
  readonly id: number | null;
  readonly campaniaId: number;
  readonly nombre: string;
  readonly descripcion: string | null;
  estado: HitoEstado;
  fechaCierre: Date | null;
  readonly isActive: boolean;

  constructor(props: HitoProps) {
    this.id = props.id ?? null;
    this.campaniaId = props.campaniaId;
    this.nombre = props.nombre;
    this.descripcion = props.descripcion ?? null;
    this.estado = props.estado ?? 'ABIERTO';
    this.fechaCierre = props.fechaCierre ?? null;
    this.isActive = props.isActive ?? true;
  }

  // RN-02: el hito se cierra automáticamente cuando todos sus entregables
  // tienen su versión más reciente APROBADA (ver feature aprobaciones).
  // RN-06: un hito cerrado no admite nuevas versiones ni aprobaciones.
  cerrar(): void {
    if (this.estado !== 'ABIERTO') {
      throw new HitoYaCerradoException(this.id);
    }
    this.estado = 'CERRADO';
    this.fechaCierre = new Date();
  }

  estaAbierto(): boolean {
    return this.estado === 'ABIERTO';
  }
}
