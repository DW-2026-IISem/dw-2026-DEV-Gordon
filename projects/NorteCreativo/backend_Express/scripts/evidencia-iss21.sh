#!/usr/bin/env bash
# Evidencia de ISS-21 en UN solo comando (para capturar la salida): ejecuta cada AC mostrando la petición y su
# respuesta (los tokens salen recortados) y al final imprime el veredicto por AC.
#
# Uso (desde backend_Express, con el servidor corriendo en el puerto 3012 y nc-mysql activo):
#     bash scripts/evidencia-iss21.sh
# Variables opcionales: BASE (url de la API), DB (nombre de la base), PREP=1 (añade la FK aprobaciones.aprobador_id -> users
# si todavía no existe en una base creada antes de la RN-05).
# Usa los usuarios de laboratorio del seed. La contraseña de MySQL se lee de .env. Deja la base como estaba: borra la
# cadena de prueba (cliente > ... > versión) y sus aprobaciones.
set -u
cd "$(dirname "$0")/.."

# Con el servidor apagado un curl a un puerto cerrado puede quedarse colgado: se limitan los tiempos.
curl() { command curl --connect-timeout 5 --max-time 60 -A "evidencia-iss21" "$@"; }

BASE=${BASE:-http://localhost:3012/api}
DB=${DB:-$(grep -E '^MYSQL_NAME=' .env | cut -d= -f2-)}
PW=$(grep -E '^MYSQL_PASSWORD=' .env | cut -d= -f2-)
export MYSQL_NAME="$DB"
TRUNC='s/("(access_token|refresh_token)":")([^"]{12})[^"]*"/\1\3…"/g'
MARCA='EVIDENCIA-ISS21'

tabla() { docker exec -i nc-mysql mysql -uroot -p"$PW" "$DB" -e "$1" 2>&1 | grep -v Warning; }
valor() { docker exec -i nc-mysql mysql -uroot -p"$PW" "$DB" -N -s -e "$1" 2>/dev/null; }
sql()   { echo; echo "\$ docker exec -i nc-mysql mysql -uroot -p'***' $DB -e \"$1\""; tabla "$1"; }

subst() { local s="$1" v; for v in VER; do s=${s//\$$v/${!v:-}}; done; printf '%s' "$s"; }
code()  { echo "$OUT" | tail -1 | sed 's/HTTP //'; }
body()  { echo "$OUT" | sed '$d'; }
jget()  { echo "$1" | node -pe "let v; try { v = JSON.parse(require('fs').readFileSync(0))$2 } catch (e) {} v === undefined ? '' : (typeof v === 'object' ? JSON.stringify(v) : v)"; }
mostrar() { echo "$OUT" | sed -E "$TRUNC" | awk '{ if (length($0) > 400) print substr($0, 1, 400) "…(recortado)"; else print }'; }

req() { # req MÉTODO RUTA [VARIABLE_DEL_TOKEN] [JSON]  -> deja la respuesta en $OUT
  local m=$1 r=$2 tv=${3:-} b=${4:-}
  echo; echo "\$ curl -s -X $m \$BASE$r${tv:+ -H \"Authorization: Bearer \$$tv\"}${b:+ -H 'Content-Type: application/json' -d '$b'}"
  OUT=$(curl -s -w '\nHTTP %{http_code}' -X "$m" "$BASE$r" ${tv:+-H "Authorization: Bearer ${!tv}"} ${b:+-H 'Content-Type: application/json' -d "$(subst "$b")"}); mostrar; }
login() { # login ROL USUARIO CONTRASEÑA -> TOKEN_<ROL>
  req POST /sesion/login "" "{\"identifier\":\"$2\",\"password\":\"$3\"}"
  printf -v "TOKEN_$1" '%s' "$(jget "$(body)" .access_token)"; }

RES_AC1=; RES_AC2=; RES_AC3=; RES_AC4=; RES_AC5=; RES_AC6=; RES_AC7=; RES_AC8=; RES_EXTRA=
veredicto() { if [ "$1" = "1" ]; then echo "  => $2: CUMPLE"; else echo "  => $2: NO CUMPLE"; fi; }

if [ "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/health")" != "200" ]; then
  echo "El servidor no responde en $BASE (¿está corriendo npm run dev?)"; exit 1
fi

FK_N=$(valor "SELECT COUNT(*) FROM information_schema.key_column_usage WHERE table_schema='$DB' AND table_name='aprobaciones' AND column_name='aprobador_id' AND referenced_table_name='users'")
if [ "$FK_N" = "0" ] && [ "${PREP:-0}" = "1" ]; then
  echo "################ PREPARACIÓN: FK aprobaciones.aprobador_id -> users (la base se creó antes de la RN-05)"
  sql "ALTER TABLE aprobaciones ADD CONSTRAINT fk_aprobaciones_aprobador FOREIGN KEY (aprobador_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE"
  FK_N=$(valor "SELECT COUNT(*) FROM information_schema.key_column_usage WHERE table_schema='$DB' AND table_name='aprobaciones' AND column_name='aprobador_id' AND referenced_table_name='users'")
fi

echo "################ AC-7  npm run db:seed siembra primero seguridad y después negocio, sin errores"
echo; echo "\$ npm run db:seed"
SEED1=$(npm run db:seed 2>&1 | grep -vE "npm notice|^>|^$"); echo "$SEED1"
echo; echo "\$ npm run db:seed        (segunda vez: idempotente)"
SEED2=$(npm run db:seed 2>&1 | grep -vE "npm notice|^>|^$"); echo "$SEED2"
# Secuencia en la que aparecen las etapas: seguridad (roles -> recursos -> usuarios -> asignaciones -> concesiones) y después negocio.
ORDEN=$(echo "$SEED1" | grep -oE "^(Roles|Recursos|Usuarios|Asignaciones de rol|Concesiones|Clientes|Campañas|Hitos|Tareas|Entregables|Versiones de entregable):" | tr '\n' ' ')
ORDENADO="Roles: Recursos: Usuarios: Asignaciones de rol: Concesiones: Clientes: Campañas: Hitos: Tareas: Entregables: Versiones de entregable: "
N_ETAPAS=$(echo "$SEED1" | grep -cE "^(Roles|Recursos|Usuarios|Asignaciones de rol|Concesiones|Clientes|Campañas|Hitos|Tareas|Entregables|Versiones de entregable):")
ERRORES=$(echo "$SEED1 $SEED2" | grep -ciE "error|ERR!")
[ "$N_ETAPAS" = 11 ] && [ "$ORDEN" = "$ORDENADO" ] && [ "$ERRORES" = 0 ] && echo "$SEED1" | grep -q "^Seeders finalizados" && echo "$SEED2" | grep -q "^Seeders finalizados" && RES_AC7=1
echo "  (etapas sembradas: $N_ETAPAS de 11; seguridad antes que negocio y en el orden pedido: $([ "$ORDEN" = "$ORDENADO" ] && echo sí || echo no); líneas con error: $ERRORES)"; veredicto "$RES_AC7" "AC-7"

echo; echo "################ PREPARACIÓN de AC-1 a AC-6: logins por rol"
login ADMIN admin 'Admin123!'
login CUENTAS cuentas 'Cuentas123!'
login CREATIVO creativo 'Creativo123!'
login APROBADOR aprobador 'Aprobador123!'
login FINANZAS finanzas 'Finanzas123!'

echo; echo "################ AC-1  Sin token, GET /api/clientes responde 401"
req GET /clientes
C1=$(code); B1=$(body)
[ "$C1" = 401 ] && RES_AC1=1
echo "  (HTTP $C1)"; veredicto "$RES_AC1" "AC-1"

echo; echo "################ AC-2  creativo en POST /api/aprobaciones -> 403; aprobador -> 201 con su propio id como aprobador_id"
echo "(se crea una cadena de prueba con admin; admin tiene concedido el negocio salvo aprobar)"
SUF=$(date +%s)
req POST /clientes TOKEN_ADMIN "{\"tipo_documento\":\"NIT\",\"numero_documento\":\"EVID21$SUF\",\"nombre\":\"$MARCA $SUF\"}"; CLI=$(jget "$(body)" .cliente.id)
req POST /campanias TOKEN_ADMIN "{\"cliente_id\":${CLI:-0},\"nombre\":\"$MARCA $SUF\"}"; CAM=$(jget "$(body)" .campania.id)
req POST /hitos TOKEN_ADMIN "{\"campania_id\":${CAM:-0},\"nombre\":\"$MARCA $SUF\"}"; HIT=$(jget "$(body)" .hito.id)
req POST /tareas TOKEN_ADMIN "{\"hito_id\":${HIT:-0},\"nombre\":\"$MARCA $SUF\"}"; TAR=$(jget "$(body)" .tarea.id)
req POST /entregables TOKEN_ADMIN "{\"tarea_id\":${TAR:-0}}"; ENT=$(jget "$(body)" .entregable.id)
req POST /version-entregables TOKEN_ADMIN "{\"entregable_id\":${ENT:-0}}"; VER=$(jget "$(body)" .version.id)
CUERPO='{"version_entregable_id":$VER,"estado":"RECHAZADA","comentario":"evidencia-iss21"}'
req POST /aprobaciones TOKEN_CREATIVO "$CUERPO"; C2A=$(code)
req POST /aprobaciones TOKEN_ADMIN "$CUERPO"; C2B=$(code)
req POST /aprobaciones TOKEN_APROBADOR "$CUERPO"; C2C=$(code); J2=$(body)
APROB_ID=$(valor "SELECT id FROM users WHERE username='aprobador'")
GUARDADO=$(jget "$J2" .aprobacion.aprobador_id)
sql "SELECT a.id, a.aprobador_id, u.username, a.estado, a.comentario FROM aprobaciones a JOIN users u ON u.id=a.aprobador_id WHERE a.comentario='evidencia-iss21' ORDER BY a.id DESC LIMIT 1"
sql "SELECT r.name AS rol_con_POST_aprobaciones FROM resource_roles rr JOIN roles r ON r.id=rr.role_id JOIN resources s ON s.id=rr.resource_id WHERE s.method='POST' AND s.path='/api/aprobaciones' AND rr.status='active'"
QUIEN=$(valor "SELECT GROUP_CONCAT(r.name) FROM resource_roles rr JOIN roles r ON r.id=rr.role_id JOIN resources s ON s.id=rr.resource_id WHERE s.method='POST' AND s.path='/api/aprobaciones' AND rr.status='active'")
[ -n "$VER" ] && [ "$C2A" = 403 ] && [ "$C2B" = 403 ] && [ "$C2C" = 201 ] && [ "$GUARDADO" = "$APROB_ID" ] && [ "$QUIEN" = "CLIENTE_APROBADOR" ] && RES_AC2=1
echo "  (creativo: HTTP $C2A; admin: HTTP $C2B; aprobador: HTTP $C2C; aprobador_id guardado=$GUARDADO, id del usuario aprobador=$APROB_ID; roles con POST /aprobaciones: $QUIEN)"; veredicto "$RES_AC2" "AC-2"

echo; echo "################ AC-3  Enviar aprobador_id en el body responde 400"
req POST /aprobaciones TOKEN_APROBADOR '{"version_entregable_id":$VER,"estado":"RECHAZADA","aprobador_id":1}'; C3A=$(code)
req POST /aprobaciones TOKEN_APROBADOR '{"version_entregable_id":$VER,"estado":"RECHAZADA","aprobador_id":null}'; C3B=$(code)
N_APR=$(valor "SELECT COUNT(*) FROM aprobaciones WHERE comentario='evidencia-iss21'")
[ "$C3A" = 400 ] && [ "$C3B" = 400 ] && [ "$N_APR" = 1 ] && RES_AC3=1
echo "  (con aprobador_id=1: HTTP $C3A; con aprobador_id=null: HTTP $C3B; aprobaciones de la prueba en la BD: $N_APR, no se creó ninguna más)"; veredicto "$RES_AC3" "AC-3"

echo; echo "################ AC-4  finanzas puede leer clientes (200) pero no crearlos (403)"
req GET /clientes TOKEN_FINANZAS; C4A=$(code)
N_ANTES=$(valor "SELECT COUNT(*) FROM clientes")
req POST /clientes TOKEN_FINANZAS '{"tipo_documento":"NIT","numero_documento":"EVID21-403","nombre":"no debe crearse"}'; C4B=$(code)
N_DESPUES=$(valor "SELECT COUNT(*) FROM clientes")
[ "$C4A" = 200 ] && [ "$C4B" = 403 ] && [ "$N_ANTES" = "$N_DESPUES" ] && RES_AC4=1
echo "  (GET: HTTP $C4A; POST: HTTP $C4B; clientes en la BD antes/después: $N_ANTES/$N_DESPUES)"; veredicto "$RES_AC4" "AC-4"

echo; echo "################ AC-5  Swagger muestra Authorize, y login/refresh/logout aparecen sin candado"
echo; echo "\$ curl -s \$BASE/docs.json | node -pe \"…paths['/api/sesion/<login|refresh|logout>'].post.security\""
DOCS=$(curl -s "$BASE/docs.json")
SEC_ABIERTAS=$(node -pe "const p=JSON.parse(require('fs').readFileSync(0)).paths; JSON.stringify(['login','refresh','logout'].map(x=>p['/api/sesion/'+x].post.security))" <<<"$DOCS")
echo "$SEC_ABIERTAS"
echo; echo "\$ curl -s \$BASE/docs.json | node -pe \"…security global, securitySchemes y components.responses\""
GLOBAL=$(node -pe "const j=JSON.parse(require('fs').readFileSync(0)); JSON.stringify({security:j.security, securitySchemes:Object.keys(j.components.securitySchemes), responses:Object.keys(j.components.responses)})" <<<"$DOCS")
echo "$GLOBAL"
echo; echo "\$ comprobar las operaciones de negocio y de administración (candado, 401 y 403)"
RESUMEN=$(node -pe "
const j=JSON.parse(require('fs').readFileSync(0));
const ops=Object.entries(j.paths).flatMap(([p,o])=>Object.entries(o).map(([m,x])=>({p,m,x})));
const abiertas=ops.filter(o=>/^\/api\/sesion\/(login|refresh|logout)\$/.test(o.p));
const jwt=ops.filter(o=>/^\/api\/(sesion\/perfil|permisos|sesiones)/.test(o.p));
const rbac=ops.filter(o=>!abiertas.includes(o)&&!jwt.includes(o));
const cand=(o)=>JSON.stringify(o.x.security)===JSON.stringify([{bearerAuth:[]}]);
JSON.stringify({total:ops.length, abiertas_sin_candado:abiertas.filter(o=>JSON.stringify(o.x.security)==='[]').length+'/'+abiertas.length, jwt_con_candado_y_401:jwt.filter(o=>cand(o)&&o.x.responses['401']).length+'/'+jwt.length, rbac_con_candado_401_403:rbac.filter(o=>cand(o)&&o.x.responses['401']&&o.x.responses['403']).length+'/'+rbac.length, sin_auth_en_el_texto:JSON.stringify(j).includes('SIN AUTH')})" <<<"$DOCS")
echo "$RESUMEN"
UI_HTTP=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/docs/")
UI_BODY=$(curl -s "$BASE/docs/" | grep -c "swagger-ui")
echo "  (la interfaz /api/docs/ responde HTTP $UI_HTTP y contiene swagger-ui: $UI_BODY coincidencias; el botón Authorize aparece al haber securitySchemes.bearerAuth)"
OPEN_N=$(node -pe "const j=JSON.parse(require('fs').readFileSync(0)); Object.keys(j.components.securitySchemes).includes('bearerAuth') && JSON.stringify(j.security)==='[{\"bearerAuth\":[]}]'" <<<"$DOCS")
RB=$(jget "$RESUMEN" .rbac_con_candado_401_403); AB=$(jget "$RESUMEN" .abiertas_sin_candado); JW=$(jget "$RESUMEN" .jwt_con_candado_y_401); SA=$(jget "$RESUMEN" .sin_auth_en_el_texto)
RB_OK=$([ "${RB%/*}" = "${RB#*/}" ] && echo 1); AB_OK=$([ "$AB" = "3/3" ] && echo 1); JW_OK=$([ "${JW%/*}" = "${JW#*/}" ] && echo 1)
[ "$SEC_ABIERTAS" = "[[],[],[]]" ] && [ "$OPEN_N" = "true" ] && [ "$RB_OK" = 1 ] && [ "$AB_OK" = 1 ] && [ "$JW_OK" = 1 ] && [ "$SA" = "false" ] && [ "$UI_HTTP" = 200 ] && RES_AC5=1
veredicto "$RES_AC5" "AC-5"

echo; echo "################ AC-6  Un cuerpo JSON mal formado responde 400 en JSON, sin HTML ni rutas del servidor"
echo; echo "\$ curl -i -X POST \$BASE/sesion/login -H 'Content-Type: application/json' -d '{\"identifier\":'"
MAL=$(curl -s -i -X POST "$BASE/sesion/login" -H 'Content-Type: application/json' -d '{"identifier":'); echo "$MAL" | grep -vE "^(Date|Connection|Keep-Alive|X-Powered-By|ETag|Vary|Access-Control)" | tr -d '\r'
C6=$(echo "$MAL" | head -1 | awk '{print $2}'); CT6=$(echo "$MAL" | grep -i '^content-type' | tr -d '\r')
FUGA=$(echo "$MAL" | grep -ciE '<html|<pre>|node_modules|\.ts:|SyntaxError|at .*\(')
echo; echo "\$ curl -i -X POST \$BASE/clientes -H 'Content-Type: application/json' -H \"Authorization: Bearer \$TOKEN_ADMIN\" -d '{\"nombre\":'"
C6B=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/clientes" -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN_ADMIN" -d '{"nombre":'); echo "HTTP $C6B"
[ "$C6" = 400 ] && echo "$CT6" | grep -qi "application/json" && [ "$FUGA" = 0 ] && [ "$C6B" = 400 ] && RES_AC6=1
echo "  (HTTP $C6; $CT6; coincidencias de HTML/stack/rutas: $FUGA; ruta de negocio con JSON malo: HTTP $C6B)"; veredicto "$RES_AC6" "AC-6"

echo; echo "################ AC-8  bash scripts/smoke-rbac.sh termina en verde y npx tsc --noEmit sin errores"
echo; echo "\$ bash scripts/smoke-rbac.sh; echo \"exit=\$?\""
SMOKE=$(BASE="$BASE" bash scripts/smoke-rbac.sh 2>&1); SMOKE_RC=$?
echo "$SMOKE"; echo "exit=$SMOKE_RC"
echo; echo "\$ npx tsc --noEmit; echo \"exit=\$?\""
TSC_OUT=$(npx tsc --noEmit 2>&1 | grep -v "npm notice"); TSC_RC=$?
npx tsc --noEmit >/dev/null 2>&1 && TSC_EXIT=0 || TSC_EXIT=1
echo "$TSC_OUT"; echo "exit=$TSC_EXIT"
[ "$SMOKE_RC" = 0 ] && echo "$SMOKE" | grep -q "TODO OK" && [ "$(echo "$SMOKE" | grep -c FAIL)" = 0 ] && [ "$TSC_EXIT" = 0 ] && RES_AC8=1
echo "  (smoke: exit $SMOKE_RC, FAIL=$(echo "$SMOKE" | grep -c FAIL); tsc: exit $TSC_EXIT)"; veredicto "$RES_AC8" "AC-8"

echo; echo "################ EXTRA  Matriz de concesiones y FK de la RN-05"
sql "SELECT r.name, SUM(rr.status='active') AS activas FROM resource_roles rr JOIN roles r ON r.id=rr.role_id GROUP BY r.id ORDER BY r.id"
sql "SELECT constraint_name, column_name, referenced_table_name FROM information_schema.key_column_usage WHERE table_schema='$DB' AND table_name='aprobaciones' AND referenced_table_name IS NOT NULL"
MAT=$(valor "SELECT GROUP_CONCAT(CONCAT(n,'=',a) ORDER BY id) FROM (SELECT r.id, r.name AS n, SUM(rr.status='active') AS a FROM resource_roles rr JOIN roles r ON r.id=rr.role_id GROUP BY r.id) t")
[ "$MAT" = "ADMIN=75,CUENTAS=29,CREATIVO=16,CLIENTE_APROBADOR=11,FINANZAS=6" ] && [ "$FK_N" = "1" ] && RES_EXTRA=1
echo "  (concesiones: $MAT; FK aprobador_id -> users: $([ "$FK_N" = 1 ] && echo sí || echo no))"; veredicto "$RES_EXTRA" "EXTRA"

echo; echo "(limpieza: se borran la cadena de prueba, sus aprobaciones y las sesiones de login de esta prueba, para dejar la base como estaba)"
valor "DELETE a FROM aprobaciones a JOIN version_entregables v ON v.id=a.version_entregable_id JOIN entregables e ON e.id=v.entregable_id JOIN tareas t ON t.id=e.tarea_id JOIN hitos h ON h.id=t.hito_id JOIN campanias ca ON ca.id=h.campania_id JOIN clientes c ON c.id=ca.cliente_id WHERE c.nombre LIKE '$MARCA %' OR c.nombre LIKE 'SMOKE-RBAC %'" >/dev/null
valor "DELETE v FROM version_entregables v JOIN entregables e ON e.id=v.entregable_id JOIN tareas t ON t.id=e.tarea_id JOIN hitos h ON h.id=t.hito_id JOIN campanias ca ON ca.id=h.campania_id JOIN clientes c ON c.id=ca.cliente_id WHERE c.nombre LIKE '$MARCA %' OR c.nombre LIKE 'SMOKE-RBAC %'" >/dev/null
valor "DELETE e FROM entregables e JOIN tareas t ON t.id=e.tarea_id JOIN hitos h ON h.id=t.hito_id JOIN campanias ca ON ca.id=h.campania_id JOIN clientes c ON c.id=ca.cliente_id WHERE c.nombre LIKE '$MARCA %' OR c.nombre LIKE 'SMOKE-RBAC %'" >/dev/null
valor "DELETE t FROM tareas t JOIN hitos h ON h.id=t.hito_id JOIN campanias ca ON ca.id=h.campania_id JOIN clientes c ON c.id=ca.cliente_id WHERE c.nombre LIKE '$MARCA %' OR c.nombre LIKE 'SMOKE-RBAC %'" >/dev/null
valor "DELETE h FROM hitos h JOIN campanias ca ON ca.id=h.campania_id JOIN clientes c ON c.id=ca.cliente_id WHERE c.nombre LIKE '$MARCA %' OR c.nombre LIKE 'SMOKE-RBAC %'" >/dev/null
valor "DELETE ca FROM campanias ca JOIN clientes c ON c.id=ca.cliente_id WHERE c.nombre LIKE '$MARCA %' OR c.nombre LIKE 'SMOKE-RBAC %'" >/dev/null
valor "DELETE FROM clientes WHERE nombre LIKE '$MARCA %' OR nombre LIKE 'SMOKE-RBAC %'" >/dev/null
valor "DELETE FROM refresh_tokens WHERE device_info IN ('evidencia-iss21','smoke-rbac')" >/dev/null
echo "  restos de prueba en la base: $(valor "SELECT (SELECT COUNT(*) FROM clientes WHERE nombre LIKE '$MARCA %' OR nombre LIKE 'SMOKE-RBAC %') + (SELECT COUNT(*) FROM aprobaciones WHERE comentario IN ('evidencia-iss21','smoke-rbac')) + (SELECT COUNT(*) FROM refresh_tokens WHERE device_info IN ('evidencia-iss21','smoke-rbac'))")"

echo; echo "################ RESUMEN"
for A in AC1 AC2 AC3 AC4 AC5 AC6 AC7 AC8 EXTRA; do
  R=RES_$A; if [ "${!R}" = "1" ]; then echo "  $A  CUMPLE"; else echo "  $A  NO CUMPLE"; fi
done
