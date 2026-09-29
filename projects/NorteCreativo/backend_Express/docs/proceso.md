## PROCESO.MD 
### BITACORA GENERAL DE LA CONSTRUCCION DEL BACKEND NESTJS DE NORTE CREATIVO - SOLO BUSINESS
### ESTUDIANTE: CARLOS H. ZARATE
### HERRAMIENTAS: Claude Code
---


## FASE 0 - REQUISITOS PREVIOS Y PREPARACION

Empezamos verificando las versiones de nodejs y npm que tenemos instaladas en el wsl / linux, el manual pide node v20 o superior, en este proyecto ya no se usa nest cli porque el backend ahora es express con typescript, typescript, ts-node y nodemon se instalan como dependencias locales del proyecto en el ISS-01.

Tambien verificamos que el motor de base de datos este accesible, el ISS-00 del manual lo exige, usamos el contenedor de mysql de databases_engines, y dejamos creada la base norte_creativo_express, separada de las bases de los backends de nestjs para no mezclar tablas.

Tambien organizamos los ISS de esta ocasion, son 7 igual que en nestjs pero repartidos distinto, porque la semana 7 solo pide 3 entidades (cliente, campania y hito) y el manual de express trae cosas que nestjs no tenia: crud completo (put, patch, borrado fisico y logico), seeders con faker y swagger. Quedan asi: ISS-01 esqueleto, ISS-02 base de datos, ISS-03 cliente crud, ISS-04 seeders, ISS-05 swagger, ISS-06 campania, ISS-07 hito. Tarea, entregable, version y aprobacion no entran en esta semana.

Tambien configuramos claude code via CLI, no usamos ninguna skill y mantendremos el uso del modelo Sonnet 5 con esfuerzo alto, en dado caso sea requerido usaremos el modelo Opus 5.

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

