# **Proceso.md**

## Identificacion del proyecto

**Proyecto**: NorteCreativo - Agencia de campañas  
**Estudiante**: Carlos H. Zarate  
**Asignatura**: Desarrollo Web  
**Fecha**: 02.09.26

# **Semana**: 04 - Fundamentos web, dominio y arquitectura 02.09.26

### Analisis de OBJ-S04

OBJ-S04: Al finalizar la semana, el estudiante comprende el dominio y la arquitectura de su proyecto asignado (problema, actores, requisitos, entidades y relaciones), define la arquitectura por capas, establece los contratos (DTO/API) y deja la base del backend NestJS (config, common, database, logging, health, Swagger) lista para construir durante la clase una primera rebanada vertical funcional y continuar su integración en las semanas siguientes.

### SPEC SEMANAL

SPEC-S04 (Norte Creativo): modelar el dominio de Norte Creativo (clientes, campañas, presupuestos, hitos, tareas, entregables, versiones, aprobaciones y facturación, con RBAC transversal), definir la arquitectura cliente-servidor y por capas (presentation/application/domain/infrastructure), establecer los contratos iniciales y crear la base del backend NestJS (config, common, database, logging, health y Swagger) sin frontend. Todo queda documentado en docs/sdd.md y docs/kanban.md.

### Resultados esperados y AC semanal

| ID | Resultado esperado (descompone OBJ-S04) |
|---|---|
| R-S04-01 | Problema, actores y requisitos del dominio identificados y documentados. |
| R-S04-02 | Modelo de dominio definido (entidades, relaciones, agregados) y diagramado. |
| R-S04-03 | Arquitectura por capas definida (presentation, application, domain, infrastructure). |
| R-S04-04 | Contratos (DTO/API) iniciales definidos y documentados. |
| R-S04-05 | Base del backend NestJS creada: config, common, database, logging, health, Swagger. |
| R-S04-06 | SDD (docs/sdd.md) y Kanban (docs/kanban.md) del proyecto actualizados. |

### Bitacora

#### Decisión #1 — definicion de problema y actores
- **Fecha:** 02/09/2026
- **Issue:** #01 (actores) · **AC:** AC-S04-01
- **Contexto:** Definimos los problemas que hay y los actores segun la lectura dada en el documento de proyectos narrativas, en este caso, el #36, Norte Creativo
- **Decisión:** Definimos que la agencia cuenta ya con varios problemas relacionados a la falta de trazabilidad en los cambios hechos en cada pieza o tarea de un hito, los comentarios o rechazos del cliente estan dispersos en cosas externas a la plataforma y no hay forma de conocer los presupuestos y cuanto consumo hay de dicho presupuesto.
- **IA utilizada:** Si, Claude, para constrastar si mi entendimiento del proyecto era acertado con lo que realmente se pide.

#### Decisión #2 — Disparo automático del cierre de hito
- **Fecha:** 02/09/2026
- **Issue:** #02 (modelar dominio) · **AC:** AC-S04-02
- **Contexto:** Al modelar la capacidad CerrarHito había que decidir quién dispara el cierre: un usuario (CUENTAS pulsa "cerrar") o el sistema automáticamente.
- **Decisión:** El cierre lo dispara el SISTEMA, automáticamente, cuando entra la última aprobación pendiente del hito. 
- Ejemplo: si un hito tiene
  5 tareas con sus entregables, en el momento en que el CLIENTE_APROBADOR
  aprueba la quinta y última versión, el sistema verifica que ya no quedan
  entregables sin aprobar y cierra el hito en la misma operación.
- **Por qué:** Refleja mejor el negocio real. El hito está cerrado cuando el trabajo está aprobado, no cuando alguien se acuerda de pulsar un botón. Evita el estado intermedio "todo aprobado pero nadie cerró".
- **IA utilizada:** Sí, Claude, para contrastar las dos opciones de diseño en esto, al final la decision es mia.
- **Regla asociada:** Un hito cerrado no se reabre. Una vez cerrado, no se admiten nuevos rechazos ni versiones sobre sus entregables. Si el cliente quiere un cambio posterior, se maneja como trabajo nuevo (otro hito o tarea), sin afectar lo ya cerrado y facturado.