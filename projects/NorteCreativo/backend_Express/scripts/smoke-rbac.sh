#!/usr/bin/env bash
# Smoke test de las 3 modalidades de acceso y de la RN-05. Sale con código 0 si TODO pasa y con código 1 si algo falla.
#
# Uso (desde backend_Express, con el servidor corriendo y la base sembrada con `npm run db:seed`):
#     bash scripts/smoke-rbac.sh
# Variable opcional: BASE (por defecto http://localhost:3012/api).
# Usa los usuarios de LABORATORIO del seed (ver README). Solo necesita curl y node: no usa Docker ni la base directamente.
#
# Efecto en los datos: para probar el 201 de la RN-05 crea una cadena de prueba (cliente > campaña > hito > tarea >
# entregable > versión) y la desactiva al terminar. La aprobación (RECHAZADA, "smoke-rbac") queda registrada porque las
# aprobaciones son un registro de auditoría sin DELETE; no cierra ningún hito.
set -u

# Con el servidor apagado un curl a un puerto cerrado puede quedarse colgado: se limitan los tiempos.
# User-Agent propio: así las sesiones que crea se pueden distinguir y borrar sin tocar las reales.
curl() { command curl --connect-timeout 5 --max-time 60 -A "${SMOKE_UA:-smoke-rbac}" "$@"; }

BASE=${BASE:-http://localhost:3012/api}
PASS_ADMIN=${PASS_ADMIN:-Admin123!}
PASS_CUENTAS=${PASS_CUENTAS:-Cuentas123!}
PASS_CREATIVO=${PASS_CREATIVO:-Creativo123!}
PASS_APROBADOR=${PASS_APROBADOR:-Aprobador123!}
PASS_FINANZAS=${PASS_FINANZAS:-Finanzas123!}

TOTAL=0
FALLOS=0
ok()   { TOTAL=$((TOTAL + 1)); echo "  PASS  $1"; }
fail() { TOTAL=$((TOTAL + 1)); FALLOS=$((FALLOS + 1)); echo "  FAIL  $1"; }
check() { # check "descripción" esperado obtenido
  if [ "$2" = "$3" ]; then ok "$1 -> $3"; else fail "$1 (esperado $2, obtenido $3)"; fi
}

codigo() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
jget()   { node -pe "let v; try { v = JSON.parse(require('fs').readFileSync(0))$2 } catch (e) {} v === undefined ? '' : (typeof v === 'object' ? JSON.stringify(v) : v)" <<<"$1"; }
login()  { curl -s -X POST "$BASE/sesion/login" -H 'Content-Type: application/json' -d "{\"identifier\":\"$1\",\"password\":\"$2\"}"; }
auth()   { printf 'Authorization: Bearer %s' "$1"; }
post()   { # post TOKEN RUTA JSON -> cuerpo
  curl -s -X POST "$BASE$2" -H 'Content-Type: application/json' -H "$(auth "$1")" -d "$3"; }

if [ "$(codigo "$BASE/health")" != "200" ]; then
  echo "El servidor no responde en $BASE (¿está corriendo npm run dev y sembraste con npm run db:seed?)"; exit 1
fi

echo "== Modalidad OPEN (sin credencial)"
check "GET /health sin token" 200 "$(codigo "$BASE/health")"
check "GET /docs.json sin token" 200 "$(codigo "$BASE/docs.json")"
check "login con contraseña mala" 401 "$(codigo -X POST "$BASE/sesion/login" -H 'Content-Type: application/json' -d '{"identifier":"admin","password":"mala"}')"

R_ADMIN=$(login admin "$PASS_ADMIN");       T_ADMIN=$(jget "$R_ADMIN" .access_token)
R_CUENTAS=$(login cuentas "$PASS_CUENTAS"); T_CUENTAS=$(jget "$R_CUENTAS" .access_token)
R_CREATIVO=$(login creativo "$PASS_CREATIVO"); T_CREATIVO=$(jget "$R_CREATIVO" .access_token)
R_APROBADOR=$(login aprobador "$PASS_APROBADOR"); T_APROBADOR=$(jget "$R_APROBADOR" .access_token)
R_FINANZAS=$(login finanzas "$PASS_FINANZAS"); T_FINANZAS=$(jget "$R_FINANZAS" .access_token)
for ROL in ADMIN CUENTAS CREATIVO APROBADOR FINANZAS; do
  V=T_$ROL; if [ -n "${!V}" ]; then ok "login de $(echo "$ROL" | tr 'A-Z' 'a-z') devuelve access_token"; else fail "login de $(echo "$ROL" | tr 'A-Z' 'a-z') no devolvió access_token"; fi
done
if [ -z "$T_ADMIN" ] || [ -z "$T_APROBADOR" ] || [ -z "$T_FINANZAS" ] || [ -z "$T_CREATIVO" ] || [ -z "$T_CUENTAS" ]; then
  echo "No se pudo iniciar sesión con los usuarios de laboratorio (¿corriste npm run db:seed?)"; exit 1
fi

echo "== Modalidad JWT (solo authenticate)"
check "GET /sesion/perfil sin token" 401 "$(codigo "$BASE/sesion/perfil")"
check "GET /sesion/perfil con token basura" 401 "$(codigo "$BASE/sesion/perfil" -H 'Authorization: Bearer abc.def.ghi')"
check "GET /sesion/perfil con token válido" 200 "$(codigo "$BASE/sesion/perfil" -H "$(auth "$T_FINANZAS")")"
PERFIL=$(curl -s "$BASE/sesion/perfil" -H "$(auth "$T_FINANZAS")")
check "el perfil es del usuario del token" finanzas "$(jget "$PERFIL" .usuario.username)"
check "GET /permisos con token válido" 200 "$(codigo "$BASE/permisos" -H "$(auth "$T_FINANZAS")")"
check "GET /permisos sin token" 401 "$(codigo "$BASE/permisos")"

echo "== Modalidad JWT + RBAC: negocio"
check "GET /clientes sin token" 401 "$(codigo "$BASE/clientes")"
check "GET /campanias sin token" 401 "$(codigo "$BASE/campanias")"
check "GET /aprobaciones sin token" 401 "$(codigo "$BASE/aprobaciones")"
check "finanzas GET /clientes (lectura concedida)" 200 "$(codigo "$BASE/clientes" -H "$(auth "$T_FINANZAS")")"
check "finanzas POST /clientes (sin concesión)" 403 "$(codigo -X POST "$BASE/clientes" -H 'Content-Type: application/json' -H "$(auth "$T_FINANZAS")" -d '{}')"
check "finanzas GET /entregables (sin concesión)" 403 "$(codigo "$BASE/entregables" -H "$(auth "$T_FINANZAS")")"
check "cuentas GET /clientes (lectura concedida)" 200 "$(codigo "$BASE/clientes" -H "$(auth "$T_CUENTAS")")"
check "cuentas POST /clientes (solo lectura)" 403 "$(codigo -X POST "$BASE/clientes" -H 'Content-Type: application/json' -H "$(auth "$T_CUENTAS")" -d '{}')"
check "creativo GET /clientes (sin concesión)" 403 "$(codigo "$BASE/clientes" -H "$(auth "$T_CREATIVO")")"
check "creativo GET /campanias (lectura concedida)" 200 "$(codigo "$BASE/campanias" -H "$(auth "$T_CREATIVO")")"
check "creativo POST /campanias (solo lectura)" 403 "$(codigo -X POST "$BASE/campanias" -H 'Content-Type: application/json' -H "$(auth "$T_CREATIVO")" -d '{}')"
check "aprobador GET /entregables (lectura concedida)" 200 "$(codigo "$BASE/entregables" -H "$(auth "$T_APROBADOR")")"
check "aprobador POST /entregables (solo lectura)" 403 "$(codigo -X POST "$BASE/entregables" -H 'Content-Type: application/json' -H "$(auth "$T_APROBADOR")" -d '{}')"
check "admin GET /clientes" 200 "$(codigo "$BASE/clientes" -H "$(auth "$T_ADMIN")")"

echo "== Modalidad JWT + RBAC: administración de seguridad"
check "admin GET /usuarios" 200 "$(codigo "$BASE/usuarios" -H "$(auth "$T_ADMIN")")"
check "finanzas GET /usuarios" 403 "$(codigo "$BASE/usuarios" -H "$(auth "$T_FINANZAS")")"
check "creativo GET /concesiones-rol" 403 "$(codigo "$BASE/concesiones-rol" -H "$(auth "$T_CREATIVO")")"

echo "== RN-05: solo CLIENTE_APROBADOR aprueba y el aprobador sale del token"
# Cadena de prueba creada por admin (que tiene concedido todo el negocio salvo aprobar)
SUFIJO=$(date +%s)
R=$(post "$T_ADMIN" /clientes "{\"tipo_documento\":\"NIT\",\"numero_documento\":\"SMOKE$SUFIJO\",\"nombre\":\"SMOKE-RBAC $SUFIJO\"}"); CLI=$(jget "$R" .cliente.id)
R=$(post "$T_ADMIN" /campanias "{\"cliente_id\":${CLI:-0},\"nombre\":\"SMOKE-RBAC $SUFIJO\"}"); CAM=$(jget "$R" .campania.id)
R=$(post "$T_ADMIN" /hitos "{\"campania_id\":${CAM:-0},\"nombre\":\"SMOKE-RBAC $SUFIJO\"}"); HIT=$(jget "$R" .hito.id)
R=$(post "$T_ADMIN" /tareas "{\"hito_id\":${HIT:-0},\"nombre\":\"SMOKE-RBAC $SUFIJO\"}"); TAR=$(jget "$R" .tarea.id)
R=$(post "$T_ADMIN" /entregables "{\"tarea_id\":${TAR:-0}}"); ENT=$(jget "$R" .entregable.id)
R=$(post "$T_ADMIN" /version-entregables "{\"entregable_id\":${ENT:-0}}"); VER=$(jget "$R" .version.id)
if [ -n "$VER" ]; then ok "cadena de prueba creada por admin (versión $VER)"; else fail "no se pudo crear la cadena de prueba: $R"; fi

APROBADOR_ID=$(jget "$(curl -s "$BASE/sesion/perfil" -H "$(auth "$T_APROBADOR")")" .usuario.id)
CUERPO="{\"version_entregable_id\":${VER:-0},\"estado\":\"RECHAZADA\",\"comentario\":\"smoke-rbac\"}"
check "creativo POST /aprobaciones" 403 "$(codigo -X POST "$BASE/aprobaciones" -H 'Content-Type: application/json' -H "$(auth "$T_CREATIVO")" -d "$CUERPO")"
check "finanzas POST /aprobaciones" 403 "$(codigo -X POST "$BASE/aprobaciones" -H 'Content-Type: application/json' -H "$(auth "$T_FINANZAS")" -d "$CUERPO")"
check "admin POST /aprobaciones (solo CLIENTE_APROBADOR aprueba)" 403 "$(codigo -X POST "$BASE/aprobaciones" -H 'Content-Type: application/json' -H "$(auth "$T_ADMIN")" -d "$CUERPO")"
check "aprobador POST con aprobador_id en el body" 400 "$(codigo -X POST "$BASE/aprobaciones" -H 'Content-Type: application/json' -H "$(auth "$T_APROBADOR")" -d "{\"version_entregable_id\":${VER:-0},\"estado\":\"RECHAZADA\",\"aprobador_id\":1}")"
check "aprobador POST con aprobador_id null en el body" 400 "$(codigo -X POST "$BASE/aprobaciones" -H 'Content-Type: application/json' -H "$(auth "$T_APROBADOR")" -d "{\"version_entregable_id\":${VER:-0},\"estado\":\"RECHAZADA\",\"aprobador_id\":null}")"
RESP=$(curl -s -w '\n%{http_code}' -X POST "$BASE/aprobaciones" -H 'Content-Type: application/json' -H "$(auth "$T_APROBADOR")" -d "$CUERPO")
check "aprobador POST /aprobaciones" 201 "$(echo "$RESP" | tail -1)"
JSON_APR=$(echo "$RESP" | sed '$d')
check "aprobador_id guardado = id del usuario autenticado" "$APROBADOR_ID" "$(jget "$JSON_APR" .aprobacion.aprobador_id)"
check "un rechazo no cierra el hito" false "$(jget "$JSON_APR" .hito_cerrado)"

echo "== Errores de formato: JSON mal formado -> 400 en JSON, sin stack"
MAL=$(curl -s -w '\n%{http_code}|%{content_type}' -X POST "$BASE/sesion/login" -H 'Content-Type: application/json' -d '{"identifier":')
check "login con JSON mal formado" 400 "$(echo "$MAL" | tail -1 | cut -d'|' -f1)"
case "$(echo "$MAL" | tail -1 | cut -d'|' -f2)" in application/json*) ok "la respuesta es application/json";; *) fail "la respuesta no es application/json";; esac
if echo "$MAL" | grep -qiE '<html|<pre>|node_modules|\.ts:|at .*\(|SyntaxError'; then fail "la respuesta filtra HTML, rutas o stack"; else ok "la respuesta no filtra HTML, rutas ni stack"; fi
MAL2=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/clientes" -H 'Content-Type: application/json' -H "$(auth "$T_ADMIN")" -d '{"nombre":')
check "ruta de negocio con JSON mal formado" 400 "$MAL2"

echo "== Limpieza: se desactiva la cadena de prueba"
for PAR in "version-entregables:$VER" "entregables:$ENT" "tareas:$TAR" "hitos:$HIT" "campanias:$CAM" "clientes:$CLI"; do
  RUTA=${PAR%%:*}; ID=${PAR##*:}
  [ -n "$ID" ] && curl -s -o /dev/null -X PATCH "$BASE/$RUTA/$ID/deactivate" -H "$(auth "$T_ADMIN")"
done

echo
if [ "$FALLOS" -eq 0 ]; then
  echo "SMOKE RBAC: TODO OK ($TOTAL comprobaciones)"; exit 0
else
  echo "SMOKE RBAC: $FALLOS de $TOTAL comprobaciones FALLARON"; exit 1
fi
