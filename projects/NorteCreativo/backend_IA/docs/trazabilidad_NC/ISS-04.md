> **Workspace:** `backend_IA` (Norte Creativo) · **Pista:** solo Business (7 issues) · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **SDD del proyecto:** `docs/sdd.md`

# ISS-04 — Feature campanias CA

**Naturaleza:** práctico (desarrollo de software backend)
**Issue GitHub:** `#__`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:**
**Dependencias:** ISS-03 en **Hecho**
**Commit esperado:** `feat(iss-04): feature campanias CA` con `Refs #__`

> El estado del issue **vive en el tablero Kanban**, no en este archivo.
> Repite el patrón de ISS-03, ahora con **FK a Cliente**.

---

## 1. SDD — se escribe en **Preparado**

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

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [ ] **AC-1** Dado el seeder corrido; cuando `GET /api/campanias`; entonces responde `200` con ≥ 1 campaña en `data.items`, sin duplicar al reiniciar.
- [ ] **AC-2** Dado un `clienteId` existente y payload válido; cuando `POST /api/campanias`; entonces responde `201` con la campaña creada en `data`.
- [ ] **AC-3** Dado un `clienteId` **inexistente**; cuando `POST /api/campanias`; entonces responde `404` y no crea fila.
- [ ] **AC-4** Dado un payload sin `nombre` o con campo no permitido; cuando `POST /api/campanias`; entonces responde `400`.
- [ ] **AC-5** Dado un `id` inexistente; cuando `GET /api/campanias/999999`; entonces responde `404`.
- [ ] **AC-6** Dado `domain/entities/campania.entity.ts`; cuando se inspecciona; entonces es TypeScript puro.

**Checklist interno (IA, En curso):**
- [ ] domain (entidad, interface, excepciones)
- [ ] application (DTO, mapper, use-cases con validación de FK)
- [ ] infrastructure (model con FK, repo, seeder) + `ALL_MODELS`
- [ ] presentation (controller)
- [ ] módulo (importa ClientesModule) en `BusinessModule`

---

## 2. Revisión de AC — autoriza **En curso**

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       |         |           | OBJ, SPEC, REQ, AC | este archivo   |          | pendiente |

---

## 3. IA usada — se diligencia en **En curso**

**Herramienta / modelo:** Claude Code
**Fecha:** (pendiente)
**Prompt enviado:**

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

**Ajustes o correcciones que hiciste a lo generado:** (pendiente)

---

## 4. EVI — se diligencia en **Verificación**

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | log + conteo | AC-1 | (log seeder + count ×2) | `npm run start:dev` ×2 |
|       | HTTP 201 | AC-2 | (respuesta) | `curl -i -X POST localhost:3011/api/campanias -d '{"clienteId":1,"nombre":"Test"}' -H 'Content-Type: application/json'` |
|       | HTTP 404 (FK) | AC-3 | (respuesta) | `curl` con `clienteId:999999` |
|       | HTTP 400 | AC-4 | (respuesta) | `curl` sin `nombre` |
|       | HTTP 404 | AC-5 | (respuesta) | `curl -i localhost:3011/api/campanias/999999` |
|       | archivo fuente | AC-6 | `.../campania.entity.ts` | `rg -n "sequelize|@nestjs|extends Model" <ruta>` |

**Commit (hash):** pendiente — `feat(iss-04): feature campanias CA` · `Refs #__`
**Autoevaluación de AC:** pendiente

---

## 5. Revisión humana del resultado

Preguntas guía: «¿dónde se valida que el cliente exista antes de crear la campaña, y en qué capa?».

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       |         |           |              |                      |          |          |

**Respuesta del autor (ajuste o justificación):**

---

## 6. Gate — decide **Hecho**

**Estado:** pendiente
**Conclusión:**
**Trazabilidad final:**
