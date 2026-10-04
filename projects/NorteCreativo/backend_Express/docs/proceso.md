## PROCESO.MD 
### BITACORA GENERAL DE LA CONSTRUCCION DEL BACKEND NESTJS DE NORTE CREATIVO - SOLO BUSINESS
### ESTUDIANTE: CARLOS H. ZARATE
### HERRAMIENTAS: Claude Code
---


## FASE 0 - REQUISITOS PREVIOS Y PREPARACION

Empezamos verificando las versiones de nodejs y npm que tenemos instaladas en el wsl / linux, el manual pide node v20 o superior, en este proyecto ya no se usa nest cli porque el backend ahora es express con typescript, typescript, ts-node y nodemon se instalan como dependencias locales del proyecto en el ISS-01.

Tambien verificamos que el motor de base de datos este accesible, el ISS-00 del manual lo exige, usamos el contenedor de mysql de databases_engines, y dejamos creada la base norte_creativo_express, separada de las bases de los backends de nestjs para no mezclar tablas.

Tambien organizamos los ISS de esta ocasion, son 7 igual que en nestjs pero repartidos distinto, porque la semana 7 solo pide 3 entidades (cliente, campania y hito) y el manual de express trae cosas que nestjs no tenia: crud completo (put, patch, borrado fisico y logico), seeders con faker y swagger. Quedan asi: ISS-01 esqueleto, ISS-02 base de datos, ISS-03 cliente crud, ISS-04 seeders, ISS-05 swagger, ISS-06 campania, ISS-07 hito. Tarea, entregable, version y aprobacion no entran en esta semana.

Tambien configuramos claude code via CLI, no usamos ninguna skill y mantendremos el uso del modelo Sonnet 5.5 con esfuerzo alto, en dado caso sea requerido usaremos el modelo Opus 5.

Para la fase de auth con rbac se usa la ruta express 2026 del docente, la fase II del manual, que corre sobre el mismo backend_Express, con el mismo puerto 3012 y la misma base norte_creativo_express. 

Los ISS nuevos van del 12 al 21: el ISS-12 y el ISS-13 son el refactor de la fase I a capas (controller, service, repository, model, con dto y shared), que se hace segun lo que confirme el docente, y del ISS-14 al ISS-21 se construye la seguridad. Se agregan 6 tablas, users, roles, resources, role_users, resource_roles y refresh_tokens, que ya estaban modeladas en el sdd, y no existe una entidad permission porque el permiso es la fila que une un rol con un recurso. Las rutas tienen tres modalidades, abiertas (login, refresh, logout y swagger), solo jwt (perfil, permisos y sesiones propias) y jwt mas rbac (todo el negocio y la administracion), y el acceso es deny by default, sin concesion se responde 403 y la matriz se consulta en cada peticion. El access token es corto, firmado con hs256 con iss, aud, exp y jti, y el refresh token es opaco, se guarda hasheado, rota en cada uso y se puede revocar. Se instalan jsonwebtoken y bcryptjs, el secreto jwt va solo en el .env y el .env.example queda sin valores. Los 5 roles son admin, cuentas, creativo, cliente_aprobador y finanzas, con un usuario sembrado por cada uno para poder probar los 403 rol por rol, y la matriz de concesiones sale de los actores del sdd. Con esto la rn-05 se cumple de verdad, solo cliente_aprobador aprueba y el aprobador_id sale del token, no del body. Quedan fuera el ownership, que el aprobador vea solo sus campañas, y asignaciontarea, porque el rbac del docente es por endpoint, y se documenta como limitacion. Seguimos con claude code via cli, sin skills, con sonnet 5 en esfuerzo alto, y los commits los hago yo despues de verificar cada ac.


Comandos:
```bash
node -v && npm -v
docker ps --filter name=nc-mysql
docker exec -it nc-mysql mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS norte_creativo_express CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; SHOW DATABASES;"
```

Salida: 
![alt text](images/proceso-1790709038026.png)
![alt text](images/proceso-1790709109176.png)
![alt text](images/proceso-1790709213704.png)


## FASE 1 - Bussines




## ISS - 01 

### OBJ

**OBJ:** Al finalizar, existirá un proyecto Express 5 + TypeScript arrancable en `backend_express/`, organizado por features, sobre el cual se construyen Cliente, Campania e Hito.

### AC

**AC:**
- [x] **AC-1** Dado el workspace con `docs/`; cuando la IA termina; entonces existen `package.json` (`type: commonjs`, scripts `build` y `dev`) y `docs/` sigue intacto.
- [x] **AC-2** Dado el proyecto; cuando se ejecuta `npx tsc --noEmit`; entonces no hay errores.
- [x] **AC-3** Dado el proyecto; cuando **el desarrollador** ejecuta `npm run dev`; entonces el log muestra `Servidor ejecutándose en puerto 3012`.
- [x] **AC-4** Dado la app arriba; cuando `GET http://localhost:3012/api/health`; entonces responde `200` con `{ "status": "ok" }`.
- [x] **AC-5** Dado `src/`; cuando se lista; entonces existen `config/`, `database/seeders/`, `routes/`, `features/business/cliente/` y no existe carpeta de auth.

### Procedimiento

1. pegamos el prompt 

``` text
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


Salida:

![alt text](images/proceso-1790709504914.png)

Verificamos docs este intacta

![alt text](images/proceso-1790709591154.png)

Verificamos que compile sin errores

![alt text](images/proceso-1790709731919.png)

Verificamos que arranca en peurto 3012

![alt text](images/proceso-1790709751598.png)

verificamos el healt

![alt text](images/proceso-1790709830247.png)

arranca y seguimos al iss 02

## ISS - 02

### OBJ

**OBJ:** Al finalizar, la app se conectará a la base `norte_creativo_express` del motor indicado por `DB_ENGINE`, fallando con un mensaje claro si el motor no está soportado.

### AC

**AC:**
- [x] **AC-1** Dado `.env.example`; cuando se revisa; entonces tiene `PORT=3012`, `DB_ENGINE` y los cuatro bloques sin contraseñas, y `.env` no aparece en `git status`.
- [x] **AC-2** Dado el proyecto; cuando `npx tsc --noEmit`; entonces no hay errores.
- [x] **AC-3** Dado MySQL arriba y la base creada; cuando `npm run dev`; entonces el log muestra `Conexión exitosa a MYSQL` y el servidor queda en 3012.
- [x] **AC-4** Dado `DB_ENGINE=foo` en una copia del `.env`; cuando se arranca; entonces falla con `Motor de base de datos no soportado: foo`; al restaurar vuelve a conectar.
- [x] **AC-5** Dado `src/database/seeders/`; cuando se lista; entonces existe y no contiene `*.seeder.ts` ni runner.

### Procedimiento

1. pegamos el prompt 

``` text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-02, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-02.md siguiendo docs/manual.md seccion 3 (ISS-02), adaptado a Norte Creativo.

Instala los drivers del manual seccion 3.1 (sequelize, mysql2, pg, pg-hstore, tedious, oracledb).
Crea .env.example (versionado, SIN contraseñas) y actualiza .env local con:
PORT=3012, DB_ENGINE=mysql,
MYSQL_HOST=localhost MYSQL_USER=root MYSQL_PASSWORD= MYSQL_NAME=norte_creativo_express MYSQL_PORT=3306,
POSTGRES_HOST=localhost POSTGRES_USER=nc_admin POSTGRES_PASSWORD= POSTGRES_NAME=norte_creativo_express POSTGRES_PORT=5433,
MSSQL_HOST=localhost MSSQL_USER=sa MSSQL_PASSWORD= MSSQL_NAME=norte_creativo_express MSSQL_PORT=1433,
ORACLE_HOST=localhost ORACLE_USER=system ORACLE_PASSWORD= ORACLE_NAME=XEPDB1 ORACLE_PORT=1521.
En .env (no en .env.example) deja las contraseñas vacias para que yo las llene; no inventes contraseñas.
Crea src/database/db.ts como el manual seccion 3.2 (exporta sequelize, getDatabaseInfo, testConnection) pero con los
CUATRO motores en dbConfigurations (mysql, postgres, mssql, oracle). Si DB_ENGINE no esta soportado, lanza
"Motor de base de datos no soportado: <valor>".
En src/config/index.ts, dbConnection() debe llamar testConnection(). Todavia NO hay modelos ni sync.
Deja src/database/seeders/ con un .gitkeep.

Prohibido: modelos de negocio, sync, force, alter. NO adelantes ISS-03. Prohibido: autenticacion, JWT, bcrypt, passwords, guards, RBAC, NestJS. NO toques docs/. NO commitees .env.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

Salida:

![alt text](images/proceso-1790711330711.png)

verificamos env.example y .env fuera de git
![alt text](images/proceso-1790711358198.png)

vemos si compila
![alt text](images/proceso-1790711380125.png)

probamos la conexion

![alt text](images/proceso-1790711401783.png)

![alt text](images/proceso-1790711480224.png)

Detenemos el servidor y probamos si falla poniendole db=foo

![alt text](images/proceso-1790711531383.png)

vemos si el ac5 se cumple

![alt text](images/proceso-1790711577059.png)

## ISS - 03

### OBJ

**OBJ:** Al finalizar, se podrán crear, consultar, actualizar (PUT/PATCH) y eliminar (física y lógicamente) clientes persistidos en `norte_creativo_express`, con las reglas de negocio del SDD.

### AC

**AC:**
- [x] **AC-1** Dado la app arrancada; cuando termina `sync`; entonces existe la tabla `clientes` en `norte_creativo_express`.
- [x] **AC-2** Dado un payload válido; cuando `POST /api/clientes`; entonces `201` con el cliente creado y `status: active`.
- [x] **AC-3** Dado un `numero_documento` ya registrado; cuando `POST /api/clientes`; entonces `409` y no se crea fila.
- [x] **AC-4** Dado un payload sin `nombre` o con email inválido; cuando `POST /api/clientes`; entonces `400`.
- [x] **AC-5** Dado un cliente existente; cuando `PUT` y luego `PATCH` sobre `/api/clientes/:id`; entonces `200` con los cambios persistidos.
- [x] **AC-6** Dado un cliente; cuando `PATCH /api/clientes/:id/deactivate`; entonces queda `inactive` y ya no aparece en `GET /api/clientes`; con `DELETE /api/clientes/:id` desaparece de la tabla.
- [x] **AC-7** Dado un `id` inexistente; cuando `GET /api/clientes/999999`; entonces `404`.

### Procedimiento

1. pegamos el prompt 

``` text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-03, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-03.md siguiendo docs/manual.md secciones 4 a 8 (ISS-03-A a ISS-03-E, feature Client),
adaptado a la entidad Cliente de Norte Creativo.

Feature src/features/business/cliente: cliente.model.ts, cliente.controller.ts, cliente.routes.ts y carpeta http/.
Modelo Cliente (tabla clientes, timestamps true): tipo_documento ENUM(CC,NIT,CE,TI,PASAPORTE) requerido,
numero_documento STRING unico requerido, nombre STRING requerido (notEmpty), telefono STRING opcional,
email STRING opcional con isEmail, status ENUM(active,inactive) default active.
IMPORTANTE: el Cliente de Norte Creativo NO tiene password ni bcrypt (no es usuario del sistema).
Controller ClienteController con getAll (solo status active), getOne, create, updatePut, updatePatch,
deletePhysical y deleteLogical (status = inactive), mismo estilo del manual (respuestas { cliente } / { clientes }).
Errores: validacion de Sequelize -> 400, no encontrado -> 404, numero_documento duplicado (UniqueConstraintError) -> 409.
Rutas SIN AUTH: GET/POST /api/clientes, GET/PUT/PATCH/DELETE /api/clientes/:id, PATCH /api/clientes/:id/deactivate.
src/routes/index.ts como agregador; en src/config/index.ts cablea routes() y en dbConnection() haz testConnection + sequelize.sync() sin force ni alter.
Crea http/clientes.get.http, clientes.create.http, clientes.update.http, clientes.delete.http con leyenda SIN AUTH, apuntando a localhost:3012.

Prohibido: seeder, Swagger, Campania, Hito, force, alter. NO adelantes ISS-04. Prohibido: autenticacion, JWT, bcrypt, passwords, guards, RBAC, NestJS. NO toques docs/. NO commitees .env.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

Salida:

![alt text](images/proceso-1790712741632.png)

![alt text](images/proceso-1790712855403.png)
probamos el aac 1 de crear una tabla

![alt text](images/proceso-1790712786272.png)

creamos un cliente valido 
![alt text](images/proceso-1790713199542.png)


probamos el ac3 para ver si nos crea un documento duplicado buscnado 409 de error

![alt text](images/proceso-1790712938639.png)

probamos un payload invalido buscando error 400

![alt text](images/proceso-1790713035985.png)

probamos el put buscando un codigo 200 con el id del ac2 que es el 8

![alt text](images/proceso-1790713248963.png)

 probamos el metodo patch

 ![alt text](images/proceso-1790713316972.png)

Ahora el ac6, borrado logico con el mismo id 8

![alt text](images/proceso-1790713344890.png)

![alt text](images/proceso-1790713413909.png)

probamos con cliente inexsistente que debe dar error 404 

![alt text](images/proceso-1790713462773.png)

![alt text](images/proceso-1790713501210.png)

## ISS - 04

### OBJ

**OBJ:** Al finalizar, se podrá poblar la tabla `clientes` con datos falsos coherentes mediante `npm run db:seed`, variando la cantidad, sin duplicar al repetir.

### AC

**AC:**
- [x] **AC-1** Dado la tabla vacía; cuando `npm run db:seed`; entonces se insertan los clientes del conteo por defecto.
- [x] **AC-2** Dado la tabla con datos; cuando se vuelve a correr `npm run db:seed`; entonces no se duplican filas.
- [x] **AC-3** Dado la tabla vacía; cuando `npm run db:seed -- --clientes=20` o `SEED_CLIENTES=5 npm run db:seed`; entonces se insertan 20 o 5.
- [x] **AC-4** Dado los clientes sembrados; cuando `GET /api/clientes`; entonces aparecen con documentos únicos y emails válidos.

### Procedimiento

1. pegamos el prompt 

``` text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-04, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-04.md siguiendo docs/manual.md seccion 9 (ISS-04, seeders con Faker), adaptado a Cliente.

Instala @faker-js/faker como dev.
Crea src/features/business/cliente/cliente.seeder.ts con export async function seedClientes(count: number): Promise<number>,
idempotente (si Cliente.count() > 0, omite). Datos coherentes: tipo_documento NIT o CC, numero_documento unico,
nombre de empresa, telefono y email validos, status active.
Crea src/database/seeders/counts.ts (clientes: default, variable SEED_CLIENTES, argumento --clientes=N)
y src/database/seeders/index.ts (SeedersRunner) que conecta, hace sync sin force/alter, ejecuta los seeders en orden y cierra la conexion.
Agrega el script "db:seed" en package.json como en el manual.
El seeder NO debe ejecutarse al arrancar la app.

Prohibido: Swagger, Campania, Hito, force, alter. NO adelantes ISS-05. Prohibido: autenticacion, JWT, bcrypt, passwords, guards, RBAC, NestJS. NO toques docs/. NO commitees .env.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

Salida:
![alt text](images/proceso-1790714495112.png)

![alt text](images/proceso-1790714589047.png)

probamos el ac1, conteo con el primer seed

![alt text](images/proceso-1790714623835.png)
![alt text](images/proceso-1790714636119.png)

ac2 de indepotencia, corriendo el seed otra vez, nos da el mismo numero asi que no se duplica

![alt text](images/proceso-1790714683574.png)

miramos mla cantidad de variables para insertar 20

![alt text](images/proceso-1790714820562.png)
![alt text](images/proceso-1790714831034.png)
![alt text](images/proceso-1790714841919.png)

vemos que los datos sean coherentes

![alt text](images/proceso-1790715258455.png)

## ISS - 05

### OBJ

**OBJ:** Al finalizar, la API de clientes quedará documentada en OpenAPI 3 y visible en Swagger UI, con un registry que permita sumar features siguientes.

### AC

**AC:**
- [x] **AC-1** Dado la app arrancada; cuando se abre `http://localhost:3012/api/docs`; entonces carga Swagger UI con el tag Clientes.
- [x] **AC-2** Dado la app; cuando `GET /api/docs.json`; entonces devuelve el documento OpenAPI 3 con los paths de `/api/clientes`.
- [x] **AC-3** Dado Swagger UI; cuando se ejecuta *Try it out* en `GET /api/clientes`; entonces responde `200`.
- [x] **AC-4** Dado `src/swagger/index.ts`; cuando se revisa; entonces importa `clienteSwagger` desde el feature (no define los paths él mismo).

### Procedimiento

1. pegamos el prompt 

``` text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-05, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-05.md siguiendo docs/manual.md seccion 10 (ISS-05, Swagger), adaptado a Cliente.

Instala swagger-ui-express y @types/swagger-ui-express (dev).
Crea src/features/business/cliente/cliente.swagger.ts exportando clienteSwagger (tags, paths, components.schemas)
con los 7 endpoints de /api/clientes (incluido PATCH /api/clientes/{id}/deactivate), marcados SIN AUTH,
con los campos reales del modelo (tipo_documento, numero_documento, nombre, telefono, email, status).
Crea src/swagger/index.ts (registry) que fusiona los modulos de features y exporta setupSwagger(app),
montando /api/docs (UI) y /api/docs.json (spec), servidor http://localhost:3012.
En src/config/index.ts agrega el metodo docs() que llama setupSwagger.

Prohibido: Campania, Hito. NO adelantes ISS-06. Prohibido: autenticacion, JWT, bcrypt, passwords, guards, RBAC, NestJS. NO toques docs/. NO commitees .env.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

Salida:

![alt text](images/proceso-1790716894509.png)
![alt text](images/proceso-1790716928118.png)

probamos que la ui de swagger cargue

![alt text](images/proceso-1790717056312.png)

miramos el doc con openapi y nos da la version v 3.0.3 tambien nos muestra la rutas

![alt text](images/proceso-1790717099222.png)

probamos swagger ui con try it out y tenemos codigo 200

![alt text](images/proceso-1790718964077.png)


probamos que el registry importa desde el feature

![alt text](images/proceso-1790719252535.png)

## ISS - 06

### OBJ

**OBJ:** Al finalizar, se podrán gestionar campañas asociadas a un cliente existente y activo, con seeder y documentación, dejando el contenedor del que cuelgan los hitos.

### AC

**AC:**
- [x] **AC-1** Dado la app arrancada; cuando `sync`; entonces existe `campanias` con FK real a `clientes` (`SHOW CREATE TABLE`).
- [x] **AC-2** Dado un `cliente_id` existente y activo; cuando `POST /api/campanias`; entonces `201`.
- [x] **AC-3** Dado un `cliente_id` inexistente; cuando `POST /api/campanias`; entonces `404` y no se crea fila.
- [x] **AC-4** Dado un cliente `inactive`; cuando `POST /api/campanias` con su id; entonces `409`.
- [x] **AC-5** Dado una campaña; cuando `GET /api/campanias/:id`; entonces la respuesta incluye su cliente.
- [x] **AC-6** Dado la tabla vacía; cuando `npm run db:seed`; entonces se crean campañas sobre clientes existentes y repetir no duplica.
- [x] **AC-7** Dado Swagger; cuando se abre `/api/docs`; entonces aparece el tag Campañas.

### Procedimiento

1. pegamos el prompt 

``` text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-06, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-06.md siguiendo docs/manual.md secciones 11 y 12 (patron de ProductType y de la relacion
Product-ProductType con archivo associations), adaptado a la entidad Campania de Norte Creativo. Mismo estilo del feature cliente ya hecho.

Feature src/features/business/campania: model, controller, routes, associations, seeder, swagger y carpeta http/.
Modelo Campania (tabla campanias, timestamps true): cliente_id INTEGER requerido FK a clientes.id, nombre STRING requerido,
descripcion TEXT opcional, status ENUM(active,inactive) default active.
campania.associations.ts: Cliente.hasMany(Campania, foreignKey cliente_id) y Campania.belongsTo(Cliente, foreignKey cliente_id, as "cliente"),
importado en src/config/index.ts antes del sync.
Controller CampaniaController con los mismos 7 metodos del cliente. En create y updatePut: si el cliente no existe -> 404;
si el cliente esta inactive -> 409 ("no se crea campaña para un cliente inactivo"). getOne incluye el cliente asociado.
Rutas SIN AUTH en /api/campanias (incluido PATCH /api/campanias/:id/deactivate) registradas en src/routes/index.ts.
http/ con los archivos .http de get, create, update y delete, leyenda SIN AUTH, puerto 3012.
Seeder seedCampanias(count) idempotente que asigna campanias a clientes activos existentes; agregalo al SeedersRunner
DESPUES de clientes, con SEED_CAMPANIAS y --campanias=N en counts.ts.
campaniaSwagger registrado en src/swagger/index.ts.

Prohibido: Hito, force, alter. NO adelantes ISS-07. Prohibido: autenticacion, JWT, bcrypt, passwords, guards, RBAC, NestJS. NO toques docs/. NO commitees .env.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

Salida:

![alt text](images/proceso-1790728479326.png)
![alt text](images/proceso-1790728503621.png)
![alt text](images/proceso-1790728515653.png)

probamos que corre

![alt text](images/proceso-1790728932272.png)

verificamos el ac1 con el fk real en la base de datos

![alt text](images/proceso-1790729140063.png)

Creamos una cmapña valida para el ac2 con el id de cliente 3 y da el id 2 de campaña
![alt text](images/proceso-1790729219197.png)


cremos una para el ac3 con el cliente que no existe y que de 404
![alt text](images/proceso-1790729328140.png)

creamos ahora un cliente inactivo para probar el error 409, creamos un cliente nuevo para probarlo
![alt text](images/proceso-1790729467171.png)

tiene el id 21 y lo desactivamos
![alt text](images/proceso-1790729503061.png)

ahora le creamos una campaña y da el error que buscamos

![alt text](images/proceso-1790729537608.png)

ahora probamos el ac5 getone y nos trae el cliente dentro de la campaña

![alt text](images/proceso-1790729690160.png)

Aparece la campaña en el swagger

![alt text](images/proceso-1790729915282.png)


## ISS - 07

### OBJ

**OBJ:** Al finalizar, se podrán gestionar hitos de una campaña con su estado de negocio, aplicando RN-08 (no hay hitos en campañas inactivas) y las invariantes de estado del SDD.

### AC

**AC:**
- [x] **AC-1** Dado la app arrancada; cuando `sync`; entonces existe `hitos` con FK real a `campanias`.
- [x] **AC-2** Dado una campaña activa; cuando `POST /api/hitos` (aunque se envíe `"estado":"CERRADO"`); entonces `201` con `estado: ABIERTO` y `fecha_cierre: null`.
- [x] **AC-3** Dado una campaña `inactive`; cuando `POST /api/hitos` con su id; entonces `409` (RN-08) y no se crea fila.
- [x] **AC-4** Dado un `campania_id` inexistente; cuando `POST /api/hitos`; entonces `404`.
- [x] **AC-5** Dado un hito; cuando `PATCH` con `"estado":"PERDIDO"`; entonces `400`.
- [x] **AC-6** Dado un hito `ABIERTO`; cuando `PATCH` a `CERRADO`; entonces `200` con `fecha_cierre` asignada; y un `PATCH` posterior a `ABIERTO` responde `409`.
- [x] **AC-7** Dado la tabla vacía; cuando `npm run db:seed`; entonces se crean hitos `ABIERTO` sobre campañas activas, en orden clientes → campanias → hitos, sin duplicar al repetir.

### Procedimiento

1. pegamos el prompt 

``` text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-07, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-07.md siguiendo docs/manual.md seccion 12 (ISS-07, feature Product con relacion),
adaptado a la entidad Hito de Norte Creativo. Mismo estilo de los features cliente y campania ya hechos.

Feature src/features/business/hito: model, controller, routes, associations, seeder, swagger y carpeta http/.
Modelo Hito (tabla hitos, timestamps true): campania_id INTEGER requerido FK a campanias.id, nombre STRING requerido,
descripcion TEXT opcional, estado ENUM(ABIERTO,CERRADO,FACTURADO) default ABIERTO, fecha_cierre DATE opcional,
status ENUM(active,inactive) default active.
hito.associations.ts: Campania.hasMany(Hito, foreignKey campania_id) y Hito.belongsTo(Campania, foreignKey campania_id, as "campania"),
importado en src/config/index.ts antes del sync.
Controller HitoController con los 7 metodos. En create y updatePut: campania inexistente -> 404; campania inactive -> 409 (RN-08).
Invariantes: create IGNORA estado y fecha_cierre del body (siempre nace ABIERTO y fecha_cierre null);
en updatePatch un estado fuera del ENUM -> 400; pasar a CERRADO asigna fecha_cierre = ahora;
un hito CERRADO no puede volver a ABIERTO -> 409 (RN-06). getOne incluye la campania.
Rutas SIN AUTH en /api/hitos (incluido PATCH /api/hitos/:id/deactivate) en src/routes/index.ts.
http/ con los .http de get, create, update y delete, leyenda SIN AUTH, puerto 3012.
Seeder seedHitos(count) idempotente sobre campanias activas, estado ABIERTO; agregalo al SeedersRunner despues de campanias,
con SEED_HITOS y --hitos=N. hitoSwagger registrado en src/swagger/index.ts.
Al final verifica y reporta que el orden de seeders es clientes -> campanias -> hitos.

Prohibido: tareas, entregables, aprobaciones, cierre automatico de hito, force, alter. Prohibido: autenticacion, JWT, bcrypt, passwords, guards, RBAC, NestJS. NO toques docs/. NO commitees .env.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

Salida:

![alt text](images/proceso-1790731319750.png)
![alt text](images/proceso-1790731434852.png)
![alt text](images/proceso-1790731443468.png)

probamos que corra
![alt text](images/proceso-1790731469683.png)

probamos el fk real del ac1

![alt text](images/proceso-1790731534856.png)

probamos que un hito nace abierto aunque este en cerrado, debe dar 201

![alt text](images/proceso-1790731592013.png)

probamos con una campaña inexistente que de 404 error

![alt text](images/proceso-1790731718862.png)

estado invalido

![alt text](images/proceso-1790731734334.png)

probamos con errar un hito y que de 200 con la fecha de cierre

![alt text](images/proceso-1790731811235.png)

error 409

![alt text](images/proceso-1790731863351.png)

## ISS - 08

### OBJ

**OBJ:** Al finalizar, se podrán gestionar las tareas de un hito existente, primer eslabón de la cadena que el cierre automático recorre.

### AC

**AC:**
- [x] **AC-1** Dado la app; cuando `sync`; entonces existe `tareas` con FK real a `hitos`.
- [x] **AC-2** Dado un `hito_id` existente; cuando `POST /api/tareas`; entonces `201`.
- [x] **AC-3** Dado un `hito_id` inexistente; cuando `POST /api/tareas`; entonces `404` y no crea fila.
- [x] **AC-4** Dado un payload sin `nombre` o sin `hito_id`; cuando `POST /api/tareas`; entonces `400`.
- [x] **AC-5** Dado una tarea; cuando `PATCH` y luego `PATCH /:id/deactivate`; entonces `200` y deja de aparecer en `GET /api/tareas`.
- [x] **AC-6** Dado la tabla vacía; cuando `npm run db:seed` ×2; entonces se crean tareas sin duplicar.

### Procedimiento

1. pegamos el prompt 

``` text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-08, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-08.md siguiendo docs/manual.md secciones 11 y 12 (CRUD completo + relacion
con archivo associations), con el MISMO estilo de los features cliente, campania e hito ya hechos en este proyecto.

Feature src/features/business/tarea: model, controller, routes, associations, seeder, swagger y carpeta http/.
Modelo Tarea (tabla tareas, timestamps true): hito_id INTEGER requerido FK a hitos.id, nombre STRING requerido, descripcion TEXT opcional, status ENUM(active,inactive) default active.
tarea.associations.ts: Hito.hasMany(Tarea, foreignKey hito_id, as "tareas") y Tarea.belongsTo(Hito, foreignKey hito_id, as "hito"), importado en src/config/index.ts antes del sync.
Controller TareaController con los 7 metodos (getAll solo status active, getOne con include del padre, create, updatePut,
updatePatch, deletePhysical, deleteLogical). En create y updatePut: si el hito no existe -> 404.
Errores: validacion -> 400, no encontrado -> 404, regla de negocio -> 409.
Rutas SIN AUTH en /api/tareas (incluido PATCH /api/tareas/:id/deactivate) registradas en src/routes/index.ts.
http/ con los .http de get, create, update y delete, leyenda SIN AUTH, puerto 3012.
Seeder seedTareas(count) idempotente sobre hitos existentes; agregalo al SeedersRunner DESPUES de hitos, con SEED_TAREAS y --tareas=N en counts.ts.

Swagger del feature registrado en src/swagger/index.ts.

NO adelantes ISS-09 (entregable). Prohibido: autenticacion, JWT, bcrypt, passwords, guards, RBAC, NestJS, force, alter. NO toques docs/. NO commitees .env.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

Salida:

![alt text](images/proceso-1790732397722.png)
![alt text](images/proceso-1790732412961.png)
![alt text](images/proceso-1790732426110.png)

probamos que corra

![alt text](images/proceso-1790732458078.png)

vemos un id de un hito

![alt text](images/proceso-1790732510837.png)

vemos el fk que hay

![alt text](images/proceso-1790732547910.png)
![alt text](images/proceso-1790732567816.png)

creamos la tarea valida del ac2 y nos da codigo 201

![alt text](images/proceso-1790732896495.png)

Hito inexsistente del ac3 dando codigo 404

![alt text](images/proceso-1790733942007.png)

payload invalido al id 1 sin nombre y sin hito id del ac4

![alt text](images/proceso-1790734004416.png)

![alt text](images/proceso-1790734014072.png)

ac5 patch y desactivar, al final ya no muestra el listado

![alt text](images/proceso-1790734177661.png)

## ISS - 09

### OBJ

**OBJ:** Al finalizar, se podrán gestionar los entregables que produce cada tarea, que son las piezas cuyas versiones se aprueban o rechazan.

### AC

**AC:**
- [x] **AC-1** Dado la app; cuando `sync`; entonces existe `entregables` con FK real a `tareas`.
- [x] **AC-2** Dado un `tarea_id` existente; cuando `POST /api/entregables`; entonces `201` con `estado: EN_PROCESO` y `fecha_inicio` asignada.
- [x] **AC-3** Dado un `tarea_id` inexistente; cuando `POST`; entonces `404`.
- [x] **AC-4** Dado un payload sin `tarea_id`; cuando `POST`; entonces `400`.
- [x] **AC-5** Dado un entregable; cuando `GET /api/entregables/:id`; entonces incluye su tarea.
- [x] **AC-6** Dado la tabla vacía; cuando `npm run db:seed` ×2; entonces se crean entregables sin duplicar.

### Procedimiento

1. pegamos el prompt 

``` text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-09, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-09.md siguiendo docs/manual.md secciones 11 y 12 (CRUD completo + relacion
con archivo associations), con el MISMO estilo de los features cliente, campania e hito ya hechos en este proyecto.

Feature src/features/business/entregable: model, controller, routes, associations, seeder, swagger y carpeta http/.
Modelo Entregable (tabla entregables, timestamps true): tarea_id INTEGER requerido FK a tareas.id, fecha_inicio DATE opcional, fecha_fin DATE opcional, total DECIMAL(12,2) opcional, estado ENUM(EN_PROCESO,ENTREGADO) default EN_PROCESO, observaciones TEXT opcional, status ENUM(active,inactive) default active. Convierte total a Number al responder (DECIMAL puede llegar como string).
entregable.associations.ts: Tarea.hasMany(Entregable, foreignKey tarea_id, as "entregables") y Entregable.belongsTo(Tarea, foreignKey tarea_id, as "tarea"), importado antes del sync.
Controller EntregableController con los 7 metodos (getAll solo status active, getOne con include del padre, create, updatePut,
updatePatch, deletePhysical, deleteLogical). En create y updatePut: si la tarea no existe -> 404. En create, si no llega fecha_inicio, asigna la fecha actual.
Errores: validacion -> 400, no encontrado -> 404, regla de negocio -> 409.
Rutas SIN AUTH en /api/entregables (incluido PATCH /api/entregables/:id/deactivate) registradas en src/routes/index.ts.
http/ con los .http de get, create, update y delete, leyenda SIN AUTH, puerto 3012.
Seeder seedEntregables(count) idempotente sobre tareas existentes; agregalo al SeedersRunner DESPUES de tareas, con SEED_ENTREGABLES y --entregables=N.

Swagger del feature registrado en src/swagger/index.ts.

NO adelantes ISS-10 (version-entregable). Prohibido: autenticacion, JWT, bcrypt, passwords, guards, RBAC, NestJS, force, alter. NO toques docs/. NO commitees .env.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

Salida:

![alt text](images/proceso-1790734488232.png)

![alt text](images/proceso-1790734547916.png)

![alt text](images/proceso-1790734595040.png)

Miramos el fk, que pide el ac1

![alt text](images/proceso-1790734644285.png)

creamos un entregable valido

![alt text](images/proceso-1790734702348.png)


creamos un entregable en una tarea inexistente que de 404

![alt text](images/proceso-1790734735447.png)

ahora probamos con un payload invalido que cause error 400

![alt text](images/proceso-1790734764864.png)

probamos el getone que traiga en la respuesta el objeto de tarea

![alt text](images/proceso-1790734877739.png)

![alt text](images/proceso-1790734928695.png)



## ISS - 10

### OBJ

**OBJ:** Al finalizar, cada entregable tendrá versiones numeradas automáticamente (v1, v2, v3…), con estado controlado solo por el sistema y protegidas contra cambios una vez aprobadas.

### AC

**AC:**
- [x] **AC-1** Dado un entregable; cuando `POST /api/version-entregables` dos veces; entonces la primera responde `numero_version: 1` y la segunda `numero_version: 2`, ambas `EN_REVISION`.
- [x] **AC-2** Dado un body con `numero_version` o `estado`; cuando `POST`; entonces `400`.
- [x] **AC-3** Dado un `entregable_id` inexistente; cuando `POST`; entonces `404`.
- [x] **AC-4** Dado una versión `APROBADA` (fijada a mano en BD para esta prueba); cuando `PATCH` o `DELETE`; entonces `409` (RN-04).
- [x] **AC-5** Dado un hito `CERRADO` (fijado a mano en BD para esta prueba); cuando se crea versión de un entregable suyo; entonces `409` (RN-06).
- [x] **AC-6** Dado la tabla; cuando `SHOW CREATE TABLE version_entregables`; entonces existe la FK y el UNIQUE (`entregable_id`, `numero_version`).
- [x] **AC-7** Dado la tabla vacía; cuando `npm run db:seed` ×2; entonces cada entregable tiene su versión 1, sin duplicar.

### Procedimiento

1. pegamos el prompt 

``` text
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

Salida:
![alt text](images/proceso-1790735462954.png)

probamos que corra

![alt text](images/proceso-1790735481594.png)

creamos uno limpio para comprobar los ac

![alt text](images/proceso-1790735650297.png)

probamos el numero_version automatico del ac1
primera version

![alt text](images/proceso-1790735943995.png)

ahora estado o numero de version, los 3 nos dan codigo 400

![alt text](images/proceso-1790736040696.png)

entregable inexistente

![alt text](images/proceso-1790736071622.png)

ahora probamos version aprobada inmutable que de 409 y rn04, fijamos el estado a mano en la base ya que no se permite en la api, usamos y los 3 nos dan 409

![alt text](images/proceso-1790736133214.png)

ahora con los hitos cerrados que no admiten versiones nuevas, todos nos deben dar 409, al final reabrimos para no tener errores futuros

![alt text](images/proceso-1790736188134.png)

ac6, fk y unique

![alt text](images/proceso-1790736247431.png)

## ISS - 11

### OBJ

**OBJ:** Al finalizar, registrar una aprobación podrá cerrar el hito automáticamente y de forma atómica cuando todos sus entregables tengan su última versión APROBADA, igual que la capacidad integrada del backend IA.

### AC

**AC:**
- [ ] **AC-1** Dado un hito con un único entregable y su versión `EN_REVISION`; cuando `POST /api/aprobaciones` `APROBADA`; entonces `201` con `hito_cerrado: true`, `hito_id` y `fecha_cierre`, y el hito queda `CERRADO` en BD.
- [ ] **AC-2** Dado un hito con dos entregables; cuando se aprueba la versión de solo uno; entonces `201` con `hito_cerrado: false` y el hito sigue `ABIERTO`.
- [ ] **AC-3** Dado una versión; cuando se registra `RECHAZADA`; entonces `201`, `hito_cerrado: false`, la versión queda `RECHAZADA` y el hito sigue `ABIERTO`.
- [ ] **AC-4** Dado un hito `CERRADO`; cuando se registra una aprobación sobre una de sus versiones; entonces `409` y nada cambia.
- [ ] **AC-5** Dado un `version_entregable_id` inexistente; cuando `POST`; entonces `404`. Con `estado` distinto de `APROBADA|RECHAZADA` → `400`.
- [ ] **AC-6** Dado un hito; cuando `PATCH /api/hitos/:id` con `"estado":"CERRADO"`; entonces `400` (el estado solo lo cambia una aprobación).
- [ ] **AC-7** Dado `cierre-hito.evaluator.ts`; cuando se inspecciona; entonces no importa Sequelize ni Express (función pura).

### Procedimiento

1. pegamos el prompt 

``` text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-11, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-11.md. Es la capacidad integrada CerrarHito, con las MISMAS decisiones del
backend NestJS IA (../backend_IA), adaptada a la estructura del manual Express del curso (modelo + controller + rutas, sin repositorio ni capa de dominio; la transaccion va en el controller, como en product-sale.controller.ts del manual, seccion 13.2b).

Feature src/features/business/aprobacion: model, controller, routes, associations, cierre-hito.evaluator.ts, swagger y http/.
Modelo Aprobacion (tabla aprobaciones, timestamps true): version_entregable_id INTEGER requerido FK a version_entregables.id,
estado ENUM(PENDIENTE,APROBADA,RECHAZADA) requerido, aprobador_id INTEGER requerido (SIN FK, no hay tabla de usuarios),
comentario TEXT opcional, fecha DATE default ahora, status ENUM(active,inactive) default active.
Associations: VersionEntregable.hasMany(Aprobacion, as "aprobaciones") y Aprobacion.belongsTo(VersionEntregable, as "version"), importado antes del sync.

cierre-hito.evaluator.ts: funcion PURA debeCerrarHito(entregables: { entregable_id: number; ultima_version_estado: string | null }[]): boolean,
true SOLO si todos tienen ultima_version_estado === 'APROBADA'; si la lista esta vacia devuelve false. No importa sequelize ni express.

AprobacionController.create dentro de UNA sola transaccion: await sequelize.transaction(async (t) => { ... }):
1) Busca la version (404 si no existe), su entregable, su tarea y su hito; el hito con { transaction: t, lock: t.LOCK.UPDATE }.
2) Si el hito no esta ABIERTO -> 409 "El hito ya esta cerrado y no admite nuevas aprobaciones" (RN-06).
3) Crea la aprobacion y actualiza version_entregables.estado con el mismo veredicto, ambas con { transaction: t }.
4) Si estado es RECHAZADA -> responde hito_cerrado false (la aprobacion SI queda guardada).
5) Si es APROBADA -> trae todas las tareas del hito, todos sus entregables y la ultima version de cada uno
   (order numero_version DESC), arma la lista y llama debeCerrarHito. Si es true, actualiza el hito a estado CERRADO y
   fecha_cierre = ahora dentro de la transaccion.
6) Cualquier error -> rollback automatico.
Validacion: estado distinto de APROBADA o RECHAZADA -> 400; faltan version_entregable_id o aprobador_id -> 400.
Respuesta 201: { aprobacion, hito_cerrado, hito_id, fecha_cierre }.
Rutas SIN AUTH: POST /api/aprobaciones, GET /api/aprobaciones, GET /api/aprobaciones/:id. NO hay PUT, PATCH ni DELETE:
la aprobacion es un registro de auditoria inmutable.

AJUSTE OBLIGATORIO al feature hito (src/features/business/hito/hito.controller.ts): create, updatePut y updatePatch deben
responder 400 si el body trae estado o fecha_cierre ("el estado del hito solo lo cambia una aprobacion"). Actualiza tambien
hito.swagger.ts para no documentar esos campos como editables. No cambies nada mas del hito.

Sin seeder de aprobaciones. aprobacionSwagger registrado en src/swagger/index.ts.
Actualiza el README del backend con el libreto de la demo: cliente -> campania -> hito -> tarea -> entregable -> version 1 ->
RECHAZADA (hito sigue ABIERTO) -> version 2 -> APROBADA (hito CERRADO) -> nueva aprobacion sobre ese hito -> 409.

Prohibido: autenticacion, JWT, bcrypt, passwords, guards, RBAC, NestJS, force, alter. NO toques docs/. NO commitees .env.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

Salida:

![alt text](images/proceso-1790736794372.png)
![alt text](images/proceso-1790736802621.png)

probamos que corra

![alt text](images/proceso-1790736824035.png)

preparacion para probar los ac

![alt text](images/proceso-1790737057919.png)

probamos el ac 1 de cierre automatico, al final dice cerrado con la fecha

![alt text](images/proceso-1790737099400.png)

![alt text](images/proceso-1790737116126.png)

ahora el ac2, un solo entregable aprobado no cierra el hito

![alt text](images/proceso-1790737181393.png)
 
confirmamos que sigue abierto

![alt text](images/proceso-1790737253792.png)

ahora comprobamos el ac3, que rechace la version del segundo entregable, nos da al final el

![alt text](images/proceso-1790737323995.png)

comprobamos el ac4, el hito cerrado no admite mas aprobaciones y debe dar error 409

![alt text](images/proceso-1790737485186.png)

comrpobamos el ac5 mandando una version inexistente y un estado invalido

![alt text](images/proceso-1790738255145.png)

probamos el ac6, que nadie cierra un hito a mano, da error 400 y tambien probamos el put y el post

![alt text](images/proceso-1790738280778.png)
![alt text](images/proceso-1790738304088.png)

ahora probamos que el evaluador sea puro

![alt text](images/proceso-1790738324564.png)


## FASE 2 - AUTH Y REFACTORIZACIONES

Para la fase de auth con rbac se usa la ruta express 2026 del docente, la fase II del manual, que corre sobre el mismo backend_Express, con el mismo puerto 3012 y la misma base norte_creativo_express. 

Los ISS nuevos van del 12 al 21: el ISS-12 y el ISS-13 son el refactor de la fase I a capas (controller, service, repository, model, con dto y shared), esto debido a una confusion donde termine usando una arquitectura puesta en model + controller + routes

ISS-14 al ISS-21 se construye la seguridad. Se agregan 6 tablas, users, roles, resources, role_users, resource_roles y refresh_tokens, que ya estaban modeladas en el sdd, y no existe una entidad permission porque el permiso es la fila que une un rol con un recurso. 

Las rutas tienen tres modalidades, abiertas (login, refresh, logout y swagger), solo jwt (perfil, permisos y sesiones propias) y jwt mas rbac (todo el negocio y la administracion), y el acceso es deny by default, sin concesion se responde 403 y la matriz se consulta en cada peticion. 

El access token es corto, firmado con hs256 con iss, aud, exp y jti, y el refresh token es opaco, se guarda hasheado, rota en cada uso y se puede revocar. Se instalan jsonwebtoken y bcryptjs, el secreto jwt va solo en el .env y el .env.example queda sin valores. 

Los 5 roles son admin, cuentas, creativo, cliente_aprobador y finanzas, con un usuario sembrado por cada uno para poder probar los 403 rol por rol, y la matriz de concesiones sale de los actores del sdd. 

Con esto la rn-05 se cumple de verdad, solo cliente_aprobador aprueba y el aprobador_id sale del token, no del body. Quedan fuera el ownership, que el aprobador vea solo sus campañas, y asignaciontarea, porque el rbac del docente es por endpoint, y se documenta como limitacion. Seguimos con claude code via cli, sin skills, con sonnet 5 en esfuerzo alto, y los commits los hago yo despues de verificar cada ac.

## ISS - 12

### OBJ

**OBJ:** Al finalizar, Cliente, Campania e Hito seguirán el recorrido por capas del manual nuevo, sin cambiar el comportamiento de la API.

### AC

**AC:**
- [x] **AC-1** Existen los tres archivos de `src/shared/`.
- [x] **AC-2** Existen `clientes/`, `campanias/` e `hitos/` con `dto/`, repository, service, controller y routes, y ya no existen `cliente/`, `campania/` ni `hito/`.
- [x] **AC-3** Ningún controller de esos tres features importa `sequelize` ni un `.model`.
- [x] **AC-4** Las reglas (documento duplicado 409, cliente inactivo 409, RN-08 409, `estado` del hito 400) viven en los services y responden igual que antes.
- [x] **AC-5** `GET /api/clientes/abc` responde 400 (validación de `paramId`).
- [x] **AC-6** `npx tsc --noEmit` sin errores, `npm run dev` arranca y `npm run db:seed` corre.

### Procedimiento

1. pegamos el prompt 

``` text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-12, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-12.md en projects/NorteCreativo/backend_Express.
Aplica el patron por capas (capas HTTP -> Controller -> Service -> Repository -> Model, DTOs por operacion, BaseController.run/paramId,
AppError, findOrFail) adaptado a Norte Creativo.
Puerto 3012, base norte_creativo_express, rutas en español como el docente.

Refactoriza los features cliente, campania e hito al patron por capas del manual nuevo, renombrando las carpetas a plural:
features/business/clientes, campanias, hitos. Crea src/shared (app-error, base-controller, with-transaction) como en la seccion 4.0.
Mueve TODA regla de negocio del controller al service (numero_documento unico 409, cliente inactivo no admite campania 409,
RN-08 campania inactiva no admite hito 409, estado/fecha_cierre del hito por HTTP -> 400). El repository es la unica capa que usa Sequelize.
Mantén EXACTAMENTE las rutas, codigos HTTP y forma de respuesta actuales. Actualiza los imports en src/config, src/routes,
src/database/seeders y src/swagger, y los de tarea (FK a hitos) si se rompen.

NO refactorices tarea, entregable, version-entregable ni aprobacion (ISS-13). Prohibido: NestJS, force: true, secretos en el codigo (JWT_SECRET solo en .env; .env.example sin valores), cambiar el puerto 3012 o la base norte_creativo_express. NO toques docs/proceso.md ni docs/trazabilidad_NC/. NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

Salida:
![alt text](images/proceso-1791157022244.png)

![alt text](images/proceso-1791157173528.png)

Compramos que arranca

![alt text](images/proceso-1791156899965.png)

![alt text](images/proceso-1791156904878.png)

vemos que existen los 3 folders de shared

![alt text](images/proceso-1791157004992.png)

ahora vemos que las carpetas viejas escritas en plural ya no existen

![alt text](images/proceso-1791157090472.png)

![alt text](images/proceso-1791157102087.png)

Miramos ahora que los controllers no toquen sequelize y vemos que las reglas respondan igual que antes.

Tenemos tanto codigo 201 para crear el cliente y error 409 cuanto tratamos de crearlo nuevamente con los mismos valores

![alt text](images/proceso-1791157272792.png)

si tratamos de crear un nuevo cliente y este esta inactivo no puede tener una campaña

![alt text](images/proceso-1791157375496.png)

ahora vemos que campaña inactiva no admita un hito y de 409

![alt text](images/proceso-1791157438996.png)

Ahora vemos el ac5, para que el paramID nos valide un id y nos da error 400

![alt text](images/proceso-1791157475034.png)

Vemos que compile, haga la siembra y arranque sin problemas.

![alt text](images/proceso-1791157551742.png)

