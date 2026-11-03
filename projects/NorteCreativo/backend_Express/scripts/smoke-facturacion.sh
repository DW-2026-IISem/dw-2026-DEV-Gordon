#!/usr/bin/env bash
# Smoke test de presupuestos + facturación (ISS-22, ISS-23 e ISS-24). Sale con 0 si TODO pasa y con 1 si algo falla.
#
# Uso (desde backend_Express, con el servidor corriendo y la base sembrada con `npm run db:seed`):
#     bash scripts/smoke-facturacion.sh
# Variable opcional: BASE (por defecto http://localhost:3012/api). Solo necesita curl y node.
#
# Efecto en los datos: crea su propia cadena (clientes, campañas, presupuestos, hitos cerrados) con el prefijo SMOKE-FACT y
# factura sobre ella. Facturas y presupuestos aprobados son registros contables sin DELETE: quedan en la base. Al terminar se
# desactivan las campañas de prueba. Es repetible: cada corrida crea datos nuevos.
set -u

curl() { command curl --connect-timeout 5 --max-time 60 -A "smoke-facturacion" "$@"; }

BASE=${BASE:-http://localhost:3012/api}
TOTAL=0
FALLOS=0
ok()   { TOTAL=$((TOTAL + 1)); echo "  PASS  $1"; }
fail() { TOTAL=$((TOTAL + 1)); FALLOS=$((FALLOS + 1)); echo "  FAIL  $1"; }
check() { if [ "$2" = "$3" ]; then ok "$1 -> $3"; else fail "$1 (esperado $2, obtenido $3)"; fi; }

codigo() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
jget()   { node -pe "let v; try { v = JSON.parse(require('fs').readFileSync(0))$2 } catch (e) {} v === undefined ? '' : (typeof v === 'object' ? JSON.stringify(v) : v)" <<<"$1"; }
login()  { curl -s -X POST "$BASE/sesion/login" -H 'Content-Type: application/json' -d "{\"identifier\":\"$1\",\"password\":\"$2\"}"; }
auth()   { printf 'Authorization: Bearer %s' "$1"; }
post()   { curl -s -X POST "$BASE$2" -H 'Content-Type: application/json' -H "$(auth "$1")" -d "$3"; }
patch()  { curl -s -X PATCH "$BASE$2" -H 'Content-Type: application/json' -H "$(auth "$1")" -d "${3:-{\}}"; }
get()    { curl -s "$BASE$2" -H "$(auth "$1")"; }
# status de un POST/PATCH/PUT/DELETE: sc TOKEN METODO RUTA [JSON]
sc()     { curl -s -o /dev/null -w '%{http_code}' -X "$2" "$BASE$3" -H 'Content-Type: application/json' -H "$(auth "$1")" -d "${4:-{\}}"; }

if [ "$(codigo "$BASE/health")" != "200" ]; then
  echo "El servidor no responde en $BASE (¿está corriendo npm run dev y sembraste con npm run db:seed?)"; exit 1
fi

T_ADMIN=$(jget "$(login admin 'Admin123!')" .access_token)
T_CUENTAS=$(jget "$(login cuentas 'Cuentas123!')" .access_token)
T_CREATIVO=$(jget "$(login creativo 'Creativo123!')" .access_token)
T_APROBADOR=$(jget "$(login aprobador 'Aprobador123!')" .access_token)
T_FINANZAS=$(jget "$(login finanzas 'Finanzas123!')" .access_token)
if [ -z "$T_ADMIN$T_CUENTAS$T_CREATIVO$T_APROBADOR$T_FINANZAS" ] || [ -z "$T_ADMIN" ] || [ -z "$T_CUENTAS" ] || [ -z "$T_CREATIVO" ] || [ -z "$T_APROBADOR" ] || [ -z "$T_FINANZAS" ]; then
  echo "No se pudo iniciar sesión con los usuarios de laboratorio (¿corriste npm run db:seed?)"; exit 1
fi

SUFIJO=$(date +%s)
R=$(post "$T_ADMIN" /clientes "{\"tipo_documento\":\"NIT\",\"numero_documento\":\"SF$SUFIJO\",\"nombre\":\"SMOKE-FACT $SUFIJO\"}"); CLI=$(jget "$R" .cliente.id)
R=$(post "$T_ADMIN" /campanias "{\"cliente_id\":${CLI:-0},\"nombre\":\"SMOKE-FACT A $SUFIJO\"}"); CAM=$(jget "$R" .campania.id)
R=$(post "$T_ADMIN" /campanias "{\"cliente_id\":${CLI:-0},\"nombre\":\"SMOKE-FACT B $SUFIJO\"}"); CAM2=$(jget "$R" .campania.id)
[ -n "$CAM" ] && [ -n "$CAM2" ] && ok "campañas de prueba creadas ($CAM y $CAM2)" || { fail "no se pudo crear la cadena base: $R"; exit 1; }

# mkhito CAMPANIA VALOR -> crea hito > tarea > entregable(total) > versión y lo CIERRA aprobándola; deja HITO_ID, ENT_ID.
mkhito() {
  local r
  r=$(post "$T_ADMIN" /hitos "{\"campania_id\":$1,\"nombre\":\"SMOKE-FACT $SUFIJO\"}"); HITO_ID=$(jget "$r" .hito.id)
  r=$(post "$T_ADMIN" /tareas "{\"hito_id\":${HITO_ID:-0},\"nombre\":\"SMOKE-FACT\"}"); local tar; tar=$(jget "$r" .tarea.id)
  r=$(post "$T_ADMIN" /entregables "{\"tarea_id\":${tar:-0},\"total\":$2}"); ENT_ID=$(jget "$r" .entregable.id)
  r=$(post "$T_ADMIN" /version-entregables "{\"entregable_id\":${ENT_ID:-0}}"); local ver; ver=$(jget "$r" .version.id)
  r=$(post "$T_APROBADOR" /aprobaciones "{\"version_entregable_id\":${ver:-0},\"estado\":\"APROBADA\"}")
  [ "$(jget "$r" .hito_cerrado)" = "true" ] || echo "  (aviso: el hito $HITO_ID no se cerró: $r)"
}
# mkabierto CAMPANIA VALOR -> hito que NO se cierra (sin aprobar).
mkabierto() {
  local r
  r=$(post "$T_ADMIN" /hitos "{\"campania_id\":$1,\"nombre\":\"SMOKE-FACT abierto\"}"); HITO_ID=$(jget "$r" .hito.id)
  r=$(post "$T_ADMIN" /tareas "{\"hito_id\":${HITO_ID:-0},\"nombre\":\"SMOKE-FACT\"}"); local tar; tar=$(jget "$r" .tarea.id)
  post "$T_ADMIN" /entregables "{\"tarea_id\":${tar:-0},\"total\":$2}" >/dev/null
}
estado_hito() { jget "$(get "$T_ADMIN" "/hitos/$1")" .hito.estado; }
facturar() { # facturar TOKEN JSON -> deja CUERPO y CODIGO
  local out; out=$(curl -s -w '\n%{http_code}' -X POST "$BASE/facturas" -H 'Content-Type: application/json' -H "$(auth "$1")" -d "$2")
  CODIGO=$(echo "$out" | tail -1); CUERPO=$(echo "$out" | sed '$d')
}

echo "== ISS-22 · Presupuestos"
check "cuentas POST /presupuestos" 201 "$(sc "$T_CUENTAS" POST /presupuestos "{\"campania_id\":$CAM,\"valor\":1000000}")"
R=$(post "$T_CUENTAS" /presupuestos "{\"campania_id\":$CAM,\"valor\":1000000,\"observaciones\":\"smoke\"}"); PRE=$(jget "$R" .presupuesto.id)
check "el presupuesto nace BORRADOR" BORRADOR "$(jget "$R" .presupuesto.estado)"
check "el valor se responde como número" 1000000 "$(jget "$R" .presupuesto.valor)"
check "campaña inexistente" 404 "$(sc "$T_CUENTAS" POST /presupuestos '{"campania_id":999999,"valor":1000}')"
check "sin valor" 400 "$(sc "$T_CUENTAS" POST /presupuestos "{\"campania_id\":$CAM}")"
check "valor = 0" 400 "$(sc "$T_CUENTAS" POST /presupuestos "{\"campania_id\":$CAM,\"valor\":0}")"
check "valor negativo" 400 "$(sc "$T_CUENTAS" POST /presupuestos "{\"campania_id\":$CAM,\"valor\":-5}")"
check "valor no numérico" 400 "$(sc "$T_CUENTAS" POST /presupuestos "{\"campania_id\":$CAM,\"valor\":\"abc\"}")"
check "sin campania_id" 400 "$(sc "$T_CUENTAS" POST /presupuestos '{"valor":1000}')"
check "estado inválido" 400 "$(sc "$T_CUENTAS" POST /presupuestos "{\"campania_id\":$CAM,\"valor\":10,\"estado\":\"X\"}")"
check "GET /presupuestos/:id" 200 "$(codigo "$BASE/presupuestos/$PRE" -H "$(auth "$T_FINANZAS")")"
check "GET /presupuestos/999999" 404 "$(codigo "$BASE/presupuestos/999999" -H "$(auth "$T_FINANZAS")")"
check "PATCH valor de un BORRADOR" 200 "$(sc "$T_CUENTAS" PATCH "/presupuestos/$PRE" '{"valor":1000000}')"
check "PATCH estado APROBADO" 200 "$(sc "$T_CUENTAS" PATCH "/presupuestos/$PRE" '{"estado":"APROBADO"}')"
check "PUT sobre APROBADO" 409 "$(sc "$T_CUENTAS" PUT "/presupuestos/$PRE" "{\"campania_id\":$CAM,\"valor\":5}")"
check "PATCH sobre APROBADO" 409 "$(sc "$T_CUENTAS" PATCH "/presupuestos/$PRE" '{"valor":5}')"
check "deactivate sobre APROBADO" 409 "$(sc "$T_CUENTAS" PATCH "/presupuestos/$PRE/deactivate")"
check "DELETE sobre APROBADO" 409 "$(sc "$T_CUENTAS" DELETE "/presupuestos/$PRE")"
R=$(post "$T_CUENTAS" /presupuestos "{\"campania_id\":$CAM2,\"valor\":777}"); PRE2=$(jget "$R" .presupuesto.id)
check "PUT sobre BORRADOR" 200 "$(sc "$T_CUENTAS" PUT "/presupuestos/$PRE2" "{\"campania_id\":$CAM2,\"valor\":888}")"
check "deactivate sobre BORRADOR" 200 "$(sc "$T_CUENTAS" PATCH "/presupuestos/$PRE2/deactivate")"
R=$(post "$T_CUENTAS" /presupuestos "{\"campania_id\":$CAM2,\"valor\":999}"); PRE3=$(jget "$R" .presupuesto.id)
check "DELETE sobre BORRADOR" 200 "$(sc "$T_CUENTAS" DELETE "/presupuestos/$PRE3")"
R=$(post "$T_ADMIN" /campanias "{\"cliente_id\":$CLI,\"nombre\":\"SMOKE-FACT inactiva\"}"); CAMI=$(jget "$R" .campania.id)
patch "$T_ADMIN" "/campanias/$CAMI/deactivate" >/dev/null
check "campaña inactiva" 409 "$(sc "$T_CUENTAS" POST /presupuestos "{\"campania_id\":$CAMI,\"valor\":10}")"

echo "== ISS-24 · RBAC de facturación"
for RUTA in /presupuestos /facturas; do
  check "sin token GET $RUTA" 401 "$(codigo "$BASE$RUTA")"
  check "sin token POST $RUTA" 401 "$(codigo -X POST "$BASE$RUTA" -H 'Content-Type: application/json' -d '{}')"
  check "sin token GET $RUTA/1" 401 "$(codigo "$BASE$RUTA/1")"
done
check "sin token PATCH /presupuestos/1" 401 "$(codigo -X PATCH "$BASE/presupuestos/1" -H 'Content-Type: application/json' -d '{}')"
check "creativo GET /facturas" 403 "$(codigo "$BASE/facturas" -H "$(auth "$T_CREATIVO")")"
check "creativo GET /presupuestos" 403 "$(codigo "$BASE/presupuestos" -H "$(auth "$T_CREATIVO")")"
check "aprobador GET /facturas (sin acceso)" 403 "$(codigo "$BASE/facturas" -H "$(auth "$T_APROBADOR")")"
check "aprobador GET /presupuestos (sin acceso)" 403 "$(codigo "$BASE/presupuestos" -H "$(auth "$T_APROBADOR")")"
check "cuentas POST /facturas (no factura)" 403 "$(sc "$T_CUENTAS" POST /facturas "{\"campania_id\":$CAM,\"hito_ids\":[1]}")"
check "cuentas GET /facturas (sin acceso)" 403 "$(codigo "$BASE/facturas" -H "$(auth "$T_CUENTAS")")"
check "finanzas GET /presupuestos" 200 "$(codigo "$BASE/presupuestos" -H "$(auth "$T_FINANZAS")")"
check "finanzas POST /presupuestos (solo lectura)" 403 "$(sc "$T_FINANZAS" POST /presupuestos "{\"campania_id\":$CAM,\"valor\":5}")"
check "finanzas PATCH /presupuestos/:id (solo lectura)" 403 "$(sc "$T_FINANZAS" PATCH "/presupuestos/$PRE" '{"valor":5}')"
check "finanzas GET /facturas" 200 "$(codigo "$BASE/facturas" -H "$(auth "$T_FINANZAS")")"
check "admin GET /facturas" 200 "$(codigo "$BASE/facturas" -H "$(auth "$T_ADMIN")")"
check "admin GET /presupuestos" 200 "$(codigo "$BASE/presupuestos" -H "$(auth "$T_ADMIN")")"

echo "== ISS-23 · FacturarHitos (validaciones)"
mkhito "$CAM" 400000; H1=$HITO_ID
mkhito "$CAM" 500000; H2=$HITO_ID; E2=$ENT_ID
mkhito "$CAM" 300000; H3=$HITO_ID
mkabierto "$CAM" 200000; HAB=$HITO_ID
mkhito "$CAM2" 100000; HOTRA=$HITO_ID
check "los hitos de prueba quedaron CERRADOS" "CERRADO CERRADO CERRADO ABIERTO" "$(estado_hito "$H1") $(estado_hito "$H2") $(estado_hito "$H3") $(estado_hito "$HAB")"

facturar "$T_FINANZAS" "{\"campania_id\":$CAM,\"hito_ids\":[]}";            check "hito_ids vacío" 400 "$CODIGO"
facturar "$T_FINANZAS" "{\"campania_id\":$CAM}";                              check "sin hito_ids" 400 "$CODIGO"
facturar "$T_FINANZAS" "{\"hito_ids\":[$H1]}";                                check "sin campania_id" 400 "$CODIGO"
facturar "$T_FINANZAS" "{\"campania_id\":$CAM,\"hito_ids\":[\"x\"]}";         check "hito_ids no numéricos" 400 "$CODIGO"
facturar "$T_FINANZAS" "{\"campania_id\":$CAM,\"hito_ids\":[$H1,$H1]}";       check "hitos repetidos" 400 "$CODIGO"
facturar "$T_FINANZAS" "{\"campania_id\":999999,\"hito_ids\":[$H1]}";         check "campaña inexistente" 404 "$CODIGO"
facturar "$T_FINANZAS" "{\"campania_id\":$CAM,\"hito_ids\":[999999]}";        check "hito inexistente" 404 "$CODIGO"
facturar "$T_FINANZAS" "{\"campania_id\":$CAM,\"hito_ids\":[$H1,$HOTRA]}";    check "hito de otra campaña" 400 "$CODIGO"
facturar "$T_FINANZAS" "{\"campania_id\":$CAM2,\"hito_ids\":[$HOTRA]}";       check "campaña sin presupuesto APROBADO" 409 "$CODIGO"
facturar "$T_FINANZAS" "{\"campania_id\":$CAM,\"hito_ids\":[$H1,$HAB]}";      check "hito ABIERTO en la lista" 409 "$CODIGO"
check "atomicidad: el otro hito de la lista sigue CERRADO" CERRADO "$(estado_hito "$H1")"
check "atomicidad: no se creó ninguna factura" 0 "$(jget "$(get "$T_ADMIN" "/facturas?campania_id=$CAM")" .facturas.length)"
check "campania_id inválido en el filtro" 400 "$(codigo "$BASE/facturas?campania_id=abc" -H "$(auth "$T_ADMIN")")"

echo "== ISS-23 · FacturarHitos (flujo feliz y RN-03)"
facturar "$T_FINANZAS" "{\"campania_id\":$CAM,\"hito_ids\":[$H1,$H2]}"
check "finanzas factura 2 hitos CERRADOS" 201 "$CODIGO"
F1=$(jget "$CUERPO" .factura.id)
NUM1=$(jget "$CUERPO" .factura.numero)
check "subtotal = 400000 + 500000" 900000 "$(jget "$CUERPO" .factura.subtotal)"
check "impuestos = subtotal × 0.19" 171000 "$(jget "$CUERPO" .factura.impuestos)"
check "total = subtotal + impuestos" 1071000 "$(jget "$CUERPO" .factura.total)"
check "estado EMITIDA" EMITIDA "$(jget "$CUERPO" .factura.estado)"
check "presupuesto_aprobado en la respuesta" 1000000 "$(jget "$CUERPO" .presupuesto_aprobado)"
check "total_facturado_campania en la respuesta" 900000 "$(jget "$CUERPO" .total_facturado_campania)"
check "la respuesta lista los 2 hitos" 2 "$(jget "$CUERPO" .hitos.length)"
if [[ "$NUM1" =~ ^NC-[0-9]{4}-[0-9]{6}$ ]]; then ok "número con formato NC-<año>-<6 dígitos> ($NUM1)"; else fail "formato de número inválido: $NUM1"; fi
check "los hitos quedaron FACTURADO" "FACTURADO FACTURADO" "$(estado_hito "$H1") $(estado_hito "$H2")"

facturar "$T_FINANZAS" "{\"campania_id\":$CAM,\"hito_ids\":[$H1]}";           check "reintento sobre un hito FACTURADO" 409 "$CODIGO"
facturar "$T_FINANZAS" "{\"campania_id\":$CAM,\"hito_ids\":[$H3]}";           check "RN-03: 900000 + 300000 excede 1000000" 409 "$CODIGO"
check "RN-03: el hito rechazado sigue CERRADO" CERRADO "$(estado_hito "$H3")"
check "RN-03: no se creó otra factura" 1 "$(jget "$(get "$T_ADMIN" "/facturas?campania_id=$CAM")" .facturas.length)"

mkhito "$CAM" 100000; H4=$HITO_ID
facturar "$T_ADMIN" "{\"campania_id\":$CAM,\"hito_ids\":[$H4]}"
check "tope exacto (900000 + 100000 = presupuesto) se permite" 201 "$CODIGO"
NUM2=$(jget "$CUERPO" .factura.numero); F2=$(jget "$CUERPO" .factura.id)
check "total_facturado_campania llega al presupuesto" 1000000 "$(jget "$CUERPO" .total_facturado_campania)"
if [ -n "$NUM1" ] && [ -n "$NUM2" ] && [ "$NUM1" != "$NUM2" ]; then ok "RN-07: números distintos ($NUM1 / $NUM2)"; else fail "RN-07: números repetidos o vacíos ($NUM1 / $NUM2)"; fi
mkhito "$CAM" 1; H5=$HITO_ID
facturar "$T_FINANZAS" "{\"campania_id\":$CAM,\"hito_ids\":[$H5]}"; check "presupuesto agotado: 1 peso más" 409 "$CODIGO"

echo "== ISS-23 · Consultas, inmutabilidad y RN-06"
check "GET /facturas/:id" 200 "$(codigo "$BASE/facturas/$F1" -H "$(auth "$T_FINANZAS")")"
D=$(get "$T_FINANZAS" "/facturas/$F1")
check "el detalle trae sus 2 hitos" 2 "$(jget "$D" .factura.hitos.length)"
check "GET /facturas?campania_id= lista las 2 facturas" 2 "$(jget "$(get "$T_FINANZAS" "/facturas?campania_id=$CAM")" .facturas.length)"
check "GET /facturas/999999" 404 "$(codigo "$BASE/facturas/999999" -H "$(auth "$T_FINANZAS")")"
check "GET /facturas/abc" 400 "$(codigo "$BASE/facturas/abc" -H "$(auth "$T_FINANZAS")")"
check "PUT /facturas/:id no existe" 404 "$(sc "$T_ADMIN" PUT "/facturas/$F1")"
check "PATCH /facturas/:id no existe" 404 "$(sc "$T_ADMIN" PATCH "/facturas/$F1")"
check "DELETE /facturas/:id no existe" 404 "$(sc "$T_ADMIN" DELETE "/facturas/$F1")"
check "RN-06: hito FACTURADO no admite versiones" 409 "$(sc "$T_ADMIN" POST /version-entregables "{\"entregable_id\":$E2}")"
VER2=$(jget "$(get "$T_ADMIN" "/version-entregables")" ".versiones.filter(v=>v.entregable_id===$E2)[0].id")
[ -z "$VER2" ] && VER2=$(jget "$(get "$T_ADMIN" "/version-entregables")" ".version_entregables.filter(v=>v.entregable_id===$E2)[0].id")
check "RN-06: hito FACTURADO no admite aprobaciones" 409 "$(sc "$T_APROBADOR" POST /aprobaciones "{\"version_entregable_id\":${VER2:-0},\"estado\":\"APROBADA\"}")"

echo "== Limpieza: se desactivan las campañas de prueba"
for C in "$CAM" "$CAM2"; do patch "$T_ADMIN" "/campanias/$C/deactivate" >/dev/null; done

echo
if [ "$FALLOS" -eq 0 ]; then
  echo "SMOKE FACTURACIÓN: TODO OK ($TOTAL comprobaciones)"; exit 0
else
  echo "SMOKE FACTURACIÓN: $FALLOS de $TOTAL comprobaciones FALLARON"; exit 1
fi
