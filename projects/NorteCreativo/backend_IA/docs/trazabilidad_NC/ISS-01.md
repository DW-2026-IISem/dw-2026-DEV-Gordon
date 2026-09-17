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

**SPEC (qué debe quedar):**
- Proyecto NestJS (npm, ESM) generado **en la raíz de `backend_IA/`**, conservando intactos `.git/` y `docs/`.
- Árbol `src/config/`, `src/common/`, `src/infrastructure/database/`, `src/features/business/` (vacío o con `business.module.ts` stub).
- `main.ts` con prefijo global `/api`, CORS (`enableCors({ origin: 'http://localhost:4200', credentials: true })`), `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`) y `listen(PORT ?? 3011)`.
- Endpoint de salud `GET /api/health` → `200 { "status": "ok" }` (comprueba el arranque sin BD).
- Script `free:port` (`scripts/free-port.js`) y `start:dev` que lo invoque antes de `nest start --watch`.
- `.gitignore` con `node_modules/`, `dist/`, `.env`.

**REQ (restricciones):**
- Fuera de alcance: Sequelize, base de datos, `.env` de BD, Auth, Users, JWT, RBAC. Eso es ISS-02 en adelante.
- No `sync({ force: true })` (aquí ni siquiera hay Sequelize).
- No adelantar ISS-02. No borrar ni reescribir `docs/`.
- Puerto **3011** (distinto del 3010 del backend_manual, para poder correr ambos a la vez).

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [ ] **AC-1** Dado el workspace con `.git/` y `docs/`; cuando la IA termina; entonces existen `package.json` y `src/main.ts`, y `docs/` sigue intacto (`git status` no muestra borrados en esa carpeta).
- [ ] **AC-2** Dado el proyecto con dependencias instaladas; cuando **el desarrollador** ejecuta `npm run start:dev`; entonces la app levanta sin error y el log muestra `Nest application successfully started` en el puerto `3011`.
- [ ] **AC-3** Dado la app arriba; cuando se hace `GET http://localhost:3011/api/health`; entonces responde `200` con `{ "status": "ok" }`.
- [ ] **AC-4** Dado `src/`; cuando se listan sus carpetas; entonces existen `config/`, `common/`, `infrastructure/database/`, `features/business/` y **no** existe `features/auth/`.

**Checklist interno (lo ejecuta la IA en En curso; no sale al tablero):**
- [ ] Generar Nest sin borrar `.git`, `docs/`
- [ ] Árbol CA
- [ ] `main.ts`: prefijo `/api`, CORS, `ValidationPipe`, puerto 3011
- [ ] `GET /api/health`
- [ ] `scripts/free-port.js` + scripts npm
- [ ] `.gitignore`

---

## 2. Revisión de AC — autoriza **En curso** (la escribe el revisor al final de Preparado)

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       |         |           | OBJ, SPEC, REQ, AC | este archivo   |          | pendiente |

Decisión posible: `AC aprobados — puede En curso` · `Ajustar AC` (indicar cuál y por qué).

---

## 3. IA usada — se diligencia en **En curso**, después de enviar el prompt

**Herramienta / modelo:** Claude Code (pendiente indicar modelo)
**Fecha:** (pendiente)
**Prompt enviado** (copiado **tal cual** del Guion):

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

## 4. EVI — se diligencia en **Verificación** (después de ejecutar tú mismo)

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | log de arranque | AC-2 | (pegar 3–5 líneas del log o ruta a captura) | `npm run start:dev` |
|       | respuesta HTTP | AC-3 | (pegar respuesta) | `curl -i http://localhost:3011/api/health` |
|       | árbol | AC-1, AC-4 | (salida de `ls src src/features`) | `ls src src/features` |

**Commit (hash):** pendiente — `feat(iss-01): esqueleto NestJS CA arrancable` · `Refs #__` · hecho `git push`
**Autoevaluación de AC:** pendiente (AC-1: sí/no · AC-2: sí/no · AC-3: sí/no · AC-4: sí/no)

---

## 5. Revisión humana del resultado — la escribe el revisor en **Revisión humana**

Preguntas guía: «Señala en el árbol qué va en `config`, qué en `common`, qué en `infrastructure` y qué en `features`». «¿Por qué el prefijo `/api` y el `ValidationPipe` están en `main.ts` y no en un controller?»

| Fecha | Revisor | Actuación (aporte · revisión conforme · devolución) | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------------------------------------------------|--------------|----------------------|----------|----------|
|       |         |           |              |                      |          |          |

**Respuesta del autor (ajuste o justificación):**

---

## 6. Gate — decide **Hecho** (solo el revisor)

**Estado:** pendiente (`aprobado` · `aprobado con observación` · `devuelto` · `cancelado`)
**Conclusión:**
**Trazabilidad final:** (hash del commit definitivo + enlace al Issue)
