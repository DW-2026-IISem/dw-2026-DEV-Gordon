// Evidencia de ISS-23 (AC-7): facturacion.evaluator.ts es puro (sin Sequelize ni Express) y cumple RN-03.
// Uso: npx ts-node scripts/check-facturacion-evaluator.ts
import fs from 'fs';
import path from 'path';
import { calcularImportes, excedePresupuesto } from '../src/features/business/facturas/facturacion.evaluator';

let fallos = 0;
const check = (nombre: string, obtenido: unknown, esperado: unknown): void => {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado);
  if (!ok) fallos++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${nombre}${ok ? '' : ` (esperado ${JSON.stringify(esperado)}, obtenido ${JSON.stringify(obtenido)})`}`);
};

const fuente = fs.readFileSync(path.resolve(__dirname, '../src/features/business/facturas/facturacion.evaluator.ts'), 'utf8');
check('no importa sequelize', /from\s+['"]sequelize/.test(fuente), false);
check('no importa express', /from\s+['"]express/.test(fuente), false);
check('no importa nada', /^\s*import\s/m.test(fuente), false);

check('dentro del presupuesto', excedePresupuesto({ presupuestoAprobado: 1000, yaFacturado: 600, nuevoSubtotal: 300 }), false);
check('tope exacto no excede', excedePresupuesto({ presupuestoAprobado: 1000, yaFacturado: 900, nuevoSubtotal: 100 }), false);
check('1 peso de más excede', excedePresupuesto({ presupuestoAprobado: 1000, yaFacturado: 900, nuevoSubtotal: 101 }), true);
check('sin facturado previo', excedePresupuesto({ presupuestoAprobado: 500, yaFacturado: 0, nuevoSubtotal: 501 }), true);
check('decimales sin error de coma flotante (0.1+0.2 vs 0.3)', excedePresupuesto({ presupuestoAprobado: 0.3, yaFacturado: 0.1, nuevoSubtotal: 0.2 }), false);
check('determinista (misma entrada, misma salida)', [1, 2, 3].map(() => excedePresupuesto({ presupuestoAprobado: 10, yaFacturado: 5, nuevoSubtotal: 6 })), [true, true, true]);
check('importes con IVA 19%', calcularImportes(900000, 0.19), { subtotal: 900000, impuestos: 171000, total: 1071000 });
check('importes con redondeo a 2 decimales', calcularImportes(100.05, 0.19), { subtotal: 100.05, impuestos: 19.01, total: 119.06 });
check('IVA 0', calcularImportes(500, 0), { subtotal: 500, impuestos: 0, total: 500 });

console.log(fallos === 0 ? '\nOK: el evaluador es puro y cumple RN-03' : `\nFALLO: ${fallos} comprobaciones`);
process.exit(fallos === 0 ? 0 : 1);
