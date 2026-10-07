#!/usr/bin/env bash
# Evidencia de ISS-20 en UN solo comando (para capturar la salida): ejecuta cada AC mostrando la petición y su
# respuesta (los tokens salen recortados), y al final imprime el veredicto por AC.
#
# Uso (desde backend_Express, con el servidor corriendo en el puerto 3012):   bash scripts/evidencia-iss20.sh
# Variables opcionales: BASE (url de la API), DB (nombre de la base).
# Usa los usuarios de laboratorio del seed (admin/Admin123!, finanzas/Finanzas123!). La contraseña de MySQL se lee de .env.
# Deja la base como estaba: borra las sesiones que crea (device_info = 'evidencia-iss20') y el usuario inactivo de prueba.
set -u

# Con el servidor apagado un curl a un puerto cerrado puede quedarse colgado: se limitan los tiempos.
curl() { command curl --connect-timeout 5 --max-time 60 "$@"; }
cd "$(dirname "$0")/.."

BASE=${BASE:-http://localhost:3012/api}
DB=${DB:-$(grep -E '^MYSQL_NAME=' .env | cut -d= -f2-)}
PW=$(grep -E '^MYSQL_PASSWORD=' .env | cut -d= -f2-)
UA='evidencia-iss20'
TRUNC='s/("(access_token|refresh_token)":")([^"]{12})[^"]*"/\1\3…"/g'

tabla() { docker exec -i nc-mysql mysql -uroot -p"$PW" "$DB" -e "$1" 2>&1 | grep -v Warning; }
valor() { docker exec -i nc-mysql mysql -uroot -p"$PW" "$DB" -N -s -e "$1" 2>/dev/null; }
sql()   { echo; echo "\$ docker exec -i nc-mysql mysql -uroot -p'***' $DB -e \"$1\""; tabla "$1"; }

# Sustituye $RT1..$RT6 por su valor real (en pantalla se ve el nombre de la variable)
subst() { local s="$1" v; for v in RT1 RT2 RT3 RT4 RT5 RT6; do s=${s//\$$v/${!v:-}}; done; printf '%s' "$s"; }
code()  { echo "$OUT" | tail -1 | sed 's/HTTP //'; }
body()  { echo "$OUT" | sed '$d'; }
jget()  { echo "$1" | node -pe "let v; try { v = JSON.parse(require('fs').readFileSync(0))$2 } catch (e) {} v === undefined ? '' : (typeof v === 'object' ? JSON.stringify(v) : v)"; }
# Recorta tokens y cuerpos muy largos (p. ej. los 76 permisos de admin) para que la captura sea legible
mostrar() { echo "$OUT" | sed -E "$TRUNC" | awk '{ if (length($0) > 600) print substr($0, 1, 600) "…(recortado)"; else print }'; }

post() { # post RUTA JSON [TOKEN]  -> deja la respuesta en $OUT
  echo; echo "\$ curl -s -X POST \$BASE$1 -H 'Content-Type: application/json'${3:+ -H \"Authorization: Bearer \$$3\"} -d '$2'"
  OUT=$(curl -s -w '\nHTTP %{http_code}' -A "$UA" -X POST "$BASE$1" -H 'Content-Type: application/json' ${3:+-H "Authorization: Bearer ${!3}"} -d "$(subst "$2")"); mostrar; }
get() { # get RUTA [TOKEN]
  echo; echo "\$ curl -s \$BASE$1${2:+ -H \"Authorization: Bearer \$$2\"}"
  OUT=$(curl -s -w '\nHTTP %{http_code}' -A "$UA" "$BASE$1" ${2:+-H "Authorization: Bearer ${!2}"}); mostrar; }

RES_AC1=; RES_AC2=; RES_AC3=; RES_AC4=; RES_AC5=; RES_AC6=; RES_EXTRA=
veredicto() { if [ "$1" = "1" ]; then echo "  => $2: CUMPLE"; else echo "  => $2: NO CUMPLE"; fi; }

if [ "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/sesion/perfil")" != "401" ]; then
  echo "El servidor no responde en $BASE (¿está corriendo npm run dev?)"; exit 1
fi
valor "DELETE FROM refresh_tokens WHERE device_info='$UA'" >/dev/null

echo "################ AC-1  Login de admin con contraseña correcta -> 200 con access_token y refresh_token"
post /sesion/login '{"identifier":"admin","password":"Admin123!"}'
C1=$(code); AT1=$(jget "$(body)" .access_token); RT1=$(jget "$(body)" .refresh_token); TT=$(jget "$(body)" .token_type); EXP=$(jget "$(body)" .expires_in)
post /sesion/login '{"identifier":"ADMIN@norte-creativo.example","password":"Admin123!"}'
C1B=$(code)
[ "$C1" = 200 ] && [ -n "$AT1" ] && [ -n "$RT1" ] && [ "$TT" = Bearer ] && [ "$C1B" = 200 ] && RES_AC1=1
echo "  (HTTP $C1, token_type=$TT, expires_in=$EXP s, con email también: HTTP $C1B)"; veredicto "$RES_AC1" "AC-1"

echo; echo "################ AC-2  Contraseña mala, usuario inexistente y usuario inactivo -> 401 con el MISMO mensaje"
post /sesion/login '{"identifier":"admin","password":"contraseña-mala"}'
C2A=$(code); B2A=$(body)
post /sesion/login '{"identifier":"no-existe","password":"Admin123!"}'
C2B=$(code); B2B=$(body)
# usuario inactivo: se crea con status inactive (con el token de admin), se intenta el login y se elimina
post /usuarios '{"username":"inactivo_prueba","email":"inactivo_prueba@norte-creativo.example","password":"Clave-Lab-123","status":"inactive"}' AT1
INAC_ID=$(valor "SELECT id FROM users WHERE username='inactivo_prueba'")
post /sesion/login '{"identifier":"inactivo_prueba","password":"Clave-Lab-123"}'
C2C=$(code); B2C=$(body)
echo; echo "\$ comparar los tres cuerpos de error"; echo "  contraseña mala : $B2A"; echo "  usuario inexistente: $B2B"; echo "  usuario inactivo: $B2C"
[ "$C2A" = 401 ] && [ "$C2B" = 401 ] && [ "$C2C" = 401 ] && [ "$B2A" = "$B2B" ] && [ "$B2A" = "$B2C" ] && RES_AC2=1
echo "  (HTTP $C2A / $C2B / $C2C; mensajes idénticos: $([ "$B2A" = "$B2B" ] && [ "$B2A" = "$B2C" ] && echo sí || echo no))"; veredicto "$RES_AC2" "AC-2"

echo; echo "################ AC-3  Refresh entrega un par nuevo; reusar el refresh anterior -> 401 (y se revoca la familia)"
post /sesion/refresh '{"refresh_token":"$RT1"}'
C3A=$(code); AT2=$(jget "$(body)" .access_token); RT2=$(jget "$(body)" .refresh_token)
post /sesion/refresh '{"refresh_token":"$RT2"}'
C3B=$(code); RT3=$(jget "$(body)" .refresh_token)
post /sesion/refresh '{"refresh_token":"$RT1"}'
C3C=$(code)
post /sesion/refresh '{"refresh_token":"$RT3"}'
C3D=$(code)
sql "SELECT id, LEFT(family_id,8) AS familia, status, revoked_at IS NOT NULL AS revocada FROM refresh_tokens WHERE device_info='$UA' AND user_id=(SELECT id FROM users WHERE username='admin') ORDER BY id"
[ "$C3A" = 200 ] && [ -n "$RT2" ] && [ "$RT2" != "$RT1" ] && [ "$C3B" = 200 ] && [ -n "$RT3" ] && [ "$C3C" = 401 ] && [ "$C3D" = 401 ] && RES_AC3=1
echo "  (refresh 1: HTTP $C3A; refresh 2: HTTP $C3B; REUSO del primero: HTTP $C3C; el último de la familia ya no sirve: HTTP $C3D)"; veredicto "$RES_AC3" "AC-3"

echo; echo "################ AC-4  Después de logout, el refresh token ya no sirve (401)"
post /sesion/login '{"identifier":"admin","password":"Admin123!"}'
RT4=$(jget "$(body)" .refresh_token)
post /sesion/logout '{"refresh_token":"$RT4"}'
C4A=$(code)
post /sesion/logout '{"refresh_token":"$RT4"}'
C4B=$(code)
post /sesion/refresh '{"refresh_token":"$RT4"}'
C4C=$(code)
[ "$C4A" = 200 ] && [ "$C4B" = 200 ] && [ "$C4C" = 401 ] && RES_AC4=1
echo "  (logout: HTTP $C4A; logout repetido (idempotente): HTTP $C4B; refresh con el token cerrado: HTTP $C4C)"; veredicto "$RES_AC4" "AC-4"

echo; echo "################ AC-5  Perfil (usuario + roles) y permisos; sin token -> 401"
post /sesion/login '{"identifier":"admin","password":"Admin123!"}'
AT5=$(jget "$(body)" .access_token); RT5=$(jget "$(body)" .refresh_token)
get /sesion/perfil AT5
C5A=$(code); P_ROLES=$(jget "$(body)" '.usuario.roles.map(r=>r.name).join(",")'); P_USER=$(jget "$(body)" .usuario.username); P_PASS=$(echo "$(body)" | grep -c password)
get /permisos AT5
C5B=$(code); P_TOT=$(jget "$(body)" .total)
get /sesion/perfil
C5C=$(code)
get /permisos
C5D=$(code)
post /sesion/login '{"identifier":"finanzas","password":"Finanzas123!"}'
ATF=$(jget "$(body)" .access_token)
get /permisos ATF
F_TOT=$(jget "$(body)" .total)
get /usuarios AT5
C5E=$(code)
EXPECTED_ADMIN=$(valor "SELECT COUNT(*) FROM resource_roles rr JOIN role_users ru ON ru.role_id=rr.role_id JOIN roles r ON r.id=rr.role_id JOIN resources s ON s.id=rr.resource_id WHERE ru.user_id=(SELECT id FROM users WHERE username='admin') AND ru.status='active' AND r.status='active' AND rr.status='active' AND s.status='active'")
EXPECTED_FIN=$(valor "SELECT COUNT(*) FROM resource_roles rr JOIN role_users ru ON ru.role_id=rr.role_id JOIN roles r ON r.id=rr.role_id JOIN resources s ON s.id=rr.resource_id WHERE ru.user_id=(SELECT id FROM users WHERE username='finanzas') AND ru.status='active' AND r.status='active' AND rr.status='active' AND s.status='active'")
[ "$C5A" = 200 ] && [ "$P_USER" = admin ] && [ "$P_ROLES" = ADMIN ] && [ "$P_PASS" = 0 ] && [ "$C5B" = 200 ] && [ "$P_TOT" = "$EXPECTED_ADMIN" ] && [ "$F_TOT" = "$EXPECTED_FIN" ] && [ "$C5C" = 401 ] && [ "$C5D" = 401 ] && [ "$C5E" = 200 ] && RES_AC5=1
echo "  (perfil: HTTP $C5A, usuario=$P_USER, roles=$P_ROLES, 'password' en la respuesta: $P_PASS; permisos de admin=$P_TOT (BD: $EXPECTED_ADMIN), de finanzas=$F_TOT (BD: $EXPECTED_FIN); sin token: HTTP $C5C / $C5D; el access token del login abre /usuarios: HTTP $C5E)"; veredicto "$RES_AC5" "AC-5"

echo; echo "################ AC-6  npx tsc --noEmit sin errores"
echo; echo "\$ npx tsc --noEmit; echo \"exit=\$?\""
npx tsc --noEmit 2>&1 | grep -v "npm notice"; npx tsc --noEmit >/dev/null 2>&1 && RES_AC6=1 && echo "exit=0" || echo "exit=1"
veredicto "$RES_AC6" "AC-6"

echo; echo "################ EXTRA  El refresh token no se guarda en claro y se registra el dispositivo"
sql "SELECT id, LEFT(token_hash,16) AS inicio_del_hash, device_info, status FROM refresh_tokens WHERE device_info='$UA' ORDER BY id"
X_CLARO=$(valor "SELECT COUNT(*) FROM refresh_tokens WHERE token_hash='$RT5'"); X_HASH=$(valor "SELECT COUNT(*) FROM refresh_tokens WHERE token_hash=SHA2('$RT5',256)"); X_DEV=$(valor "SELECT COUNT(*) FROM refresh_tokens WHERE device_info='$UA'")
[ "$X_CLARO" = 0 ] && [ "$X_HASH" = 1 ] && [ "$X_DEV" -ge 1 ] && RES_EXTRA=1
echo "  (filas con el refresh en claro: $X_CLARO; con su SHA-256: $X_HASH; sesiones con device_info='$UA': $X_DEV)"; veredicto "$RES_EXTRA" "EXTRA"

echo; echo "(limpieza: se borran las sesiones de esta prueba y el usuario inactivo de prueba)"
valor "DELETE FROM refresh_tokens WHERE device_info='$UA'" >/dev/null
[ -n "$INAC_ID" ] && curl -s -o /dev/null -X DELETE "$BASE/usuarios/$INAC_ID" -H "Authorization: Bearer $AT5"
echo "  usuario inactivo de prueba restante: $(valor "SELECT COUNT(*) FROM users WHERE username='inactivo_prueba'")"

echo; echo "################ RESUMEN"
for A in AC1 AC2 AC3 AC4 AC5 AC6 EXTRA; do
  R=RES_$A; if [ "${!R}" = "1" ]; then echo "  $A  CUMPLE"; else echo "  $A  NO CUMPLE"; fi
done
