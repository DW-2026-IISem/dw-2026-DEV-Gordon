export interface EntregableUltimaVersion {
  entregableId: number;
  ultimaVersionEstado: string | null;
}

/**
 * RN-01 + RN-02: un hito se cierra sii TODOS sus entregables tienen su
 * última versión APROBADA. Sin entregables, no hay nada que cerrar.
 */
export class CierreHitoEvaluator {
  debeCerrarHito(entregables: EntregableUltimaVersion[]): boolean {
    if (entregables.length === 0) {
      return false;
    }

    return entregables.every((entregable) => entregable.ultimaVersionEstado === 'APROBADA');
  }
}
