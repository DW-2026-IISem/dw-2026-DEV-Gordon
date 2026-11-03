// El backend no expone un endpoint de resumen: el panel (ISS-07) lo calcula en el frontend con los listados.
export interface DashboardResumen {
  clientes_activos: number;
  campanias_activas: number;
  hitos_abiertos: number;
  hitos_cerrados: number;
  entregables_en_proceso: number;
  aprobaciones_pendientes: number;
}
