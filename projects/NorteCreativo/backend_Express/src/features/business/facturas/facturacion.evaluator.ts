// Reglas puras de facturación (sin Sequelize ni Express): se pueden probar sin base de datos.

export interface EntradaPresupuesto {
  presupuestoAprobado: number;
  yaFacturado: number;
  nuevoSubtotal: number;
}

// Los importes se comparan en centavos enteros para no arrastrar errores de coma flotante.
const centavos = (n: number): number => Math.round(n * 100);

export const redondear2 = (n: number): number => centavos(n) / 100;

// RN-03: el total facturado de una campaña (ya facturado + nuevo subtotal) no puede exceder su presupuesto aprobado.
export function excedePresupuesto({ presupuestoAprobado, yaFacturado, nuevoSubtotal }: EntradaPresupuesto): boolean {
  return centavos(yaFacturado) + centavos(nuevoSubtotal) > centavos(presupuestoAprobado);
}

// impuestos = subtotal × tasa; total = subtotal + impuestos (redondeados a 2 decimales).
export function calcularImportes(subtotal: number, tasaIva: number): { subtotal: number; impuestos: number; total: number } {
  const base = redondear2(subtotal);
  const impuestos = redondear2(base * tasaIva);
  return { subtotal: base, impuestos, total: redondear2(base + impuestos) };
}
