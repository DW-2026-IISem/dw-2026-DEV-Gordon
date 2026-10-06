#!/usr/bin/env bash
# Evidencia de ISS-19 en UN solo comando (para capturar la salida): genera sus propios tokens y sesiones de prueba,
# ejecuta cada AC mostrando el comando y su resultado, y al final imprime el veredicto por AC.
#
# Uso (desde backend_Express, con el servidor corriendo en el puerto 3012):   bash scripts/evidencia-iss19.sh
# Variables opcionales: BASE (url de la API), DB (nombre de la base), KEEP=1 (no borrar las sesiones de prueba).
# La contraseña de MySQL se lee de .env (MYSQL_PASSWORD); no hay secretos en este archivo.
set -u
cd "$(dirname "$0")/.."

BASE=${BASE:-http://localhost:3012/api}
DB=${DB:-$(grep -E '^MYSQL_NAME=' .env | cut -d= -f2-)}
PW=$(grep -E '^MYSQL_PASSWORD=' .env | cut -d= -f2-)
export MYSQL_NAME="$DB"   # los scripts ts-node usan esta base

# Tabla (para mostrar) y valor suelto (para evaluar)
tabla() { docker exec -i nc-mysql mysql -uroot -p"$PW" "$DB" -e "$1" 2>&1 | grep -v Warning; }
valor() { docker exec -i nc-mysql mysql -uroot -p"$PW" "$DB" -N -s -e "$1" 2>/dev/null; }
# Muestra el comando como se escribiría (con la contraseña oculta) y lo ejecuta
# En el texto mostrado queda <REFRESH_TOKEN>; al ejecutar se sustituye por el valor real.
sql()   { echo; echo "\$ docker exec -i nc-mysql mysql -uroot -p'***' $DB -e \"$1\""; tabla "${1//<REFRESH_TOKEN>/$REFRESH_TOKEN}"; }
cmd()   { echo; echo "\$ $1"; local salida; salida=$(eval "$1" 2>&1); printf '%s\n' "$salida"; }
http()  { curl -s -o /dev/null -w '%{http_code}' "$@"; }

RES_AC1=; RES_AC2=; RES_AC3=; RES_AC4=; RES_AC5=; RES_AC6=; RES_EXTRA=
veredicto() { if [ "$1" = "1" ]; then echo "  => $2: CUMPLE"; else echo "  => $2: NO CUMPLE"; fi; }

if [ -z "$(valor "SHOW COLUMNS FROM refresh_tokens LIKE 'family_id'")" ]; then
  echo "Falta la columna refresh_tokens.family_id. Ejecuta primero el ALTER de docs/verificacion-ISS-19.md (sección 0.1)."; exit 1
fi

# Parte de un estado limpio: elimina SOLO sesiones de prueba anteriores (device_info = 'dev-session'); las reales del login no se tocan.
PREVIAS=$(valor "SELECT COUNT(*) FROM refresh_tokens WHERE device_info='dev-session'")
valor "DELETE FROM refresh_tokens WHERE device_info='dev-session'" >/dev/null
echo "################ PREPARACIÓN: sesiones de prueba y tokens ($BASE, base $DB)"
echo "(limpieza previa: $PREVIAS sesiones de prueba anteriores eliminadas)"
echo; echo "\$ npx ts-node scripts/dev-session.ts finanzas 3"
OUT_F=$(npx ts-node scripts/dev-session.ts finanzas 3 2>&1 | grep -v 'npm notice'); echo "$OUT_F"
echo; echo "\$ npx ts-node scripts/dev-session.ts admin 2"
OUT_A=$(npx ts-node scripts/dev-session.ts admin 2 2>&1 | grep -v 'npm notice'); echo "$OUT_A"
SESION_ID_FINANZAS=$(echo "$OUT_F" | grep -m1 '^sesion_id:' | awk '{print $2}')
REFRESH_TOKEN=$(echo "$OUT_F" | grep -m1 '^refresh_token:' | awk '{print $2}')
SESION_ID_ADMIN=$(echo "$OUT_A" | grep -m1 '^sesion_id:' | awk '{print $2}')
echo; echo "\$ npx ts-node scripts/dev-token.ts finanzas   (token de acceso, 15 min)"
TOKEN_FINANZAS=$(npx ts-node scripts/dev-token.ts finanzas 2>/dev/null); echo "${TOKEN_FINANZAS:0:40}…(${#TOKEN_FINANZAS} caracteres)"
echo; echo "\$ npx ts-node scripts/dev-token.ts admin"
TOKEN_ADMIN=$(npx ts-node scripts/dev-token.ts admin 2>/dev/null); echo "${TOKEN_ADMIN:0:40}…(${#TOKEN_ADMIN} caracteres)"
if [ -z "$TOKEN_FINANZAS" ] || [ -z "$TOKEN_ADMIN" ] || [ -z "$SESION_ID_FINANZAS" ] || [ -z "$SESION_ID_ADMIN" ]; then echo "No se pudieron crear las sesiones o los tokens"; exit 1; fi

echo; echo "################ AC-1  En refresh_tokens no hay ningún token en texto plano, solo hashes"
sql "SELECT COUNT(*) AS total, SUM(token_hash REGEXP '^[0-9a-f]{64}\$') AS con_hash_sha256 FROM refresh_tokens"
sql "SELECT COUNT(*) AS filas_con_token_en_claro FROM refresh_tokens WHERE token_hash='<REFRESH_TOKEN>'"
sql "SELECT COUNT(*) AS filas_con_su_hash FROM refresh_tokens WHERE token_hash=SHA2('<REFRESH_TOKEN>',256)"
sql "SELECT id, user_id, LEFT(family_id,8) AS familia, LEFT(token_hash,16) AS inicio_del_hash, status, device_info FROM refresh_tokens ORDER BY id"
A1_TOTAL=$(valor "SELECT COUNT(*) FROM refresh_tokens"); A1_HASH=$(valor "SELECT COUNT(*) FROM refresh_tokens WHERE token_hash REGEXP '^[0-9a-f]{64}\$'")
A1_CLARO=$(valor "SELECT COUNT(*) FROM refresh_tokens WHERE token_hash='$REFRESH_TOKEN'"); A1_SU=$(valor "SELECT COUNT(*) FROM refresh_tokens WHERE token_hash=SHA2('$REFRESH_TOKEN',256)")
[ "$A1_TOTAL" = "$A1_HASH" ] && [ "$A1_TOTAL" -gt 0 ] && [ "$A1_CLARO" = 0 ] && [ "$A1_SU" = 1 ] && RES_AC1=1
echo "  (total=$A1_TOTAL, con hash sha256=$A1_HASH, con token en claro=$A1_CLARO, con su SHA2=$A1_SU)"; veredicto "$RES_AC1" "AC-1"

echo; echo "################ AC-2  GET /api/sesiones lista solo las sesiones del usuario del token"
cmd 'curl -s -H "Authorization: Bearer $TOKEN_FINANZAS" '"$BASE"'/sesiones'
cmd 'curl -s -H "Authorization: Bearer $TOKEN_FINANZAS" '"$BASE"'/sesiones | grep -o "\"family_id\"" | wc -l'
cmd 'curl -s -H "Authorization: Bearer $TOKEN_FINANZAS" '"$BASE"'/sesiones | grep -o "\"user_id\":[0-9]*" | sort -u'
cmd 'curl -s -H "Authorization: Bearer $TOKEN_FINANZAS" '"$BASE"'/sesiones | grep -c token_hash'
cmd 'curl -s -H "Authorization: Bearer $TOKEN_ADMIN" '"$BASE"'/sesiones | grep -o "\"family_id\"" | wc -l'
cmd 'curl -s -w "\nHTTP %{http_code}\n" '"$BASE"'/sesiones'
FIN_ID=$(valor "SELECT id FROM users WHERE username='finanzas'")
L_FIN=$(curl -s -H "Authorization: Bearer $TOKEN_FINANZAS" $BASE/sesiones)
N_FIN=$(echo "$L_FIN" | grep -o '"family_id"' | wc -l); U_FIN=$(echo "$L_FIN" | grep -o '"user_id":[0-9]*' | sort -u)
N_ADM=$(curl -s -H "Authorization: Bearer $TOKEN_ADMIN" $BASE/sesiones | grep -o '"family_id"' | wc -l)
HASHES=$(echo "$L_FIN" | grep -c token_hash); SIN_TOKEN=$(http $BASE/sesiones)
BD_FIN=$(valor "SELECT COUNT(*) FROM refresh_tokens WHERE user_id=$FIN_ID AND status='active'"); BD_ADM=$(valor "SELECT COUNT(*) FROM refresh_tokens WHERE user_id=(SELECT id FROM users WHERE username='admin') AND status='active'")
[ "$N_FIN" = "$BD_FIN" ] && [ "$N_FIN" -ge 3 ] && [ "$U_FIN" = "\"user_id\":$FIN_ID" ] && [ "$N_ADM" = "$BD_ADM" ] && [ "$N_ADM" -ge 2 ] && [ "$HASHES" = 0 ] && [ "$SIN_TOKEN" = 401 ] && RES_AC2=1
echo "  (finanzas ve $N_FIN y tiene $BD_FIN activas en la BD; admin ve $N_ADM y tiene $BD_ADM; usuarios en el listado de finanzas: $U_FIN; token_hash en la respuesta: $HASHES; sin token: HTTP $SIN_TOKEN)"; veredicto "$RES_AC2" "AC-2"

echo; echo "################ AC-3  PATCH /api/sesiones/:id/deactivate revoca esa sesión"
A3_BEFORE=$(curl -s -H "Authorization: Bearer $TOKEN_FINANZAS" $BASE/sesiones | grep -o '"family_id"' | wc -l)
cmd 'curl -s -w "\nHTTP %{http_code}\n" -X PATCH -H "Authorization: Bearer $TOKEN_FINANZAS" '"$BASE"'/sesiones/$SESION_ID_FINANZAS/deactivate'
sql "SELECT id, status, revoked_at FROM refresh_tokens WHERE user_id=(SELECT id FROM users WHERE username='finanzas') ORDER BY id"
cmd 'curl -s -H "Authorization: Bearer $TOKEN_FINANZAS" '"$BASE"'/sesiones | grep -o "\"family_id\"" | wc -l'
cmd 'curl -s -w "\nHTTP %{http_code}\n" -X PATCH -H "Authorization: Bearer $TOKEN_FINANZAS" '"$BASE"'/sesiones/$SESION_ID_FINANZAS/deactivate'
A3_ST=$(valor "SELECT status FROM refresh_tokens WHERE id=$SESION_ID_FINANZAS"); A3_REV=$(valor "SELECT revoked_at IS NOT NULL FROM refresh_tokens WHERE id=$SESION_ID_FINANZAS")
A3_LIST=$(curl -s -H "Authorization: Bearer $TOKEN_FINANZAS" $BASE/sesiones | grep -o '"family_id"' | wc -l); A3_2=$(http -X PATCH -H "Authorization: Bearer $TOKEN_FINANZAS" $BASE/sesiones/$SESION_ID_FINANZAS/deactivate)
[ "$A3_ST" = inactive ] && [ "$A3_REV" = 1 ] && [ "$A3_LIST" = "$((A3_BEFORE - 1))" ] && [ "$A3_2" = 409 ] && RES_AC3=1
echo "  (status=$A3_ST, revoked_at fijado=$A3_REV, el listado pasó de $A3_BEFORE a $A3_LIST, repetir la revocación: HTTP $A3_2)"; veredicto "$RES_AC3" "AC-3"

echo; echo "################ AC-4  PATCH /api/sesiones/deactivate-all revoca todas las sesiones del usuario"
A4_ADM_ANTES=$(valor "SELECT COUNT(*) FROM refresh_tokens WHERE user_id=(SELECT id FROM users WHERE username='admin') AND status='active'")
cmd 'curl -s -w "\nHTTP %{http_code}\n" -X PATCH -H "Authorization: Bearer $TOKEN_FINANZAS" '"$BASE"'/sesiones/deactivate-all'
sql "SELECT (SELECT COUNT(*) FROM refresh_tokens WHERE user_id=(SELECT id FROM users WHERE username='finanzas') AND status='active') AS activas_finanzas, (SELECT COUNT(*) FROM refresh_tokens WHERE user_id=(SELECT id FROM users WHERE username='admin') AND status='active') AS activas_admin"
cmd 'curl -s -H "Authorization: Bearer $TOKEN_FINANZAS" '"$BASE"'/sesiones'
A4_FIN=$(valor "SELECT COUNT(*) FROM refresh_tokens WHERE user_id=$FIN_ID AND status='active'"); A4_ADM=$(valor "SELECT COUNT(*) FROM refresh_tokens WHERE user_id=(SELECT id FROM users WHERE username='admin') AND status='active'")
[ "$A4_FIN" = 0 ] && [ "$A4_ADM" = "$A4_ADM_ANTES" ] && [ "$A4_ADM" -ge 1 ] && RES_AC4=1
echo "  (activas de finanzas=$A4_FIN; activas de admin=$A4_ADM, antes eran $A4_ADM_ANTES: no se tocaron)"; veredicto "$RES_AC4" "AC-4"

echo; echo "################ AC-5  Pedir la sesión de otro usuario responde 404"
cmd 'curl -s -w "\nHTTP %{http_code}\n" -H "Authorization: Bearer $TOKEN_FINANZAS" '"$BASE"'/sesiones/$SESION_ID_ADMIN'
cmd 'curl -s -w "\nHTTP %{http_code}\n" -X PATCH -H "Authorization: Bearer $TOKEN_FINANZAS" '"$BASE"'/sesiones/$SESION_ID_ADMIN/deactivate'
sql "SELECT id, user_id, status FROM refresh_tokens WHERE id=$SESION_ID_ADMIN"
cmd 'curl -s -o /dev/null -w "admin sobre su propia sesión: HTTP %{http_code}\n" -H "Authorization: Bearer $TOKEN_ADMIN" '"$BASE"'/sesiones/$SESION_ID_ADMIN'
A5_1=$(http -H "Authorization: Bearer $TOKEN_FINANZAS" $BASE/sesiones/$SESION_ID_ADMIN); A5_2=$(http -X PATCH -H "Authorization: Bearer $TOKEN_FINANZAS" $BASE/sesiones/$SESION_ID_ADMIN/deactivate)
A5_ST=$(valor "SELECT status FROM refresh_tokens WHERE id=$SESION_ID_ADMIN"); A5_OWN=$(http -H "Authorization: Bearer $TOKEN_ADMIN" $BASE/sesiones/$SESION_ID_ADMIN)
[ "$A5_1" = 404 ] && [ "$A5_2" = 404 ] && [ "$A5_ST" = active ] && [ "$A5_OWN" = 200 ] && RES_AC5=1
echo "  (finanzas GET: $A5_1, finanzas PATCH: $A5_2, la sesión de admin sigue: $A5_ST, admin sobre la suya: $A5_OWN)"; veredicto "$RES_AC5" "AC-5"

echo; echo "################ AC-6  npx tsc --noEmit sin errores"
cmd 'npx tsc --noEmit 2>&1 | grep -v "npm notice"; echo "exit=${PIPESTATUS[0]}"'
npx tsc --noEmit >/dev/null 2>&1 && RES_AC6=1; veredicto "$RES_AC6" "AC-6"

echo; echo "################ EXTRA  Rotación, reuso, vencimiento y concurrencia"
cmd 'npx ts-node scripts/check-refresh-rotation.ts 2>&1 | grep -v "npm notice"'
npx ts-node scripts/check-refresh-rotation.ts >/dev/null 2>&1 && RES_EXTRA=1; veredicto "$RES_EXTRA" "EXTRA"

if [ "${KEEP:-0}" != "1" ]; then
  echo; echo "(limpieza: se eliminan solo las sesiones de prueba creadas por dev-session)"
  valor "DELETE FROM refresh_tokens WHERE device_info='dev-session'" >/dev/null
fi

echo; echo "################ RESUMEN"
for A in AC1 AC2 AC3 AC4 AC5 AC6 EXTRA; do
  R=RES_$A; if [ "${!R}" = "1" ]; then echo "  $A  CUMPLE"; else echo "  $A  NO CUMPLE"; fi
done
