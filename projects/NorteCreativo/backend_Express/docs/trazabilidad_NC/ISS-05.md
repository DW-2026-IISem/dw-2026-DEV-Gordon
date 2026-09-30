> **Workspace:** `backend_express` (Norte Creativo) · **Pista:** Business Express + TypeScript (7 issues) · **Guion:** `docs/proceso.md` · **SDD del proyecto:** `docs/sdd.md`

# ISS-05 — Swagger / OpenAPI (feature + registry)

**Naturaleza:** práctico
**Issue GitHub:** `#5`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-04 en **Hecho**
**Commit esperado:** `feat(iss-05): swagger openapi Refs #5`

---

## 1. SDD

**OBJ:** Al finalizar, la API de clientes quedará documentada en OpenAPI 3 y visible en Swagger UI, con un registry que permita sumar features siguientes.

**SPEC (qué debe quedar):**
- `swagger-ui-express` (+ tipos).
- `src/features/business/cliente/cliente.swagger.ts` exportando `clienteSwagger` (`tags`, `paths`, `components.schemas`) con los 7 endpoints, leyenda **SIN AUTH**.
- `src/swagger/index.ts` (registry) que fusiona los módulos de features y exporta `setupSwagger(app)`.
- `App` con método `docs()` que llama `setupSwagger`.
- `GET /api/docs` (UI) y `GET /api/docs.json` (spec). Servidor documentado: `http://localhost:3012`.

**REQ (restricciones):**
- El registry debe permitir agregar `campaniaSwagger` e `hitoSwagger` en ISS-06/07 sin reescribirlo.
- No adelantar Campania.

**AC:**
- [x] **AC-1** Dado la app arrancada; cuando se abre `http://localhost:3012/api/docs`; entonces carga Swagger UI con el tag Clientes.
- [x] **AC-2** Dado la app; cuando `GET /api/docs.json`; entonces devuelve el documento OpenAPI 3 con los paths de `/api/clientes`.
- [x] **AC-3** Dado Swagger UI; cuando se ejecuta *Try it out* en `GET /api/clientes`; entonces responde `200`.
- [x] **AC-4** Dado `src/swagger/index.ts`; cuando se revisa; entonces importa `clienteSwagger` desde el feature (no define los paths él mismo).

**Checklist interno (IA, En curso):**
- [x] swagger-ui-express
- [x] cliente.swagger.ts
- [x] swagger/index.ts registry
- [x] App.docs()
- [x] /api/docs y /api/docs.json

---

## 2. Revisión de AC

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

---

## 3. IA usada

**Herramienta / modelo:** Claude Code - sonet 5.5

**Fecha:** (pendiente)

**Prompt enviado**:

```text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-05, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-05.md siguiendo docs/manual.md seccion 10 (ISS-05, Swagger), adaptado a Cliente.

Instala swagger-ui-express y @types/swagger-ui-express (dev).
Crea src/features/business/cliente/cliente.swagger.ts exportando clienteSwagger (tags, paths, components.schemas)
con los 7 endpoints de /api/clientes (incluido PATCH /api/clientes/{id}/deactivate), marcados SIN AUTH,
con los campos reales del modelo (tipo_documento, numero_documento, nombre, telefono, email, status).
Crea src/swagger/index.ts (registry) que fusiona los modulos de features y exporta setupSwagger(app),
montando /api/docs (UI) y /api/docs.json (spec), servidor http://localhost:3012.
En src/config/index.ts agrega el metodo docs() que llama setupSwagger.

Prohibido: Campania, Hito. NO adelantes ISS-06. Prohibido: autenticacion, JWT, bcrypt, passwords, guards, RBAC, NestJS. NO toques docs/. NO commitees .env.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | Swagger UI | AC-1 | (Evidencia en Proceso.md) | abrir `http://localhost:3012/api/docs` (captura) |
|       | spec JSON | AC-2 | (Evidencia en Proceso.md) | `curl -s localhost:3012/api/docs.json | head -c 400` |
|       | Try it out | AC-3 | (Evidencia en Proceso.md) | captura de la ejecución en Swagger |
|       | archivo fuente | AC-4 | (Evidencia en Proceso.md) | `grep -n "clienteSwagger" src/swagger/index.ts` |

**Commit (hash):** `feat(iss-05): swagger openapi Refs #5`
**Autoevaluación de AC:** completado

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Por qué la documentación de cada endpoint vive en el feature y no en `src/swagger`?». «¿Qué tendrías que tocar para documentar Campania?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       |         |           |              |                      |          |          |

**Respuesta del autor (ajuste o justificación):**

la documentacion de cada endpoint vive en el feature, en cliente.swagger.ts, porque quien conoce los campos
reales del cliente, sus rutas y sus respuestas es el propio feature, si un dia cambia el modelo o se agrega
una ruta, el archivo que hay que tocar esta al lado del controller y no perdido en una carpeta aparte,
ademas asi cada feature es autocontenido, model, controller, routes, seeder y swagger en la misma carpeta

src/swagger solo tiene el registry, no documenta nada por su cuenta, su trabajo es juntar los swagger de
todos los features en un solo documento openapi y montar la interfaz en /api/docs y el json en
/api/docs.json, la clase app solo llama a setupswagger desde su metodo docs, y no sabe que endpoints
existen

para documentar campania tendria que hacer tres cosas, crear campania.swagger.ts dentro del feature
exportando campaniaswagger con sus tags, paths y schemas, importarlo en src/swagger/index.ts, y sumarlo
al merge de tags, paths y schemas del registry, el registry, app y el swagger de cliente no se tocan
---

## 6. Gate

**Estado:** completado

**Trazabilidad final:** completado
