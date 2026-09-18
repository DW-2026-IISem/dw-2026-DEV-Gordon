> **Workspace:** `backend_IA` (Norte Creativo) · **Pista:** solo Business (7 issues) · **Guion:** `docs/proceso.md` · **SDD del proyecto:** `docs/sdd.md`

# ISS-04 — Feature campanias CA

**Naturaleza:** práctico 
**Issue GitHub:** `#4`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate 
**Dependencias:** ISS-03 en **Hecho**
**Commit esperado:** `feat(iss-04): feature campanias CA` con `Refs #4`

---

## 1. SDD

**OBJ:** Al finalizar, se podrán registrar y consultar campañas asociadas a un cliente existente, validando la FK, para dar el contenedor bajo el cual cuelgan los hitos.

**SPEC (qué debe quedar):**
- Feature `src/features/business/campanias/` con las cuatro capas.
- **Dominio:** entidad `Campania` pura (`id`, `clienteId`, `nombre`, `descripcion?`, `isActive`); interfaz `ICampaniaRepository`; excepciones `CampaniaNotFoundException`, `CampaniaInactivaException`.
- **Aplicación:** `CreateCampaniaDto` (`clienteId`, `nombre` requeridos; `descripcion` opcional), mapper, use-cases `CreateCampania` (valida que el Cliente exista → 404 si no), `ListCampanias`, `GetCampaniaById`.
- **Infraestructura:** `CampaniaModel` (tabla `campanias`, FK a `clientes`) en `ALL_MODELS`; `CampaniaRepository`; seeder idempotente que crea la campaña demo (Carnaval 2026) sobre el cliente demo.
- **Presentación:** `CampaniasController` con `GET /api/campanias`, `GET /api/campanias/:id`, `POST /api/campanias`.
- `CampaniasModule` (importa `ClientesModule`) registrado en `BusinessModule`.

**REQ (restricciones):**
- Entidad de dominio pura (sin Sequelize/NestJS).
- Sin JWT/Auth/guards. No adelantar ISS-05 (hitos).

**AC:**
- [x] **AC-1** Dado el seeder corrido; cuando `GET /api/campanias`; entonces responde `200` con ≥ 1 campaña en `data.items`, sin duplicar al reiniciar.
- [x] **AC-2** Dado un `clienteId` existente y payload válido; cuando `POST /api/campanias`; entonces responde `201` con la campaña creada en `data`.
- [x] **AC-3** Dado un `clienteId` **inexistente**; cuando `POST /api/campanias`; entonces responde `404` y no crea fila.
- [x] **AC-4** Dado un payload sin `nombre` o con campo no permitido; cuando `POST /api/campanias`; entonces responde `400`.
- [x] **AC-5** Dado un `id` inexistente; cuando `GET /api/campanias/999999`; entonces responde `404`.
- [x] **AC-6** Dado `domain/entities/campania.entity.ts`; cuando se inspecciona; entonces es TypeScript puro.

**Checklist interno (IA, En curso):**
- [x] domain (entidad, interface, excepciones)
- [x] application (DTO, mapper, use-cases con validación de FK)
- [x] infrastructure (model con FK, repo, seeder) + `ALL_MODELS`
- [x] presentation (controller)
- [x] módulo (importa ClientesModule) en `BusinessModule`

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
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-04, no del backend entero.

Implementa los AC de docs/trazabilidad/ISS-04.md siguiendo el MISMO patron de src/features/business/clientes.

Feature src/features/business/campanias: entidad Campania PURA (id, clienteId, nombre requerido, descripcion?, isActive);
ICampaniaRepository; CampaniaModel (tabla campanias, FK a clientes via clienteId) en ALL_MODELS; use-cases CreateCampania,
ListCampanias, GetCampaniaById; CreateCampaniaDto (clienteId y nombre requeridos); controller GET /api/campanias,
GET /api/campanias/:id, POST /api/campanias; Swagger.
El use-case CreateCampania verifica que clienteId exista usando IClienteRepository (-> 404 si no existe).
Errores: 400 DTO invalido; 404 clienteId inexistente.
Seeder idempotente que crea al menos una campania demo (ej. "Carnaval 2026") sobre el cliente demo; debe ejecutarse
DESPUES del seeder de clientes. CampaniasModule importa ClientesModule y se registra en BusinessModule.

Prohibido: Auth, Users, JWT Token, guards, RBAC; entidad que extienda Model; force: true. NO adelantes ISS-05 (hitos).
NO toques docs/.

Al final entrega tres listas: archivos tocados; como verifico cada AC; que quedo fuera de alcance.
```


---

## 4. EVI — se diligencia en **Verificación**

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
| 17/09 | log + conteo | AC-1 | Ver proceso.md ISS 4 procedimiento | `npm run start:dev` ×2 |
| 17/09 | HTTP 201 | AC-2 | Ver proceso.md ISS 3 procedimiento | `curl -i -X POST localhost:3011/api/campanias -d '{"clienteId":1,"nombre":"Test"}' -H 'Content-Type: application/json'` |
| 17/09 | HTTP 404 (FK) | AC-3 | Ver proceso.md ISS 4 procedimiento | `curl` con `clienteId:999999` |
| 17/09 | HTTP 400 | AC-4 | Ver proceso.md ISS 4 procedimiento | `curl` sin `nombre` |
| 17/09 | HTTP 404 | AC-5 | Ver proceso.md ISS 4 procedimiento | `curl -i localhost:3011/api/campanias/999999` |
| 17/09 | archivo fuente | AC-6 | `.../campania.entity.ts` | `rg -n "sequelize|@nestjs|extends Model" <ruta>` |

**Commit (hash):** Completado — `feat(iss-04): feature campanias CA` · `Refs #4`
**Autoevaluación de AC:** Completado

---

## 5. Revisión humana del resultado

Preguntas guía: «¿dónde se valida que el cliente exista antes de crear la campaña, y en qué capa?».

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 17/09 | Carlos Z | revisor  |  todos |  Ver proceso.md ISS 3 procedimiento   |          |          |

**Respuesta del autor (ajuste o justificación):**

se valida en create-campania.use-case.ts, en application, antes de llamar al repositorio de campanias
llama a iclienterepository.findbyid(clienteid), si no existe tira clientenotfoundexception 404, si
existe recien ahi crea la campania

no se valida en el controller porque ahi solo se traduce http a use case, no tiene logica de negocio, y
no se deja que falle en infrastructure/bd porque eso daria un error crudo de constraint de fk 500, no un 404 limpio, la unica forma de dar un 404 claro es chequeando antes de intentar el insert

por eso el use-case de campanias inyecta dos repositorios, icampaniarepository y iclienterepository, uno
para lo suyo y otro solo para validar la fk antes de crear, ese patron se va a repetir en las siguientes
features que tengan fk

---

## 6. Gate — decide **Hecho**

**Estado:** aprobado 

**Conclusión:** se cumplieron todos los AC, se pasa al issue #5

**Trazabilidad final:** [enlace al Issue)](https://github.com/DW-2026-IISem/dw-2026-DEV-Gordon/issues/4)
