> **Workspace:** `backend_express` (Norte Creativo) · **Pista:** Business Express + TypeScript (11 issues) · **Manual base:** `docs/manual.md` · **SDD del proyecto:** `docs/sdd.md`

# ISS-10 — Feature version-entregable — versionado automático e inmutabilidad

**Naturaleza:** práctico
**Issue GitHub:** `#__`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-09 en **Hecho**
**Commit esperado:** `[S07][#__] ISS-10 feature version-entregable` con `Refs #__`

---

## 1. SDD

**OBJ:** Al finalizar, cada entregable tendrá versiones numeradas automáticamente (v1, v2, v3…), con estado controlado solo por el sistema y protegidas contra cambios una vez aprobadas.

**SPEC (qué debe quedar):**
- Feature `src/features/business/version-entregable/` (API `/api/version-entregables`).
- **Modelo** `VersionEntregable` (tabla `version_entregables`): `entregable_id` (FK), `numero_version` (INTEGER), `fecha_inicio?`, `fecha_fin?`, `total?`, `estado` (ENUM `EN_REVISION|APROBADA|RECHAZADA`, default `EN_REVISION`), `observaciones?`, `status`. Índice **UNIQUE** (`entregable_id`, `numero_version`).
- **Associations**: `Entregable.hasMany(VersionEntregable)` / `VersionEntregable.belongsTo(Entregable, as "entregable")`.
- **numero_version automático** (misma decisión de NestJS): `create` cuenta las versiones del entregable y asigna `count + 1`; el cliente nunca lo envía.
- **El estado lo controla el sistema**: si el body de create/PUT/PATCH trae `estado` o `numero_version` → `400`. Solo `aprobaciones` (ISS-11) cambia el estado.
- **RN-04**: PUT, PATCH o DELETE sobre una versión `APROBADA` → `409`.
- **RN-06**: crear una versión de un entregable cuyo hito está `CERRADO` → `409`.
- Seeder: versión 1 de cada entregable existente; runner: … → entregables → **version-entregables**.

**REQ (restricciones):**
- Mismas decisiones del backend IA: número automático, estado solo por aprobación, inmutable si aprobada, hito cerrado no admite versiones.
- No adelantar Aprobacion.

**AC:**
- [ ] **AC-1** Dado un entregable; cuando `POST /api/version-entregables` dos veces; entonces la primera responde `numero_version: 1` y la segunda `numero_version: 2`, ambas `EN_REVISION`.
- [ ] **AC-2** Dado un body con `numero_version` o `estado`; cuando `POST`; entonces `400`.
- [ ] **AC-3** Dado un `entregable_id` inexistente; cuando `POST`; entonces `404`.
- [ ] **AC-4** Dado una versión `APROBADA` (fijada a mano en BD para esta prueba); cuando `PATCH` o `DELETE`; entonces `409` (RN-04).
- [ ] **AC-5** Dado un hito `CERRADO` (fijado a mano en BD para esta prueba); cuando se crea versión de un entregable suyo; entonces `409` (RN-06).
- [ ] **AC-6** Dado la tabla; cuando `SHOW CREATE TABLE version_entregables`; entonces existe la FK y el UNIQUE (`entregable_id`, `numero_version`).
- [ ] **AC-7** Dado la tabla vacía; cuando `npm run db:seed` ×2; entonces cada entregable tiene su versión 1, sin duplicar.

**Checklist interno (IA, En curso):**
- [ ] Modelo + UNIQUE compuesto
- [ ] associations
- [ ] numero_version automático
- [ ] 400 si mandan estado/numero_version
- [ ] RN-04 (aprobada inmutable)
- [ ] RN-06 (hito cerrado)
- [ ] Seeder + runner
- [ ] Swagger

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
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-10, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-10.md siguiendo docs/manual.md secciones 11 y 12 (CRUD completo + relacion
con archivo associations), con el MISMO estilo de los features cliente, campania e hito ya hechos en este proyecto.

Feature src/features/business/version-entregable: model, controller, routes, associations, seeder, swagger y carpeta http/.
Modelo VersionEntregable (tabla version_entregables, timestamps true): entregable_id INTEGER requerido FK a entregables.id, numero_version INTEGER requerido, fecha_inicio DATE opcional, fecha_fin DATE opcional, total DECIMAL(12,2) opcional, estado ENUM(EN_REVISION,APROBADA,RECHAZADA) default EN_REVISION, observaciones TEXT opcional, status ENUM(active,inactive) default active. Indice UNIQUE compuesto (entregable_id, numero_version).
version-entregable.associations.ts: Entregable.hasMany(VersionEntregable, foreignKey entregable_id, as "versiones") y VersionEntregable.belongsTo(Entregable, foreignKey entregable_id, as "entregable"), importado antes del sync.
Controller VersionEntregableController con los 7 metodos (getAll solo status active, getOne con include del padre, create, updatePut,
updatePatch, deletePhysical, deleteLogical). Reglas (mismas decisiones del backend NestJS IA):
- numero_version AUTOMATICO: en create cuenta las versiones de ese entregable y asigna count + 1. El cliente NUNCA lo envia.
- Si el body de create, updatePut o updatePatch trae estado o numero_version -> 400 ("estado y numero_version los controla el sistema").
  El estado solo lo cambiara el feature aprobaciones (ISS-11).
- En create: entregable inexistente -> 404. Si el hito del entregable (entregable -> tarea -> hito) esta CERRADO -> 409 (RN-06).
- RN-04: updatePut, updatePatch, deletePhysical y deleteLogical sobre una version con estado APROBADA -> 409.
Errores: validacion -> 400, no encontrado -> 404, regla de negocio -> 409.
Rutas SIN AUTH en /api/version-entregables (incluido PATCH /api/version-entregables/:id/deactivate) registradas en src/routes/index.ts.
http/ con los .http de get, create, update y delete, leyenda SIN AUTH, puerto 3012.
Seeder seedVersionEntregables idempotente: crea la version 1 (EN_REVISION) de cada entregable que no tenga versiones; agregalo al SeedersRunner DESPUES de entregables.
Usa el path /api/version-entregables para las rutas.
Swagger del feature registrado en src/swagger/index.ts.

NO adelantes ISS-11 (aprobaciones). Prohibido: autenticacion, JWT, bcrypt, passwords, guards, RBAC, NestJS, force, alter. NO toques docs/. NO commitees .env.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | numero automático | AC-1 | (pegar salida o ruta a captura) | `curl -i -X POST localhost:3012/api/version-entregables -H 'Content-Type: application/json' -d '{"entregable_id":1}'` ×2 |
|       | HTTP 400 | AC-2 | (pegar salida o ruta a captura) | POST con `{"entregable_id":1,"numero_version":7}` |
|       | HTTP 404 | AC-3 | (pegar salida o ruta a captura) | POST con `entregable_id: 999999` |
|       | HTTP 409 RN-04 | AC-4 | (pegar salida o ruta a captura) | `docker exec -it nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "UPDATE version_entregables SET estado='APROBADA' WHERE id=1"` y luego `curl -i -X PATCH localhost:3012/api/version-entregables/1 -H 'Content-Type: application/json' -d '{"observaciones":"x"}'` |
|       | HTTP 409 RN-06 | AC-5 | (pegar salida o ruta a captura) | `docker exec -it nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "UPDATE hitos SET estado='CERRADO' WHERE id=1"`, POST de versión, y restaurar con `SET estado='ABIERTO'` |
|       | FK + UNIQUE | AC-6 | (pegar salida o ruta a captura) | `docker exec -it nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SHOW CREATE TABLE version_entregables\G"` |
|       | seed idempotente | AC-7 | (pegar salida o ruta a captura) | `npm run db:seed` ×2 + COUNT |

**Commit (hash):** pendiente — `[S07][#__] ISS-10 feature version-entregable` · `Refs #__`
**Autoevaluación de AC:** pendiente

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Dónde se calcula `numero_version` y por qué no lo manda el cliente?». «¿Por qué una versión aprobada ya no se puede modificar?». «¿Qué pasaría si el estado se pudiera cambiar por PATCH?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       |         |           |              |                      |          |          |

**Respuesta del autor (ajuste o justificación):**

---

## 6. Gate

**Estado:** pendiente
**Conclusión:**
**Trazabilidad final:**
