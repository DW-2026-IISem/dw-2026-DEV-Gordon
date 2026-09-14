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

### 4.1 Entidades de negocio 

Campaña = campania

| # | Entidad | Atributos | Nota |
|---|---|---|---|
| 1 | Cliente | id, tipo_documento, numero_documento (UQ), nombre, telefono, email, is_active | sin cambios |
| 2 | Campania | id, cliente_id (FK), nombre, descripcion, is_active, created_at, updated_at | agregue cliente id porque narrativa dice cliente 1:n campaña pero la tabla no tiene fk|
| 3 | Presupuesto | id, campania_id (FK), fecha, valor, estado, observaciones | referecia id ahora es campaña id para mas claridad|
| 4 | Hito | id, campania_id (FK), nombre, descripcion, estado, fecha_cierre, is_active, created_at, updated_at | le agrego campania id para la relacion, e campo estado que podra ser abierto, cerrado o facturado, y una fecha de cierre de dicho hito  |
| 5 | Tarea | id, hito_id (FK), nombre, descripcion, is_active, created_at, updated_at | agregue la relacion a hito id |
| 6 | AsignacionTarea | id, tarea_id (FK), user_id (FK), datos_relacion, is_active | principal id ahora es tarea id y relacionado id ahora es user id para mas claridad |
| 7 | Entregable | id, tarea_id (FK), fecha_inicio, fecha_fin, total, estado, observaciones | referencia id ahora es tarea id para mas claridad |
| 8 | VersionEntregable | id, entregable_id (FK), numero_version, fecha_inicio, fecha_fin, total, estado, observaciones | referecia id ahora es entregable id, y agregue el numero de version para asi distinguer entre versiones del mismo entregable |
| 9 | Aprobacion | id, version_entregable_id (FK), estado, aprobador_id (FK a User), comentario, fecha | agregue estado que puede ser pendiente, aprobado y rechazado para y una relacion aquien lo aprueba aprobador id |
| 10 | Factura | id, campania_id (FK), numero (UQ), fecha, subtotal, impuestos, total, estado | agregue la relacion a campaña id |
| 11 | FacturaHito | id, factura_id (FK), hito_id (FK), valor | esta es una tabla intermedia para hacer la relacion n:n entre factura e hito |


### 4.2 Entidades de Identidad Y RBAC

| # | Entidad | Papel |
|---|---|---|
| 12 | User | usuario del sistema |
| 13 | Role | rol del sistema (ADMIN, CUENTAS, CREATIVO, CLIENTE_APROBADOR, FINANZAS) |
| 14 | RoleUser | asociación usuario–rol (un usuario puede tener varios roles) |
| 15 | Resource | recurso HTTP protegido (path + método) |
| 16 | ResourceRole | asociación rol–recurso (qué rol puede acceder a qué recurso) |
| 17 | RefreshToken | token de refresco de sesión |

**Total: 17 entidades** 11 de negocio + 6 de identidad.

---

## 5. Relaciones

### Relaciones de negocio

| Entidad (1) | Cardinalidad | Entidad (N) | Lectura |
|---|---|---|---|
| Cliente | 1 : N | Campania | Un cliente tiene varias campañas |
| Campania | 1 : N | Presupuesto | Una campaña tiene varios presupuestos |
| Campania | 1 : N | Hito | Una campaña se divide en varios hitos |
| Campania | 1 : N | Factura | Una campaña genera varias facturas |
| Hito | 1 : N | Tarea | Un hito se divide en varias tareas |
| Tarea | 1 : N | AsignacionTarea | Una tarea se asigna a uno o varios usuarios |
| User | 1 : N | AsignacionTarea | Un usuario tiene varias tareas asignadas |
| Tarea | 1 : N | Entregable | Una tarea produce varios entregables |
| Entregable | 1 : N | VersionEntregable | Un entregable tiene varias versiones |
| VersionEntregable | 1 : N | Aprobacion | Una versión recibe varias aprobaciones |
| User | 1 : N | Aprobacion | Un usuario (aprobador) emite varias aprobaciones |
| Factura | 1 : N | FacturaHito | Una factura cubre varios hitos |
| Hito | 1 : N | FacturaHito | Un hito puede aparecer en la facturación |

### Relaciones de identidad (RBAC)

| Entidad (1) | Cardinalidad | Entidad (N) | Lectura |
|---|---|---|---|
| User | 1 : N | RoleUser | Un usuario tiene varios roles |
| Role | 1 : N | RoleUser | Un rol lo tienen varios usuarios |
| Role | 1 : N | ResourceRole | Un rol accede a varios recursos |
| Resource | 1 : N | ResourceRole | Un recurso lo usan varios roles |
| User | 1 : N | RefreshToken | Un usuario tiene varios tokens de sesión |

---

## 6. Capacidad integrada de la semana

**Nombre:** CerrarHito (cierre automático de hito por aprobación completa)

Es la rebanada vertical de la semana: una operación que atraviesa casi toda la
cadena del dominio (Campania → Hito → Tarea → Entregable → VersionEntregable →
Aprobacion), en lugar de un CRUD aislado de una sola entidad.

El cierre del hito no lo dispara ningún usuario. Lo dispara el sistema de forma
automática en el momento en que entra la última aprobación que faltaba.

**Flujo paso a paso:**

1. El CLIENTE_APROBADOR aprueba una versión de entregable (`POST /api/aprobaciones`).
2. El sistema registra la aprobación con estado APROBADA.
3. El sistema identifica a qué hito pertenece ese entregable (Entregable → Tarea → Hito).
4. El sistema revisa todos los entregables de ese hito y, para cada uno, el estado de su versión más reciente.
5. Si todavía queda algún entregable sin aprobar → no ocurre nada más; el hito sigue en estado ABIERTO.
6. Si esta era la última aprobación pendiente (todos los entregables del hito están APROBADOS) → el sistema cierra el hito: estado pasa a CERRADO y se registra fecha_cierre.
7. El hito cerrado queda disponible para que FINANZAS lo facture.
8. Todo ocurre dentro de una sola transacción: registrar la aprobación y cerrar el hito son una operación atómica. Si algo falla, no queda nada a medias.

**Caso de rechazo:**

Si el CLIENTE_APROBADOR rechaza una versión (estado RECHAZADA), el hito no se
cierra y permanece ABIERTO. El entregable rechazado deberá corregirse en una
nueva versión, que a su vez volverá a pasar por aprobación.

**Caso de hito ya cerrado:**

Un hito CERRADO no se reabre. No se admiten nuevas versiones ni aprobaciones
sobre los entregables de un hito cerrado. Cualquier cambio posterior solicitado
por el cliente se gestiona como trabajo nuevo, sin afectar lo ya cerrado y
facturado.

**Resultado observable:**

- Éxito: al aprobar la última versión pendiente, el hito queda en CERRADO con su fecha_cierre y disponible para facturar.
- Rechazo: al rechazar una versión, el hito sigue ABIERTO y el entregable queda a la espera de una nueva versión.

---

## 7. Reglas de negocio

| ID | Regla | Dónde vive |
|---|---|---|
| RN-01 | Ningún entregable rechazado puede cerrar un hito. | Domain |
| RN-02 | Un hito se cierra automáticamente cuando todos sus entregables tienen su versión más reciente APROBADA. | Domain |
| RN-03 | El total facturado de una campaña no puede exceder su presupuesto aprobado. | Domain |
| RN-04 | Una versión de entregable no se puede modificar después de ser aprobada. | Domain |
| RN-05 | Solo un usuario con rol CLIENTE_APROBADOR puede emitir aprobaciones. | Application |
| RN-06 | Un hito cerrado no admite nuevas versiones ni aprobaciones sobre sus entregables. | Domain |
| RN-07 | El número de factura debe ser único. | Infrastructure |
| RN-08 | Una campaña inactiva no admite hitos nuevos. | Domain |

---

## 8. Requisitos y criterios de aceptación

| REQ | Requisito | AC | Criterio de aceptación | EVI |
|---|---|---|---|---|
| REQ-S04-01 | Problema, actores y requisitos documentados. | AC-S04-01 | Existe docs/sdd.md con problema, actores y requisitos. | EVI-S04-01 |
| REQ-S04-02 | Modelo de dominio definido y diagramado. | AC-S04-02 | Diagrama con las 17 entidades y sus relaciones. | EVI-S04-02 |
| REQ-S04-03 | Arquitectura por capas definida. | AC-S04-03 | Diagrama presentation/application/domain/infrastructure con responsabilidades. | EVI-S04-03 |
| REQ-S04-04 | Contratos DTO/API iniciales definidos. | AC-S04-04 | Contratos con ejemplo de request y response. | EVI-S04-04 |
| REQ-S04-05 | Base del backend NestJS operativa. | AC-S04-05 | El backend arranca, `/health` responde y Swagger carga. | EVI-S04-05 |
| REQ-S04-06 | docs/sdd.md y docs/kanban.md actualizados. | AC-S04-06 | Ambos archivos reflejan OBJ/SPEC/REQ/AC/Issues. | EVI-S04-06 |

---

## 9. Contratos iniciales (DTO / API)

### Contrato principal — Registrar una aprobación (dispara el cierre automático)

Este es el contrato central de la rebanada: al aprobar la última versión
pendiente de un hito, el sistema cierra el hito en la misma operación.

```
POST /api/aprobaciones
Rol requerido: CLIENTE_APROBADOR

Request:
{
  "version_entregable_id": 34,
  "estado": "APROBADA",
  "comentario": "Aprobado, listo para publicar"
}

Response 201 Created (aprobación registrada, hito aún abierto):
{
  "id": 88,
  "version_entregable_id": 34,
  "estado": "APROBADA",
  "hito_cerrado": false
}

Response 201 Created (era la última aprobación, el hito se cerró):
{
  "id": 88,
  "version_entregable_id": 34,
  "estado": "APROBADA",
  "hito_cerrado": true,
  "hito_id": 12,
  "fecha_cierre": "2026-09-07T15:30:00Z"
}

Response 409 Conflict: la versión pertenece a un hito ya CERRADO
Response 404: la versión de entregable no existe
Response 403: el usuario no tiene rol CLIENTE_APROBADOR
```

### Contratos de los cuatro recursos de la narrativa 

```
POST /api/campanias     -> crea una campaña            (rol CUENTAS)
POST /api/entregables   -> sube un entregable          (rol CREATIVO)
POST /api/aprobaciones  -> aprueba/rechaza una versión (rol CLIENTE_APROBADOR)
POST /api/facturas      -> factura hitos cerrados      (rol FINANZAS)
```

---

## 11. Trazabilidad

Kanban: ver `docs/kanban.md`
Bitácora de decisiones y uso de IA: ver `docs/proceso.md`

--- 

## 12. Diagramas 

### Seccion por capas

Aquí tienes la imagen convertida a una tabla en Markdown:

| Capa | Descripción | Ejemplos / Componentes |
|---|---|---|
| Presentation | Controladores HTTP, DTOs, rutas | AprobacionController, CrearCampaniaDto |
| Application | Casos de uso, orquestación, puertos | RegistrarAprobacionUseCase, RN-05 |
| Domain | Entidades y reglas de negocio puras | Hito, Aprobacion, RN-01, RN-02, RN-06 |
| Infrastructure | Sequelize, repositorios, acceso a BD | HitoRepository, modelos, migraciones |

Nota: Presentación y Application dependen de Domain; Infrastructure implementa los puertos que Domain define. Domain no depende de nadie.

### Codigo SQL

```
-- ============================================================
-- Norte Creativo - Esquema de base de datos (SQLite, ysql, sqlserver, oracle y postgress )
-- Proyecto 36 - Desarrollo Web y Base de Datos II - 2026-II
-- Autor: Carlos Honorio Zarate Rivadeneira (DEV-Gordon)
-- 17 entidades: 11 de negocio + 6 de identidad/RBAC
-- ============================================================

PRAGMA foreign_keys = ON;

-- ==================== IDENTIDAD / RBAC ====================

CREATE TABLE users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre        TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    is_active     INTEGER NOT NULL DEFAULT 1,
    created_at    TEXT    NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at    TEXT    NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE roles (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre      TEXT    NOT NULL UNIQUE,  -- ADMIN, CUENTAS, CREATIVO, CLIENTE_APROBADOR, FINANZAS
    descripcion TEXT,
    is_active   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE role_user (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE (user_id, role_id)
);

CREATE TABLE resources (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    path   TEXT    NOT NULL,   -- ej: /api/campanias
    method TEXT    NOT NULL,   -- ej: POST
    UNIQUE (path, method)
);

CREATE TABLE resource_role (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id     INTEGER NOT NULL,
    resource_id INTEGER NOT NULL,
    FOREIGN KEY (role_id)     REFERENCES roles(id)     ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    UNIQUE (role_id, resource_id)
);

CREATE TABLE refresh_tokens (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    token      TEXT    NOT NULL UNIQUE,
    expires_at TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==================== NEGOCIO ====================

CREATE TABLE clientes (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_documento   TEXT    NOT NULL,
    numero_documento TEXT    NOT NULL UNIQUE,
    nombre           TEXT    NOT NULL,
    telefono         TEXT,
    email            TEXT,
    is_active        INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE campanias (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id  INTEGER NOT NULL,
    nombre      TEXT    NOT NULL,
    descripcion TEXT,
    is_active   INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT    NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at  TEXT    NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE presupuestos (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    campania_id   INTEGER NOT NULL,
    fecha         TEXT    NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    valor         REAL    NOT NULL,
    estado        TEXT    NOT NULL DEFAULT 'BORRADOR',  -- BORRADOR, APROBADO
    observaciones TEXT,
    FOREIGN KEY (campania_id) REFERENCES campanias(id)
);

CREATE TABLE hitos (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    campania_id  INTEGER NOT NULL,
    nombre       TEXT    NOT NULL,
    descripcion  TEXT,
    estado       TEXT    NOT NULL DEFAULT 'ABIERTO',  -- ABIERTO, CERRADO, FACTURADO
    fecha_cierre TEXT,
    is_active    INTEGER NOT NULL DEFAULT 1,
    created_at   TEXT    NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at   TEXT    NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (campania_id) REFERENCES campanias(id)
);

CREATE TABLE tareas (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    hito_id     INTEGER NOT NULL,
    nombre      TEXT    NOT NULL,
    descripcion TEXT,
    is_active   INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT    NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at  TEXT    NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (hito_id) REFERENCES hitos(id)
);

CREATE TABLE asignacion_tareas (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    tarea_id       INTEGER NOT NULL,
    user_id        INTEGER NOT NULL,
    datos_relacion TEXT,
    is_active      INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (tarea_id) REFERENCES tareas(id),
    FOREIGN KEY (user_id)  REFERENCES users(id)
);

CREATE TABLE entregables (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    tarea_id      INTEGER NOT NULL,
    fecha_inicio  TEXT,
    fecha_fin     TEXT,
    total         REAL,
    estado        TEXT    NOT NULL DEFAULT 'EN_PROCESO',
    observaciones TEXT,
    FOREIGN KEY (tarea_id) REFERENCES tareas(id)
);

CREATE TABLE version_entregables (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    entregable_id  INTEGER NOT NULL,
    numero_version INTEGER NOT NULL,
    fecha_inicio   TEXT,
    fecha_fin      TEXT,
    total          REAL,
    estado         TEXT    NOT NULL DEFAULT 'EN_REVISION',
    observaciones  TEXT,
    FOREIGN KEY (entregable_id) REFERENCES entregables(id),
    UNIQUE (entregable_id, numero_version)
);

CREATE TABLE aprobaciones (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    version_entregable_id INTEGER NOT NULL,
    estado                TEXT    NOT NULL DEFAULT 'PENDIENTE',  -- PENDIENTE, APROBADA, RECHAZADA
    aprobador_id          INTEGER NOT NULL,
    comentario            TEXT,
    fecha                 TEXT    NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (version_entregable_id) REFERENCES version_entregables(id),
    FOREIGN KEY (aprobador_id)          REFERENCES users(id)
);

CREATE TABLE facturas (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    campania_id INTEGER NOT NULL,
    numero      TEXT    NOT NULL UNIQUE,
    fecha       TEXT    NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    subtotal    REAL    NOT NULL DEFAULT 0,
    impuestos   REAL    NOT NULL DEFAULT 0,
    total       REAL    NOT NULL DEFAULT 0,
    estado      TEXT    NOT NULL DEFAULT 'EMITIDA',
    FOREIGN KEY (campania_id) REFERENCES campanias(id)
);

CREATE TABLE factura_hitos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    factura_id INTEGER NOT NULL,
    hito_id    INTEGER NOT NULL,
    valor      REAL    NOT NULL,
    FOREIGN KEY (factura_id) REFERENCES facturas(id),
    FOREIGN KEY (hito_id)    REFERENCES hitos(id),
    UNIQUE (factura_id, hito_id)
);

-- ==================== DATOS SEMILLA (roles) ====================

INSERT INTO roles (nombre, descripcion) VALUES
    ('ADMIN',             'Administra usuarios, roles y permisos'),
    ('CUENTAS',           'Crea campanias, presupuestos, hitos y tareas'),
    ('CREATIVO',          'Sube entregables y versiones de sus tareas'),
    ('CLIENTE_APROBADOR', 'Aprueba o rechaza versiones de entregables'),
    ('FINANZAS',          'Genera facturas de hitos cerrados');
```

### Diagrama BD

