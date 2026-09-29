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

