# Motores de BD - Norte Creativo

4 motores en un solo docker-compose.yml, siguiendo la configuracion
validada en la Semana 01.

## Levantar

cp .env.example .env
# editar .env con tus claves reales
docker compose up -d
docker compose ps

Oracle es el mas lento en arrancar (1-2 min la primera vez).
Verifica con: docker logs nc-oracle -f
hasta ver "DATABASE IS READY TO USE!"

## Puertos (host)

MySQL      3306  root
PostgreSQL 5433  (POSTGRES_USER)  -- ojo: no 5432
SQL Server 1433  sa               -- usa mssql-tools18, no mssql-tools
Oracle XE  1521 (+8080 APEX) system -- gvenzl/oracle-xe:21-slim, SIN user: root

## Conectar desde el backend

En el .env del backend (backend_manual/.env), los DB_*_HOST apuntan a
localhost y los puertos deben coincidir con los de arriba.

## Conectar manualmente

docker exec -it nc-mysql mysql -u root -p
docker exec -it nc-postgres psql -U nc_admin -d norte_creativo
docker exec -it nc-sqlserver /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P 'TU_PASSWORD'
docker exec -it nc-oracle sqlplus system/TU_PASSWORD@XE

## Apagar

docker compose down       # conserva datos
docker compose down -v    # borra datos
EOF_DBcat > README.md <<'EOF_DB'
# Motores de BD - Norte Creativo

4 motores en un solo docker-compose.yml, siguiendo la configuracion
validada en la Semana 01.

## Levantar

cp .env.example .env
# editar .env con tus claves reales
docker compose up -d
docker compose ps

Oracle es el mas lento en arrancar (1-2 min la primera vez).
Verifica con: docker logs nc-oracle -f
hasta ver "DATABASE IS READY TO USE!"

## Puertos (host)

MySQL      3306  root
PostgreSQL 5433  (POSTGRES_USER)  -- ojo: no 5432
SQL Server 1433  sa               -- usa mssql-tools18, no mssql-tools
Oracle XE  1521 (+8080 APEX) system -- gvenzl/oracle-xe:21-slim, SIN user: root

## Conectar desde el backend

En el .env del backend (backend_manual/.env), los DB_*_HOST apuntan a
localhost y los puertos deben coincidir con los de arriba.

## Conectar manualmente

docker exec -it nc-mysql mysql -u root -p
docker exec -it nc-postgres psql -U nc_admin -d norte_creativo
docker exec -it nc-sqlserver /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P 'TU_PASSWORD'
docker exec -it nc-oracle sqlplus system/TU_PASSWORD@XE

## Apagar

docker compose down       # conserva datos
docker compose down -v    # borra datos
