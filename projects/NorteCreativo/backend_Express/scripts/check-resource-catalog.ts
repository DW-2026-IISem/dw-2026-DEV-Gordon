// Evidencia de ISS-16: cruza resource-catalog.ts con los endpoints reales (src/routes/index.ts + *.routes.ts).
// Uso: npx ts-node scripts/check-resource-catalog.ts
import fs from 'fs';
import path from 'path';
import { RESOURCE_CATALOG, RUTAS_PREVISTAS } from '../src/features/auth/resources/resource-catalog';

const SRC = path.resolve(__dirname, '../src');
const indice = fs.readFileSync(path.join(SRC, 'routes/index.ts'), 'utf8');

// import <alias> from '<ruta>/xxx.routes'  +  router.use('/base', <alias>)
const imports = new Map<string, string>();
for (const m of indice.matchAll(/import\s+(\w+)\s+from\s+'([^']+\.routes)'/g)) imports.set(m[1], m[2]);

const reales = new Set<string>();
for (const m of indice.matchAll(/router\.use\('([^']+)',\s*(\w+)\)/g)) {
  const [, base, alias] = m;
  const archivo = imports.get(alias);
  if (!archivo) continue;
  const codigo = fs.readFileSync(path.resolve(SRC, 'routes', `${archivo}.ts`), 'utf8');
  for (const r of codigo.matchAll(/router\.(get|post|put|patch|delete)\('([^']*)'/g)) {
    const ruta = `/api${base}${r[2] === '/' ? '' : r[2]}`;
    reales.add(`${r[1].toUpperCase()} ${ruta}`);
  }
}

const catalogo = new Set(RESOURCE_CATALOG.map((r) => `${r.method} ${r.path}`));
const duplicados = RESOURCE_CATALOG.length - catalogo.size;
const faltan = [...reales].filter((k) => !catalogo.has(k)).sort();
const sobran = [...catalogo].filter((k) => !reales.has(k)).sort();
const previstos = sobran.filter((k) => RUTAS_PREVISTAS.some((p) => k.split(' ')[1].startsWith(p)));
const huerfanos = sobran.filter((k) => !previstos.includes(k));

console.log(`Endpoints reales (rutas):     ${reales.size}`);
console.log(`Entradas en el catálogo:      ${RESOURCE_CATALOG.length}`);
console.log(`  con endpoint real:          ${RESOURCE_CATALOG.length - previstos.length}`);
console.log(`  previstos (ISS-17):         ${previstos.length}  ${RUTAS_PREVISTAS.join(', ')}`);
if (faltan.length) console.log(`FALTAN en el catálogo:\n  ${faltan.join('\n  ')}`);
if (huerfanos.length) console.log(`En el catálogo SIN endpoint real:\n  ${huerfanos.join('\n  ')}`);
if (duplicados) console.log(`Entradas duplicadas: ${duplicados}`);

const ok = faltan.length === 0 && huerfanos.length === 0 && duplicados === 0;
console.log(ok ? '\nOK: el catálogo cubre todos los endpoints reales' : '\nFALLO');
process.exit(ok ? 0 : 1);
