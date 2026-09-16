export interface EntregableConEstado {
  entregableId: number;
  ultimaVersionEstado: 'EN_REVISION' | 'APROBADA' | 'RECHAZADA' | null;
}

export class CierreHitoEvaluator {
  // RN-01 + RN-02: el hito se cierra si y solo si TODOS los entregables
  // tienen su ultima version en estado APROBADA. Basta un RECHAZADA o
  // EN_REVISION (o ausente) para que el hito permanezca ABIERTO.
  debeCerrarHito(entregables: EntregableConEstado[]): boolean {
    if (entregables.length === 0) {
      return false;
    }
    return entregables.every((e) => e.ultimaVersionEstado === 'APROBADA');
  }
}
