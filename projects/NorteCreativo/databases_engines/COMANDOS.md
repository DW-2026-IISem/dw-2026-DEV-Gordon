# Comandos utiles - Norte Creativo

Referencia rapida para trabajar con los 4 motores (databases_engines/) y
probar el backend (backend_manual/). Todos los comandos de esta seccion
se corren desde dentro de la carpeta databases_engines/, salvo que se
indique lo contrario.

---

## Docker Compose - los 4 motores

### Levantar todo

    docker compose up -d

### Levantar solo uno (ej: solo mysql, si los otros pesan mucho en WSL)

    docker compose up -d mysql

### Ver el estado (healthy / unhealthy / starting)

    docker compose ps

### Parar uno sin borrarlo

    docker compose stop mysql
    docker compose stop postgres
    docker compose stop mssql
    docker compose stop oracle

### Parar varios a la vez

    docker compose stop oracle mssql postgres

### Volver a encender uno que estaba parado

    docker compose start mysql

### Reiniciar uno (sin perder datos)

    docker restart nc-mysql

### Parar TODO (conserva los datos en los volumenes)

    docker compose down

### Parar TODO y BORRAR los datos (reinicio total, para cuando algo
### quedo mal inicializado, como paso hoy con la password de MySQL)

    docker compose down -v

---

## Logs

### Ver las ultimas N lineas

    docker logs nc-mysql --tail 50
    docker logs nc-postgres --tail 50
    docker logs nc-sqlserver --tail 50
    docker logs nc-oracle --tail 50

### Ver el log en vivo (Ctrl+C para salir, no detiene el contenedor)

    docker logs nc-mysql -f

---

## Conectarse a cada motor manualmente

### MySQL

    docker exec -it nc-mysql mysql -u root -p
    # password: la de MYSQL_ROOT_PASSWORD en .env

### PostgreSQL

    docker exec -it nc-postgres psql -U nc_admin -d norte_creativo
    # password: la de POSTGRES_PASSWORD en .env

### SQL Server

    docker exec -it nc-sqlserver /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P 'TU_PASSWORD'

### Oracle

    docker exec -it nc-oracle sqlplus system/TU_PASSWORD@XE

---

## Diagnostico cuando un motor no arranca bien

    # ver si se esta reiniciando en bucle
    docker inspect nc-mysql --format='{{.State.Status}} - restarts: {{.RestartCount}}'

    # ver que contenedores y volumenes existen en el sistema (no solo este compose)
    docker ps -a
    docker volume ls

    # borrar un volumen puntual si quedo con datos/password incorrectos
    # (el contenedor debe estar detenido y eliminado primero)
    docker compose stop mysql
    docker compose rm -f mysql
    docker volume rm databases_engines_mysql_data
    docker compose up -d mysql

---

## Probar el backend (desde backend_manual/)

    cd ../backend_manual

### Arrancar en modo desarrollo (recompila solo al guardar)

    npm run start:dev

### Health check

    curl http://localhost:3010/api/health
    # esperado: {"status":"ok"}

### Swagger (abrir en el navegador)

    http://localhost:3010/api/docs

---

## Probar la feature clientes

### Crear un cliente

    curl -X POST http://localhost:3010/api/clientes \
      -H 'Content-Type: application/json' \
      -d '{"tipoDocumento":"NIT","numeroDocumento":"900123456-7","nombre":"Postobon S.A.","email":"contacto@postobon.com"}'

### Listar clientes (paginado)

    curl http://localhost:3010/api/clientes
    curl "http://localhost:3010/api/clientes?page=1&limit=10"

### Obtener un cliente por id (usa el id que te devolvio el create, ej. 1)

    curl http://localhost:3010/api/clientes/1

### Verificar en la base de datos directamente

    docker exec -it nc-mysql mysql -u root -p
    # dentro de mysql>
    USE norte_creativo;
    SELECT * FROM clientes;

---

## Recordatorios

- .env NUNCA se sube al repo (esta en .gitignore). .env.example si.
- Los 4 motores compiten por disco en WSL si estan todos arriba a la vez.
  Si uno tarda mucho en pasar a healthy, prueba parar los que no estas
  usando en ese momento.
- Los datos de cada motor viven en su volumen (mysql_data, postgres_data,
  etc). "docker compose down" los conserva; "docker compose down -v" los
  borra. Si cambias una password en .env DESPUES de que el contenedor ya
  se creo, el cambio no aplica solo -- hay que borrar el volumen y
  recrear el contenedor para que la nueva password tome efecto.
