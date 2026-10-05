> **Workspace:** `backend_Express` (Norte Creativo) · **Pista:** Refactor por capas + Auth con RBAC (ISS-12 a ISS-21) · **Manual base:** sitio del docente (Express 2026) · **SDD:** `docs/sdd.md`

# ISS-15 — Feature users (identidad y contraseña)

**Naturaleza:** práctico
**Issue GitHub:** `#15`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-14 en **Hecho**
**Página del docente:** https://tecnogua.com/academic/site/backend2026/manual/12-ISS-10-auth-users/
**Commit esperado:** `feat(iss-15): feature users Refs #15`

---

## 1. SDD

**OBJ:** Al finalizar, se podrán administrar usuarios con contraseña hasheada que nunca sale por la API, y habrá un usuario sembrado por cada rol.

**SPEC (qué debe quedar):**
- `features/auth/users/` por capas, API `/api/usuarios` (CRUD completo + `/:id/deactivate`).
- `password` se hashea en el modelo; el DTO de respuesta nunca la incluye.
- `username` y `email` únicos (409).
- Seeder idempotente con 5 usuarios: `admin`, `cuentas`, `creativo`, `aprobador`, `finanzas` (contraseñas de laboratorio documentadas en el README, p. ej. `Admin123!`).
- Rutas temporalmente sin protección; se protegen en ISS-18 y ISS-21.

**REQ (restricciones):**
- Los roles de cada usuario se asignan en ISS-17.

**AC:**
- [x] **AC-1** `POST /api/usuarios` responde 201 y la respuesta no trae `password`.
- [x] **AC-2** En la base, `password` está hasheada (empieza por `$2`).
- [x] **AC-3** Un `username` o `email` repetido responde 409.
- [x] **AC-4** `GET /api/usuarios` lista solo activos y ninguno trae `password`.
- [x] **AC-5** `npm run db:seed` ×2 deja exactamente 5 usuarios sembrados.
- [x] **AC-6** `npx tsc --noEmit` sin errores.

**Checklist interno (IA, En curso):**
- [x] capas users
- [x] hash en modelo
- [x] DTO sin password
- [x] unicidad 409
- [x] seeder 5 usuarios

---

## 2. Revisión de AC

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

---

## 3. IA usada

**Herramienta / modelo:** Claude Code - Sonnet 5.5

**Fecha:** 3/10/26

**Prompt enviado**:
```text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-15, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-15.md en projects/NorteCreativo/backend_Express.
Aplica el patron por capas (capas HTTP -> Controller -> Service -> Repository -> Model, DTOs por operacion, BaseController.run/paramId,
AppError, findOrFail) adaptado a Norte Creativo.
Puerto 3012, base norte_creativo_express, rutas en español como el docente.

Construye el feature users del docente en src/features/auth/users con API /api/usuarios (CRUD completo + deactivate).
La contraseña se hashea con bcrypt en el modelo y el DTO de respuesta nunca la devuelve. username y email unicos -> 409.
Seeder idempotente con 5 usuarios de laboratorio, uno por rol de Norte Creativo: admin, cuentas, creativo, aprobador, finanzas
(documenta las contraseñas de laboratorio en el README del backend). Registra seeder, rutas y swagger.

NO asignes roles (ISS-17) ni protejas rutas todavia. Prohibido: NestJS, force: true, secretos en el codigo (JWT_SECRET solo en .env; .env.example sin valores), cambiar el puerto 3012 o la base norte_creativo_express. NO toques docs/proceso.md ni docs/trazabilidad_NC/. NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | HTTP 201 sin password | AC-1 | ver docs/proceso.md, sección ISS - 15 | `curl -i -X POST localhost:3012/api/usuarios -H 'Content-Type: application/json' -d '{"username":"prueba","email":"prueba@nc.com","password":"Prueba123!"}'` |
|       | hash en BD | AC-2 | ver docs/proceso.md, sección ISS - 15 | `docker exec -it nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT username, LEFT(password,4) FROM users;"` |
|       | HTTP 409 | AC-3 | ver docs/proceso.md, sección ISS - 15 | repetir el POST de AC-1 |
|       | listado | AC-4 | ver docs/proceso.md, sección ISS - 15 | `curl -s localhost:3012/api/usuarios` |
|       | seed idempotente | AC-5 | ver docs/proceso.md, sección ISS - 15 | `npm run db:seed` ×2 + `docker exec -it nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT COUNT(*) FROM users;"` |
|       | compilación | AC-6 | ver docs/proceso.md, sección ISS - 15 | `npx tsc --noEmit` |

**Commit (hash):** `feat(iss-15): feature users Refs #15`
**Autoevaluación de AC:** Completado

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Dónde se hashea la contraseña y por qué ahí?». «¿Qué impide que `password` salga en una respuesta?». «¿Por qué el usuario no es el mismo `Cliente` del negocio?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

**Respuesta del autor (ajuste o justificación):**

la contraseña se hashea en el modelo de user, en un hook de sequelize que corre antes de guardar, usando el helper hash de shared/auth/password.ts, se hace ahi porque el modelo es el unico punto por el que pasa todo lo que se guarda en la tabla, el controller, el service y el seeder terminan llamando al modelo, entonces si el hash estuviera en el service y manana alguien crea un usuario desde el seeder o desde otro lado, la contraseña se guardaria en texto plano sin que nadie se de cuenta, en el modelo es imposible olvidarlo, y el service nunca maneja una contraseña ya hasheada por error

lo que impide que password salga en una respuesta es el dto de respuesta, el controller nunca devuelve el modelo de sequelize tal cual, siempre lo pasa por el dto de respuesta que solo tiene los campos permitidos (id, username, email, estado) y password no esta en la lista, entonces aunque el modelo la traiga de la base, no llega a la respuesta, se comprueba con curl y grep password en el post y en el listado, tiene que dar cero

el usuario no es el mismo cliente del negocio porque son dos cosas distintas, el cliente es la empresa a la que la agencia le hace campañas, como postobon, tiene tipo y numero de documento y no entra al sistema, el usuario es quien se autentica en la api, tiene username, email y contraseña, y despues va a tener roles, un cliente no tiene por que tener login y un usuario como cuentas o finanzas no es un cliente, si se mezclaran, la tabla de negocio terminaria con contraseñas y roles que no le corresponden, y cualquier cambio en la autenticacion afectaria al negocio

ajuste: al verificar el ac-5 conto solo los 5 usuarios sembrados por nombre, porque el usuario prueba que se crea en el ac-1 hace que un count total de 6

---

## 6. Gate

**Estado:** Completado
**Conclusión:** Completado
**Trazabilidad final:**
