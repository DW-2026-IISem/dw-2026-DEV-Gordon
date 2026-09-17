> **Workspace:** `backend_IA` (Norte Creativo) · **Pista:** solo Business (7 issues) · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **SDD del proyecto:** `docs/sdd.md`

# ISS-01 — Esqueleto NestJS CA arrancable

**Naturaleza:** práctico (desarrollo de software backend)
**Issue GitHub:** `#__` (número que asigna GitHub al crear el Issue; anótalo aquí y en el cuerpo del Issue)
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:**
**Dependencias:** ninguna (primer issue del proyecto)
**Commit esperado:** `feat(iss-01): esqueleto NestJS CA arrancable` con `Refs #__`

> El estado del issue **vive en el tablero Kanban (GitHub Projects)**, no en este archivo. Cada sección indica en qué estado se diligencia; hasta entonces se deja como está.

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, el desarrollador podrá arrancar un proyecto NestJS versionado en Git, con el árbol de Clean Architecture, para construir sobre él las features de Norte Creativo sin reorganizar carpetas.

**SPEC:**
- Proyecto NestJS (npm, ESM) generado **en la raíz de `backend_IA/`**, conservando intactos `.git/` y `docs/`.
- Árbol `src/config/`, `src/common/`, `src/infrastructure/database/`, `src/features/business/` (vacío o con `business.module.ts` stub).
- `main.ts` con prefijo global `/api`, CORS (`enableCors({ origin: 'http://localhost:4200', credentials: true })`), `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`) y `listen(PORT ?? 3011)`.
- Endpoint de salud `GET /api/health` → `200 { "status": "ok" }` (comprueba el arranque sin BD).
- Script `free:port` (`scripts/free-port.js`) y `start:dev` que lo invoque antes de `nest start --watch`.
- `.gitignore` con `node_modules/`, `dist/`, `.env`.

**REQ:**
- Fuera de alcance: Sequelize, base de datos, `.env` de BD, Auth, Users, JWT, RBAC. Eso es ISS-02 en adelante.
- No `sync({ force: true })` (aquí ni siquiera hay Sequelize).
- No adelantar ISS-02. No borrar ni reescribir `docs/`.
- Puerto **3011** (distinto del 3010 del backend_manual, para poder correr ambos a la vez).

**AC:**
- [x] **AC-1** Dado el workspace con `.git/` y `docs/`; cuando la IA termina; entonces existen `package.json` y `src/main.ts`, y `docs/` sigue intacto (`git status` no muestra borrados en esa carpeta).
- [x] **AC-2** Dado el proyecto con dependencias instaladas; cuando **el desarrollador** ejecuta `npm run start:dev`; entonces la app levanta sin error y el log muestra `Nest application successfully started` en el puerto `3011`.
- [x] **AC-3** Dado la app arriba; cuando se hace `GET http://localhost:3011/api/health`; entonces responde `200` con `{ "status": "ok" }`.
- [x] **AC-4** Dado `src/`; cuando se listan sus carpetas; entonces existen `config/`, `common/`, `infrastructure/database/`, `features/business/` y **no** existe `features/auth/`.

**Checklist interno:**
- [x] Generar Nest sin borrar `.git`, `docs/`
- [x] Árbol CA
- [x] `main.ts`: prefijo `/api`, CORS, `ValidationPipe`, puerto 3011
- [x] `GET /api/health`
- [x] `scripts/free-port.js` + scripts npm
- [x] `.gitignore`

---

## 2. Revisión de AC — autoriza **En curso** 

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|07/19  | Carlos Z |  Verificador y revisor  | OBJ, SPEC, REQ, AC | este archivo   |          | pendiente |

Decisión posible: `AC aprobados — puede En curso` · `Ajustar AC` (indicar cuál y por qué).

---

## 3. IA usada

**Herramienta / modelo:** Claude Code - modelo sonnet 5 high.
**Fecha:** (17/09)
**Prompt enviado**:

```text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-01, no del backend entero.

Implementa los AC de docs/trazabilidad/ISS-01.md.

Contexto del directorio: ya tiene .git/ y docs/. NO los borres ni los modifiques.
Genera el proyecto NestJS con npm en un directorio temporal
(nest new backend_IA --skip-git --package-manager npm) y mueve su contenido a la raiz del workspace,
fusionando .gitignore (debe incluir node_modules/, dist/, .env).

Crea el arbol src/config, src/common, src/infrastructure/database, src/features/business (con business.module.ts stub).
En main.ts: setGlobalPrefix('api'), enableCors({ origin: 'http://localhost:4200', credentials: true }), ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
listen(process.env.PORT ?? 3011). Endpoint GET /api/health -> 200 { "status": "ok" }.
Crea scripts/free-port.js y los scripts npm free:port y start:dev (free:port && nest start --watch).

Prohibido: Sequelize, base de datos, .env de BD, Auth, Users, JWT Token, login, RBAC. NO adelantes ISS-02.
NO toques docs/.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

**Ajustes o correcciones que hiciste a lo generado:** (pendiente)

---

## 4. EVI — se diligencia en **Verificación** 

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | log de arranque | AC-2 | [5:20:56 PM] Starting compilation in watch mode...[5:20:59 PM] Found 0 errors. Watching for file changes.[Nest] 6020  - 09/17/2026, 5:21:00 PM     LOG [NestFactory] Starting Nest application... | `npm run start:dev` |
|       | respuesta HTTP | AC-3 | carloszarate@DESKTOP-B0F0J93:/mnt/c/Users/Carlos-Zarate$ curl -ihttp://localhost:3011/api/health HTTP/1.1 200 OK | `curl -i http://localhost:3011/api/health` |
|       | árbol | AC-1, AC-4 | app.controller.spec.ts  app.module.ts   common  features   main.ts app.controller.ts app.service.ts  config  infrastructure | `ls src src/features` |

**Commit (hash):** pendiente — `feat(iss-01): esqueleto NestJS CA arrancable` · `Refs #__` · hecho `git push`
**Autoevaluación de AC:** pendiente (AC-1: sí · AC-2: sí · AC-3: sí · AC-4: sí)

---

## 5. Revisión humana del resultado**

Preguntas guía: «Señala en el árbol qué va en `config`, qué en `common`, qué en `infrastructure` y qué en `features`». «¿Por qué el prefijo `/api` y el `ValidationPipe` están en `main.ts` y no en un controller?»

| Fecha | Revisor | Actuación (aporte · revisión conforme · devolución) | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------------------------------------------------|--------------|----------------------|----------|----------|
| 17/09 | Carlos Z | Revisor: El proyecto se ejecuto con normalidad en el puerto 3011 y respondio codigo 200 al hacer curl en el endpoint health |   Todos   |     Imagenes Adjuntas al proceso.md     | Todo funcional |  Issue marcada como terminada  |

**Respuesta del autor (ajuste o justificación):**

En la carpeta config va todo lo que configura el arranque, de la aplicacion antes de que exista cualquier logica de negocio, ahi vive la carga y la validacion del .env, no sabe nada de clientes ni de hitos, solo sabe que variables requiere para arrancar

common/ tiene las piezas que cualquier feature usara, sin importar el dominio, tiene las excepciones base, el filtro global de errores, los interceptores, si el dia de mañana se usa una feature de facturacion, tambien va a usar estas piezas

Infraestructure/database/ tiene el como hablamos con la base de datos, fabrica el sequelize, el modulo de conexion y sabe solo de la comunicacion con la BD y no del negocio

Feature/buisiness/ aqui va el negocio, todas las entidades y features viven aqui, cada una tendra sus cuatro capas, dominio, aplicacion, infraestructura y presentacion, dentro de cada feature

Cada una son transfersales, sirven para todo el proyecto, menos feature que es algo espesifico.

 
---

## 6. Gate 

**Estado:** aprobado (`aprobado` · `aprobado con observación` · `devuelto` · `cancelado`)

**Conclusión:** el proyecto arranca, puede pasarse al iss02

**Trazabilidad final:** [enlace al Issue)](https://github.com/DW-2026-IISem/dw-2026-DEV-Gordon/issues/1)
