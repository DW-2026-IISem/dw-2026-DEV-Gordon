# SDD — Norte Creativo

Proyecto 36 · Agencia de campañas
Desarrollo Web y Base de Datos II · 2026-II · Semana 04
Autor: Carlos Honorio Zárate Rivadeneira (DEV-Gordon)

---

## 1. Objetivo de la semana

**OBJ-S04:** comprender el dominio y la arquitectura de Norte Creativo (problema, actores, requisitos, entidades y relaciones), definir la arquitectura por capas, establecer los contratos DTO/API y dejar la base del backend NestJS lista para construir una primera rebanada vertical funcional.

---

## 2. Problema

Norte Creativo es una agencia que ejecuta campañas publicitarias para varios clientes al mismo tiempo, cada campaña tiene un presupuesto asignado y se divide en hitos y cada hito tiene sus tareas concretas que producen entregables, como piezas graficas, videos y textos

Hoy sin una plataforma, la agencia tiene varios problemas, las piezas se corrigen muchas veces y se pierde el rastro de cual version es la vigente, los comentarios de aprobacion o rechazo del cliente quedan dispersos en correos y chats, no hay forma clara de saber cuanto presupuesto se ha consumido y se corre el riesgo de facturar trabajo que el cliente no aprobo.

Para resolver esto, la plataforma debe versionar cada pieza, registrar quien comenta y quien es el responsable, medir el consumo del presupuesto y convertir en factura unicamente los hitos aprobados, la regla CENTRAL es que ningun entregable rechazado puede cerrar un hito, haciendo que un hito con trabajo rechazado no se pueda facturar.
---

## 3. Actores

| Rol | Quién es | Qué hace en el sistema |
|---|---|---|
| ADMIN | Administrador de la plataforma, es interno de la agencia|Gestiona usuarios, roles y permisos, da de alta a clientes, no participa en la operacion de las campañas |
| CUENTAS |Ejecutivo de  cuenta, interno | Crea las campañas y asigna el presupuesto, divide en hitos y tareas, asigna tareas a los creativos, consulta el consumo presupuestal de las campañas, no aprueban entregables ni facturan |
| CREATIVO | Diseñador o redactor, interno| Sube entregables y nuevas versiones, pero solo de las tareas que tiene asignadas, no ve presupuestos ni facturas, no crea campañas |
| CLIENTE_APROBADOR | Contacto del cliente, Externo | Revisa las versiones de los entregables de sus propias campañas, y las aprueba o rechaza, no ve presupuestos, no ve otras campañas, no crea nada |
| FINANZAS | Area administrativa, interno | Genera facturas a partir de hitos cerrados, compara presupuest contra lo facturado, no toca campañas ni entregables |

Se define que cada hito se cierra solo cuando las tareas estan aprobadas, entonces cuentas arma, creativo produce, ciente aprueba tareas, cuando todas las tareas se aprueban el sistema cierra el hito y finanzas factura lo que se cerro.

---

## 4. Entidades del dominio

### 4.1 Entidades de negocio (10)

| Entidad | Atributos | Nota |
|---|---|---|
| Cliente | id, tipo_documento, numero_documento (UQ), nombre, telefono, email, is_active | |
| Campania | id, nombre, descripcion, is_active, created_at, updated_at | falta FK a Cliente |
| Presupuesto | id, referencia_id (FK), fecha, valor, estado, observaciones | referencia_id apunta a Campania |
| Hito | id, nombre, descripcion, is_active, created_at, updated_at | falta FK a Campania |
| Tarea | id, nombre, descripcion, is_active, created_at, updated_at | falta FK a Hito |
| AsignacionTarea | id, principal_id (FK), relacionado_id (FK), datos_relacion, is_active | principal_id = Tarea, relacionado_id = User |
| Entregable | id, referencia_id (FK), fecha_inicio, fecha_fin, total, estado, observaciones | referencia_id apunta a Tarea |
| VersionEntregable | id, referencia_id (FK), fecha_inicio, fecha_fin, total, estado, observaciones | referencia_id apunta a Entregable |
| Aprobacion | id, nombre, descripcion, is_active, created_at, updated_at | falta FK a VersionEntregable y falta el veredicto |
| Factura | id, numero (UQ), fecha, subtotal, impuestos, total, estado | falta FK a Campania |

<!--
DECIDE AQUÍ. La tabla de la narrativa viene con atributos genéricos de plantilla.
Escribe abajo los atributos que TÚ vas a implementar, con las FK explícitas y los
campos que faltan. Dos que sí o sí tienes que resolver:

- Aprobacion necesita un campo de veredicto (APROBADA / RECHAZADA) y quién aprobó.
  Sin eso la regla de negocio del proyecto no se puede implementar.
- Factura necesita saber qué hitos cubre. Eso es una tabla intermedia
  (FacturaHito o similar) que la narrativa no menciona pero sí exige.

Justifica cada cambio en una línea. Esto es exactamente lo que el docente
espera que un estudiante detecte.
-->

### 4.2 Entidades de identidad y RBAC (6)

| Entidad | Papel |
|---|---|
| User | usuario del sistema |
| Role | rol (ADMIN, CUENTAS, CREATIVO, CLIENTE_APROBADOR, FINANZAS) |
| RoleUser | asociación usuario–rol |
| Resource | recurso HTTP protegido (path + method) |
| ResourceRole | asociación rol–recurso |
| RefreshToken | token de refresco de sesión |

<!-- Estas seis no están en la tabla de la narrativa, pero la narrativa exige RBAC.
     Se replican de StoreLab tal cual. -->

---

## 5. Relaciones

```
Cliente 1 ──N Campania
Campania 1 ──N Presupuesto
Campania 1 ──N Hito
Campania 1 ──N Factura
Hito     1 ──N Tarea
Tarea    1 ──N AsignacionTarea ──1 User
Tarea    1 ──N Entregable
Entregable 1 ──N VersionEntregable
VersionEntregable 1 ──N Aprobacion
Factura  N ──N Hito   (solo hitos aprobados)
```

<!--
REVISA Y AJUSTA. Si cambiaste algo en la sección 4, refléjalo aquí.
Este bloque es el borrador de tu diagrama (EVI-S04-02).
-->

---

## 6. Capacidad integrada de la semana

**Nombre:** CerrarHito

<!--
ESCRIBE AQUÍ el flujo paso a paso. Guía de lo que debe pasar:

1. Llega la petición con el id del hito.
2. Se valida que el hito exista, esté activo y pertenezca a una campaña activa.
3. Se recorren todas las tareas del hito.
4. Por cada tarea, todos sus entregables.
5. Por cada entregable, su versión más reciente.
6. Por cada versión, su aprobación.
7. Si alguna aprobación está en RECHAZADA o no existe → se aborta todo.
8. Si todas están APROBADAS → el hito pasa a cerrado.
9. El hito cerrado queda disponible para facturación.
10. Todo lo anterior en una sola transacción: si algo falla, no queda nada a medias.

Escríbelo con tus palabras y numera los pasos. Este texto es lo que después
le pasas al prompt M2 del manual del docente.
-->

**Resultado observable:** <!-- ¿cómo se ve el éxito? ¿y el fallo? -->

---

## 7. Reglas de negocio

| ID | Regla | Dónde vive |
|---|---|---|
| RN-01 | Ningún entregable rechazado puede cerrar un hito. | Domain |
| RN-02 | | |
| RN-03 | | |
| RN-04 | | |

<!--
ESCRIBE AQUÍ. RN-01 ya te la da la narrativa. Saca al menos tres más
de las que tú detectes. Candidatas:
- El total facturado no puede exceder el presupuesto aprobado de la campaña.
- Una campaña inactiva no admite hitos nuevos.
- El número de factura es único.
- Una versión de entregable no se modifica después de aprobada.
- Solo CLIENTE_APROBADOR puede emitir aprobaciones.

"Dónde vive" es Domain, Application o Infrastructure. Casi todas van en Domain.
-->

---

## 8. Requisitos y criterios de aceptación

| REQ | Requisito | AC | Criterio de aceptación | EVI |
|---|---|---|---|---|
| REQ-S04-01 | Problema, actores y requisitos documentados. | AC-S04-01 | Existe docs/sdd.md con problema, actores y requisitos. | EVI-S04-01 |
| REQ-S04-02 | Modelo de dominio definido y diagramado. | AC-S04-02 | Diagrama con las 16 entidades y sus relaciones. | EVI-S04-02 |
| REQ-S04-03 | Arquitectura por capas definida. | AC-S04-03 | Diagrama presentation/application/domain/infrastructure con responsabilidades. | EVI-S04-03 |
| REQ-S04-04 | Contratos DTO/API iniciales definidos. | AC-S04-04 | Contratos con ejemplo de request y response. | EVI-S04-04 |
| REQ-S04-05 | Base del backend NestJS operativa. | AC-S04-05 | El backend arranca, `/health` responde y Swagger carga. | EVI-S04-05 |
| REQ-S04-06 | docs/sdd.md y docs/kanban.md actualizados. | AC-S04-06 | Ambos archivos reflejan OBJ/SPEC/REQ/AC/Issues. | EVI-S04-06 |

---

## 9. Contratos iniciales (DTO / API)

<!--
ESCRIBE AQUÍ después de tener la sección 6. Mínimo el contrato de CerrarHito:

POST /api/hitos/:id/cerrar

Request:  (¿lleva body? ¿solo el id en la ruta?)
Response 200: (¿qué devuelve? estado del hito, hitos facturables)
Response 409: (entregable rechazado — ¿qué mensaje?)
Response 404: (hito no existe)
Response 403: (rol sin permiso)

Agrega también los contratos de los cuatro recursos que exige la narrativa:
POST /campanias, POST /entregables, POST /aprobaciones, POST /facturas.
-->

---

## 10. Fuera de alcance de la semana 04

- Frontend (corresponde a la Unidad 03, semana 10).
- CRUD completo de todas las entidades.
- Autenticación productiva y RBAC completo.
- Despliegue y pruebas de carga.

---

## 11. Trazabilidad

`OBJ-S04 → SPEC-S04 → REQ-S04-01..06 → AC-S04-01..06 → Issues #01..#06 → EVI-S04-01..06 → GATE-S04`

Kanban: ver `docs/kanban.md`
Bitácora de decisiones y uso de IA: ver `docs/proceso.md`