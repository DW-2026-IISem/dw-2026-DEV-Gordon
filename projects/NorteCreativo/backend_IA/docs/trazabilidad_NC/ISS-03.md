> **Workspace:** `backend_IA` (Norte Creativo) · **Pista:** solo Business (7 issues) · **Guion:** `docs/proceso.md` · **SDD del proyecto:** `docs/sdd.md`

# ISS-03 — Feature clientes CA

**Naturaleza:** práctico 
**Issue GitHub:** `#3`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:*Carlos H. Zárate*
**Dependencias:** ISS-02 en **Hecho**
**Commit esperado:** `feat(iss-03): feature clientes CA` con `Refs #3`

---

## 1. SDD

**OBJ:** Al finalizar, cualquier consumidor HTTP podrá registrar y consultar clientes persistidos en `norte_creativo`, con validación de entrada, para contar con la primera feature completa que sirve de patrón a las siguientes.

**SPEC (qué debe quedar):**
- Feature `src/features/business/clientes/` con las cuatro capas (domain, application, infrastructure, presentation).
- **Dominio:** entidad `Cliente` pura con los campos del SDD §4.1 (`id`, `tipoDocumento`, `numeroDocumento`, `nombre`, `telefono?`, `email?`, `estado`); interfaz `IClienteRepository`; excepciones `ClienteNotFoundException`, `DocumentoYaExisteException`.
- **Aplicación:** `CreateClienteDto` (`tipoDocumento`, `numeroDocumento`, `nombre` requeridos; `email` opcional con formato; `telefono` opcional), mapper, use-cases `CreateCliente`, `ListClientes`, `GetClienteById`.
- **Infraestructura:** `ClienteModel` (tabla `clientes`) registrado en `ALL_MODELS`; `ClienteRepository` (Sequelize); seeder idempotente (`findOrCreate` por `numeroDocumento`) que deja al menos 1 cliente demo (Postobón S.A.).
- **Presentación:** `ClientesController` con `GET /api/clientes`, `GET /api/clientes/:id`, `POST /api/clientes`; Swagger (decoradores en el controller; el arranque de `SwaggerModule` se materializa en ISS-07).
- `ClientesModule` registrado en `BusinessModule`.

**REQ (restricciones):**
- La entidad de dominio **no** extiende `Model` ni importa `sequelize`/`sequelize-typescript`/`@nestjs/*`.
- Regla de negocio: `numeroDocumento` es único (409 si se repite).
- Sin JWT, Auth ni guards. No adelantar ISS-04 (campanias).

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [x] **AC-1** Dado la app arrancada y la tabla `clientes` vacía; cuando corre el seeder al arrancar; entonces `GET /api/clientes` responde `200` con al menos 1 cliente en `data.items` (`data.meta.total` ≥ 1), y **arrancar de nuevo no duplica** filas.
- [x] **AC-2** Dado un payload válido `{ "tipoDocumento": "NIT", "numeroDocumento": "...", "nombre": "...", "email": "..." }`; cuando `POST /api/clientes`; entonces responde `201` con el cliente creado en `data` (con `id`) y la fila existe en la tabla.
- [x] **AC-3** Dado un payload sin `nombre` (o con un campo no permitido); cuando `POST /api/clientes`; entonces responde `400` y el conteo de filas **no cambia**.
- [x] **AC-4** Dado un `numeroDocumento` ya registrado; cuando `POST /api/clientes` con ese documento; entonces responde `409` y no crea fila.
- [x] **AC-5** Dado un `id` inexistente; cuando `GET /api/clientes/999999`; entonces responde `404`.
- [x] **AC-6** Dado `domain/entities/cliente.entity.ts`; cuando se inspecciona; entonces es TypeScript puro: sin decoradores de Sequelize, sin `extends Model`, sin imports de NestJS.

**Checklist interno (IA, En curso):**
- [x] Entidad, interface, excepciones (domain)
- [x] DTO, mapper, use-cases (application)
- [x] Model, repositorio, seeder (infrastructure) + `ALL_MODELS`
- [x] Controller + Swagger (presentation)
- [x] Módulo registrado en `BusinessModule`

---

## 2. Revisión de AC

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|17/09 | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo   |          | pendiente |

---

## 3. IA usada 

**Herramienta / modelo:** Claude Code - modelo sonnet 5 high.

**Fecha:** (17/09)

**Prompt enviado**:

```text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-03, no del backend entero.

Implementa los AC de docs/trazabilidad/ISS-03.md.

Feature src/features/business/clientes con las cuatro capas. Entidad Cliente PURA (sin Sequelize ni NestJS):
id, tipoDocumento, numeroDocumento, nombre, telefono?, email?, estado.
IClienteRepository en domain/interfaces; ClienteRepository (Sequelize) y ClienteModel (tabla clientes) en infrastructure;
registra ClienteModel en ALL_MODELS. Use-cases CreateCliente, ListClientes, GetClienteById.
CreateClienteDto: tipoDocumento, numeroDocumento y nombre requeridos; email opcional con formato; telefono opcional.
Controller: GET /api/clientes, GET /api/clientes/:id, POST /api/clientes. Swagger.
Errores: DTO invalido -> 400 (ValidationPipe); id inexistente -> 404; numeroDocumento duplicado -> 409 (excepcion de dominio mapeada por el filtro).
Seeder idempotente (findOrCreate por numeroDocumento) con al menos un cliente demo (ej. Postobon S.A., NIT), ejecutado al arrancar.
ClientesModule en BusinessModule.

Prohibido: Auth, Users, JWT Token, guards, RBAC; entidad que extienda Model; force: true. NO adelantes ISS-04 (campanias).
NO toques docs/.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos curl exactos y SQL de conteo); que quedo fuera de alcance.
```

---

## 4. EVI 

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | log de arranque + conteo | AC-1 | (log del seeder + `SELECT COUNT(*) FROM clientes` ×2 arranques) | `npm run start:dev` ×2 |
|       | respuesta HTTP 201 | AC-2 | Ver proceso.md ISS 3 procedimiento | `curl -i -X POST localhost:3011/api/clientes -H 'Content-Type: application/json' -d '{"tipoDocumento":"CC","numeroDocumento":"123","nombre":"Ana"}'` |
|       | respuesta HTTP 400 | AC-3 | Ver proceso.md ISS 3 procedimiento | `curl -i -X POST localhost:3011/api/clientes -H 'Content-Type: application/json' -d '{"nombre":""}'` |
|       | respuesta HTTP 409 | AC-4 | Ver proceso.md ISS 3 procedimiento | repetir el POST de AC-2 |
|       | respuesta HTTP 404 | AC-5 | Ver proceso.md ISS 3 procedimiento | `curl -i localhost:3011/api/clientes/999999` |
|       | archivo fuente | AC-6 | `.../clientes/domain/entities/cliente.entity.ts` | `rg -n "sequelize|@nestjs|extends Model" <ruta>` → sin resultados |

**Commit (hash):** Compeltado — `feat(iss-03): feature clientes CA` · `Refs #3`
**Autoevaluación de AC:** Compeltado

---

## 5. Revisión humana del resultado

Revisión **estricta** (es el patrón): el desarrollador debe **señalar y explicar** entidad, interfaz, model, use-case y controller, y decir por qué el use-case recibe `IClienteRepository` y no `ClienteRepository` (Sequelize). Si no puede explicarlo → **devolución**.

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 17/09 | Carlos Z | revisor  |  todos |  Ver proceso.md ISS 3 procedimiento   |          |          |

**Respuesta del autor (ajuste o justificación):**

la entidad cliente es una clase de ts plana, numero documento, nombre, telefono, mail, estado, no extiende model de sequlize, no decoradoresno importda nada de nestjs, si mañana se cambia de orm esta entidad no se inmuta

a interfaz iclienterepository es el contrato, dice que metodos tiene que cumplir un repositorio de
clientes (create, findall, findbyid, findbynumerodocumento, count) pero no dice como se hacen, es una
promesa nomas

el clientemodel si tiene los decoradores de sequelize, tabla y columnas, porque su trabajo es hablar con
mysql, ahi si puede vivir todo eso

el clienterepository conecta las dos cosas, implementa iclienterepository usando clientemodel por dentro,
el como vive aca, el que vive en domain

los use cases (createcliente, listclientes, getclientebyid) reciben iclienterepository, no clienterepository
directo, porque si dependieran de la clase de sequelize quedarian pegados a sequelize, y si el dia de
mañana cambio de orm o quiero probar sin bd real tendria que tocar la logica de negocio, con la interfaz
el use case ni sabe que existe sequelize, eso se resuelve solo en el modulo con
{ provide: cliente_repository, usaclass: clienterepository }, ese es el unico lugar donde se decide la
implementacion real

el controller recibe la peticion http, valida el dto, llama al use case y devuelve la respuesta, no tiene
logica de negocio ni sabe de sequelize, solo traduce http a use case y de vuelta

la regla es domain no depende de nada, application depende de domain por interfaces, infrastructure
implementa esas interfaces, presentation depende de application, la flecha siempre apunta hacia adentro
---

## 6. Gate

**Estado:** aprobado 

**Conclusión:** se cumplieron todos los AC, se pasa al issue #4

**Trazabilidad final:** [enlace al Issue)](https://github.com/DW-2026-IISem/dw-2026-DEV-Gordon/issues/3)