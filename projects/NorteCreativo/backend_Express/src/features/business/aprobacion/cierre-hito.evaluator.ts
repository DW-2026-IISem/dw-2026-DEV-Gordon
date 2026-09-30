export interface EntregableUltimaVersion {
  entregable_id: number;
  ultima_version_estado: string | null;
}

// RN-01 + RN-02: un hito cierra solo si TODOS sus entregables tienen su última versión APROBADA.
// Sin entregables no hay nada que cerrar.
export function debeCerrarHito(entregables: EntregableUltimaVersion[]): boolean {
  if (entregables.length === 0) return false;
  return entregables.every((e) => e.ultima_version_estado === 'APROBADA');
}
