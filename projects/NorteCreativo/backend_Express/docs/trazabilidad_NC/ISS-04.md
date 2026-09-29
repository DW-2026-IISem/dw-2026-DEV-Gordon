> **Workspace:** `backend_express` (Norte Creativo) · **Pista:** Business Express + TypeScript (7 issues) · **Guion:** `docs/proceso.md` · **SDD del proyecto:** `docs/sdd.md`

# ISS-04 — Seeders con Faker (feature + runner)

**Naturaleza:** práctico
**Issue GitHub:** `#4`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-03 en **Hecho**
**Commit esperado:** `feat(iss-04): seeders Faker Refs #4`

---

## 1. SDD

**OBJ:** Al finalizar, se podrá poblar la tabla `clientes` con datos falsos coherentes mediante `npm run db:seed`, variando la cantidad, sin duplicar al repetir.

**SPEC (qué debe quedar):**
- `@faker-js/faker` (dev).
- `src/features/business/cliente/cliente.seeder.ts` con `seedClientes(count)`, idempotente (si ya hay filas, omite).
- Datos con sentido para Norte Creativo: `tipo_documento` en `NIT` o `CC`, `numero_documento` único, `nombre` de empresa, `telefono` y `email` válidos, `status: active`.
- `src/database/seeders/counts.ts` con la cantidad por entidad (default, variable `SEED_CLIENTES` y argumento `--clientes=N`).
- `src/database/seeders/index.ts` (SeedersRunner): conecta, hace `sync`, ejecuta seeders en orden y cierra la conexión.
- Script `db:seed` en `package.json`.

**REQ (restricciones):**
- El seeder NO se ejecuta al arrancar la app; solo con `npm run db:seed`.
- No adelantar Swagger ni Campania.

**AC:**
- [x] **AC-1** Dado la tabla vacía; cuando `npm run db:seed`; entonces se insertan los clientes del conteo por defecto.
- [x] **AC-2** Dado la tabla con datos; cuando se vuelve a correr `npm run db:seed`; entonces no se duplican filas.
- [x] **AC-3** Dado la tabla vacía; cuando `npm run db:seed -- --clientes=20` o `SEED_CLIENTES=5 npm run db:seed`; entonces se insertan 20 o 5.
- [x] **AC-4** Dado los clientes sembrados; cuando `GET /api/clientes`; entonces aparecen con documentos únicos y emails válidos.

**Checklist interno (IA, En curso):**
- [x] Faker instalado
- [x] cliente.seeder.ts idempotente
- [x] counts.ts (default/env/CLI)
- [x] SeedersRunner
- [x] script db:seed

---

## 2. Revisión de AC

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

---

## 3. IA usada

**Herramienta / modelo:** Claude Code - Sonnet 5

**Fecha:** 28/09/26

**Prompt enviado**:

```text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-04, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-04.md siguiendo docs/manual.md seccion 9 (ISS-04, seeders con Faker), adaptado a Cliente.

Instala @faker-js/faker como dev.
Crea src/features/business/cliente/cliente.seeder.ts con export async function seedClientes(count: number): Promise<number>,
idempotente (si Cliente.count() > 0, omite). Datos coherentes: tipo_documento NIT o CC, numero_documento unico,
nombre de empresa, telefono y email validos, status active.
Crea src/database/seeders/counts.ts (clientes: default, variable SEED_CLIENTES, argumento --clientes=N)
y src/database/seeders/index.ts (SeedersRunner) que conecta, hace sync sin force/alter, ejecuta los seeders en orden y cierra la conexion.
Agrega el script "db:seed" en package.json como en el manual.
El seeder NO debe ejecutarse al arrancar la app.

Prohibido: Swagger, Campania, Hito, force, alter. NO adelantes ISS-05. Prohibido: autenticacion, JWT, bcrypt, passwords, guards, RBAC, NestJS. NO toques docs/. NO commitees .env.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | conteo tras seed | AC-1 | (Evidencia en Proceso.md) | `npm run db:seed` y `SELECT COUNT(*) FROM clientes` |
|       | idempotencia | AC-2 | (Evidencia en Proceso.md) | `npm run db:seed` dos veces, mismo COUNT |
|       | cantidad variable | AC-3 | (Evidencia en Proceso.md) | `npm run db:seed -- --clientes=20` (con tabla vacía) |
|       | datos coherentes | AC-4 | (Evidencia en Proceso.md) | `curl localhost:3012/api/clientes` |

**Commit (hash):** `feat(iss-04): seeders Faker Refs #4`
**Autoevaluación de AC:** Completado

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Por qué el seeder vive dentro del feature pero el runner vive en `database/seeders`?». «¿Qué garantiza que correr el seed dos veces no duplique?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       |         |           |              |                      |          |          |

**Respuesta del autor (ajuste o justificación):**

el seeder vive dentro del feature porque solo el feature sabe como se ve un cliente valido, que campos
tiene, que tipo de documento usar, como generar un email coherente, esa logica es especifica del dominio
de clientes y no tiene sentido moverla afuera

el runner vive en database/seeders porque su trabajo es distinto, no genera datos, orquesta, decide el
orden en que se siembran las features (primero clientes porque campanias los necesita), conecta la base,
hace el sync y cierra la conexion al final, si el runner estuviera dentro del feature cliente no tendria
como coordinar el orden con las demas features

lo que garantiza que correr el seed dos veces no duplique es que el seeder pregunta antes de insertar,
antes de crear nada hace client.count() y si ya hay filas se sale sin hacer nada, no depende de un unique
en la base ni de revisar uno por uno, simplemente si la tabla no esta vacia asume que ya se sembro y no
vuelve a insertar
---

## 6. Gate

**Estado:** completado
**Trazabilidad final:** completado
