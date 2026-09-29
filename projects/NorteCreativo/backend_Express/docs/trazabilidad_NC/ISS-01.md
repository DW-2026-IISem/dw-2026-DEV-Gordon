> **Workspace:** `backend_express` (Norte Creativo) · **Pista:** Business Express + TypeScript (7 issues) · **Guion:** `docs/proceso.md` · **SDD del proyecto:** `docs/sdd.md`

# ISS-01 — Esqueleto Express + TypeScript arrancable

**Naturaleza:** práctico
**Issue GitHub:** `#1`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ninguna (primer issue del backend Express)
**Commit esperado:** `feat(iss-01): esqueleto Express TS arrancable` con `Refs #1`

---

## 1. SDD

**OBJ:** Al finalizar, existirá un proyecto Express 5 + TypeScript arrancable en `backend_express/`, organizado por features, sobre el cual se construyen Cliente, Campania e Hito.

**SPEC (qué debe quedar):**
- Proyecto npm en la raíz de `backend_express/`, `package.json` con `"type": "commonjs"`, `name: norte-creativo-backend-express`, scripts `build` (`tsc`) y `dev` (`nodemon --watch src --ext ts --exec ts-node -- src/server.ts`).
- Dependencias del manual §2.3: `express`, `cors`, `dotenv`, `morgan`; dev: `typescript@~5.9`, `ts-node`, `nodemon`, `@types/*`.
- `tsconfig.json` del manual §2.4 (`rootDir ./src`, `outDir ./dist`, `strict: true`).
- Árbol: `src/config`, `src/database/seeders`, `src/routes`, `src/features/business/cliente`.
- `src/server.ts` + `src/config/index.ts` con la clase `App` (`settings`, `middlewares`, `routes`, `dbConnection`, `listen`), puerto por defecto **3012**.
- Adaptación Norte Creativo: `GET /api/health` → `200 { "status": "ok" }` para verificar arranque sin BD.
- `.gitignore` con `node_modules/`, `dist/`, `.env`.

**REQ (restricciones):**
- Fuera de alcance: Sequelize, base de datos, modelos, auth. No adelantar ISS-02.
- Puerto 3012 (3010 manual NestJS, 3011 IA NestJS).
- No borrar ni modificar `docs/`.

**AC:**
- [x] **AC-1** Dado el workspace con `docs/`; cuando la IA termina; entonces existen `package.json` (`type: commonjs`, scripts `build` y `dev`) y `docs/` sigue intacto.
- [x] **AC-2** Dado el proyecto; cuando se ejecuta `npx tsc --noEmit`; entonces no hay errores.
- [x] **AC-3** Dado el proyecto; cuando **el desarrollador** ejecuta `npm run dev`; entonces el log muestra `Servidor ejecutándose en puerto 3012`.
- [x] **AC-4** Dado la app arriba; cuando `GET http://localhost:3012/api/health`; entonces responde `200` con `{ "status": "ok" }`.
- [x] **AC-5** Dado `src/`; cuando se lista; entonces existen `config/`, `database/seeders/`, `routes/`, `features/business/cliente/` y no existe carpeta de auth.

**Checklist interno (IA, En curso):**
- [x] npm init + package.json (commonjs, scripts)
- [x] Dependencias Express/TS
- [x] tsconfig.json
- [x] Árbol de carpetas
- [x] server.ts + config/index.ts (App)
- [x] GET /api/health
- [x] .gitignore

---

## 2. Revisión de AC

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

---

## 3. IA usada

**Herramienta / modelo:** Claude Code - modelo (completar)

**Fecha:** (pendiente)

**Prompt enviado**:

```text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-01, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-01.md siguiendo docs/manual.md seccion 2 (ISS-01), adaptado al proyecto Norte Creativo.

Contexto: estas en projects/NorteCreativo/backend_express. Ya existe docs/. NO la borres ni la modifiques.
Ejecuta npm init -y aqui. package.json: "type": "commonjs", name "norte-creativo-backend-express",
scripts build = "tsc" y dev = "nodemon --watch src --ext ts --exec ts-node -- src/server.ts".
Instala exactamente las dependencias del manual seccion 2.3 (express 5, cors, dotenv, morgan; dev: typescript ~5.9, ts-node, nodemon, @types/node, @types/express, @types/cors, @types/morgan).
tsconfig.json igual al manual seccion 2.4.
Crea src/config, src/database/seeders, src/routes, src/features/business/cliente.
src/server.ts y src/config/index.ts con la clase App del manual seccion 2.5 (settings, middlewares, routes, dbConnection, listen),
con puerto por defecto process.env.PORT || 3012.
Agrega GET /api/health que responda 200 { "status": "ok" } (adaptacion del proyecto para verificar arranque).
.gitignore con node_modules/, dist/, .env.

Prohibido: Sequelize, base de datos, modelos. NO adelantes ISS-02. Prohibido: autenticacion, JWT, bcrypt, passwords, guards, RBAC, NestJS. NO toques docs/. NO commitees .env.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | package.json | AC-1 | (Evidencia en Proceso.md) | `cat package.json` y `git status docs/` |
|       | compilación | AC-2 | (videncia en Proceso.md) | `npx tsc --noEmit` |
|       | log de arranque | AC-3 | (videncia en Proceso.md) | `npm run dev` |
|       | respuesta HTTP | AC-4 | (videncia en Proceso.md) | `curl -i http://localhost:3012/api/health` |
|       | árbol | AC-5 | (videncia en Proceso.md) | `find src -type d | sort` |

**Commit (hash):** `feat(iss-01): esqueleto Express TS arrancable Refs #1`
**Autoevaluación de AC:** Completo

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Qué hace cada método de la clase `App` y en qué orden se ejecutan?». «¿Por qué `server.ts` solo instancia `App` y no configura Express directamente?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|28/09/2026|CarlosZ|Revisor|Todos|Proceso.md|          |Terminado|

**Respuesta del autor (ajuste o justificación):**

la clase app esta en config/index.ts y tiene cinco metodos, el constructor crea la instancia de express y llama en orden a settings, middlewares, routes y dbconnection, listen no lo llama el constructor, lo llama server.ts despues

settings fija el puerto, usa el que venga por parametro, si no el de la variable port del env y si no el 3012 por defecto, middlewares registra morgan para el log de las peticiones, cors, express.json para leer el body en json y urlencoded para formularios, routes por ahora esta vacio porque las rutas llegan con el iss-03 y aqui solo se agrego el health, dbconnection tambien esta vacio, la conexion a la bd llega en el iss-02, y listen es el que levanta el servidor en el puerto y muestra el log de servidor ejecutandose

el orden importa porque los middlewares tienen que estar registrados antes que las rutas, si express.json quedara despues de las rutas el body llegaria vacio a los controllers, por eso en el constructor siempre va settings, middlewares, routes y dbconnection en ese orden

server.ts solo instancia app y llama a listen porque es el punto de entrada y nada mas, toda la configuracion vive en la clase app, si en server.ts estuviera todo mezclado no se podria reutilizar la app sin levantar el servidor, por ejemplo para pruebas, y cada iss nuevo tendria que tocar el archivo de arranque, asi cada iss solo agrega cosas dentro de app y server.ts no cambia nunca

esto es distinto a nestjs, alla el arranque, el prefijo api, cors y el validationpipe se configuraban en main.ts, aca el equivalente es la clase app, y en vez de modulos que se importan entre si aca las rutas se agrupan en un solo archivo agregador que llega en el iss-03

---

## 6. Gate

**Estado:** Listo
**Trazabilidad final:** Proceso md
