> **Workspace:** `backend_IA` (Norte Creativo) · **Pista:** solo Business (7 issues) · **Guion:** `docs/proceso.md` · **SDD del proyecto:** `docs/sdd.md`

# ISS-05 — Feature hitos CA (con estado)

**Naturaleza:** práctico (desarrollo de software backend)
**Issue GitHub:** `#5`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-04 en **Hecho**
**Commit esperado:** `feat(iss-05): feature hitos CA` con `Refs #5`


---

## 1. SDD 

**OBJ:** Al finalizar, se podrán registrar y consultar hitos de una campaña, con el campo `estado` y la regla de que una campaña inactiva no admite hitos nuevos, para preparar la cadena que el cierre automático recorrerá.

**SPEC:**
- Feature `src/features/business/hitos/` con las cuatro capas.
- **Dominio:** entidad `Hito` pura (`id`, `campaniaId`, `nombre`, `descripcion?`, `estado` [ABIERTO|CERRADO|FACTURADO], `fechaCierre?`, `isActive`); método de dominio `cerrar()` que valida que esté ABIERTO (RN-06); interfaz `IHitoRepository` (incluye `actualizarEstado`); excepciones `HitoNotFoundException`, `HitoYaCerradoException`, `CampaniaInactivaParaHitoException`.
- **Aplicación:** `CreateHitoDto` (`campaniaId`, `nombre` requeridos), mapper, use-cases `CreateHito` (valida que la Campania exista y esté activa → RN-08), `ListHitos`, `GetHitoById`.
- **Infraestructura:** `HitoModel` (tabla `hitos`, FK a `campanias`, columnas `estado` y `fechaCierre`) en `ALL_MODELS`; `HitoRepository`; seeder que crea un hito ABIERTO demo.
- **Presentación:** `HitosController` con `GET /api/hitos`, `GET /api/hitos/:id`, `POST /api/hitos`.
- `HitosModule` (importa `CampaniasModule`) en `BusinessModule`.

**REQ:**
- Entidad de dominio pura. La transición de estado vive en el método `cerrar()` del dominio, no en el controller ni en el repositorio.
- Sin JWT/Auth. No adelantar ISS-06.

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [x] **AC-1** Dado el seeder corrido; cuando `GET /api/hitos`; entonces responde `200` con ≥ 1 hito en `data.items`, sin duplicar al reiniciar.
- [x] **AC-2** Dado una `campaniaId` existente y activa; cuando `POST /api/hitos`; entonces responde `201` con el hito creado en estado `ABIERTO`.
- [x] **AC-3** Dado una `campaniaId` inexistente; cuando `POST /api/hitos`; entonces responde `404`.
- [x] **AC-4** Dado un payload sin `nombre` o campo no permitido; cuando `POST /api/hitos`; entonces responde `400`.
- [x] **AC-5** Dado un `id` inexistente; cuando `GET /api/hitos/999999`; entonces responde `404`.
- [x] **AC-6** Dado `domain/entities/hito.entity.ts`; cuando se inspecciona; entonces es TypeScript puro y el método `cerrar()` lanza excepción si el hito no está ABIERTO.

**Checklist interno (IA, En curso):**
- [x] domain (entidad con `cerrar()`, interface, excepciones)
- [x] application (DTO, mapper, use-cases con RN-08)
- [x] infrastructure (model con estado/fechaCierre, repo con `actualizarEstado`, seeder) + `ALL_MODELS`
- [x] presentation (controller)
- [x] módulo (importa CampaniasModule) en `BusinessModule`

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
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-05, no del backend entero.

Implementa los AC de docs/trazabilidad/ISS-05.md siguiendo el patron de clientes/campanias.

Feature src/features/business/hitos: entidad Hito PURA (id, campaniaId, nombre, descripcion?, estado [ABIERTO|CERRADO|FACTURADO]
con default ABIERTO, fechaCierre?, isActive) con metodo de dominio cerrar() que lanza HitoYaCerradoException si el estado
no es ABIERTO (deja estado = CERRADO y fechaCierre = ahora). IHitoRepository (incluye actualizarEstado); HitoNotFoundException,
CampaniaInactivaParaHitoException (409).
HitoModel (tabla hitos) con @ForeignKey/@BelongsTo a CampaniaModel, columnas estado y fechaCierre, en ALL_MODELS.
La relacion vive SOLO en el model, el dominio solo tiene campaniaId: number.
CreateHitoDto: campaniaId y nombre requeridos.
Use-case CreateHito verifica que campaniaId exista usando ICampaniaRepository (-> 404 si no existe; -> 409 si la
campania esta inactiva, regla de negocio RN-08). ListHitos, GetHitoById.
Controller GET /api/hitos, GET /api/hitos/:id, POST /api/hitos (la respuesta incluye estado). Swagger.
Seeder idempotente que crea al menos un hito ABIERTO con una campania existente; debe ejecutarse DESPUES del seeder
de campanias. HitosModule importa CampaniasModule y se registra en BusinessModule.

Prohibido: Auth, Users, JWT Token, guards, RBAC; entidad que extienda Model; force: true. NO adelantes ISS-06.
NO toques docs/.

Al final entrega tres listas: archivos tocados; como verifico cada AC; que quedo fuera de alcance.
```

**Ajustes o correcciones que hiciste a lo generado:** 

---

## 4. EVI 

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
| 17/09 | log + conteo | AC-1 |  Ver proceso.md ISS 5 procedimiento | `npm run start:dev` ×2 |
| 17/09 | HTTP 201 estado ABIERTO | AC-2 | Ver proceso.md ISS 5 procedimiento| `curl -i -X POST localhost:3011/api/hitos -d '{"campaniaId":1,"nombre":"Redes"}' -H 'Content-Type: application/json'` |
| 17/09 | HTTP 404 (FK) | AC-3 | Ver proceso.md ISS 5 procedimiento | `curl` con `campaniaId:999999` |
| 17/09 | HTTP 400 | AC-4 | Ver proceso.md ISS 5 procedimiento | `curl` sin `nombre` |
| 17/09 | HTTP 404 | AC-5 | Ver proceso.md ISS 5 procedimiento | `curl -i localhost:3011/api/hitos/999999` |
| 17/09 | archivo fuente | AC-6 | `.../hito.entity.ts` | `rg -n "sequelize|@nestjs|extends Model" <ruta>` |

**Commit (hash):** completado — `feat(iss-05): feature hitos CA` · `Refs #5`
**Autoevaluación de AC:** completado

---

## 5. Revisión humana del resultado

Preguntas guía: «muéstrame el método `cerrar()` y explica por qué la transición de estado vive en el dominio y no en el controller».

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 17/09 | Carlos Z | revisor  |  todos |  Ver proceso.md ISS 3 procedimiento   |          |          |

**Respuesta del autor (ajuste o justificación):**

---

## 6. Gate — decide **Hecho**

**Estado:** aprobado 

**Conclusión:** se cumplieron todos los AC, se pasa al issue #6

**Trazabilidad final:** [enlace al Issue)](https://github.com/DW-2026-IISem/dw-2026-DEV-Gordon/issues/5)
