# Norte Creativo — frontend Angular

Angular 22 (standalone + signals), PrimeNG 22 (tema Aura) y Tailwind v4. Consume `backend_Express` (puerto 3012).

## Arranque

1. Base de datos y backend (`projects/NorteCreativo/backend_Express`):
   ```bash
   docker start nc-mysql
   npm install && npm run db:seed
   npm run dev          # escucha en http://localhost:3012 (Swagger en /api/docs)
   ```
2. Frontend (esta carpeta):
   ```bash
   npm install
   npm start            # http://localhost:4200
   ```

## Usuarios del seeder

| Usuario | Contraseña | Rol | Qué ve |
|---|---|---|---|
| `admin` | `Admin123!` | ADMIN | Operación completa + Seguridad (no puede aprobar: RN-05) |
| `cuentas` | `Cuentas123!` | CUENTAS (+ CREATIVO) | Clientes (lectura), campañas, hitos y tareas (CRUD) |
| `creativo` | `Creativo123!` | CREATIVO | Entregables y versiones (crear/editar) |
| `aprobador` | `Aprobador123!` | CLIENTE_APROBADOR | Aprobaciones (solo él puede registrarlas) |
| `finanzas` | `Finanzas123!` | FINANZAS | Clientes, campañas y hitos (lectura) |

## Interruptores de fase

| Fase | `requireAuth` (en `src/environments/environment.ts` **y** `environment.development.ts`) | Backend | Storage |
|---|---|---|---|
| II (por defecto) | `true` | `AUTH_ENABLED=true` (o sin definir) | — |
| I (práctica, sin login) | `false` | `AUTH_ENABLED=false` | borrar la clave `nortecreativo.session.v1` |

Si solo se cambia un lado aparecen 401. Con `AUTH_ENABLED=false` el backend solo abre el negocio: `POST /api/aprobaciones`, administración, perfil y permisos siguen pidiendo JWT.
Arranca siempre el backend con la variable explícita (`AUTH_ENABLED=true npm run dev`) para no heredar un valor de otra sesión.

## Calidad

```bash
npm run build          # presupuestos: initial 750 kB aviso / 1 MB error; estilo por componente 4 kB / 8 kB
npm test               # Vitest (ng test)
npm run format:check   # Prettier sobre src/**/*.{ts,html,css}
npm run format         # aplica Prettier
```

## Publicación

```bash
npx ng build
npx serve -s dist/front-norte-creativo/browser   # -s = fallback SPA a index.html
```

El servidor estático debe devolver `index.html` para cualquier ruta (por ejemplo `/entregables/5`); sin ese fallback, F5 en una ruta profunda da 404.

## Flujo para dar un permiso nuevo

1. Confirmar el recurso en **Seguridad → Recursos**.
2. Conceder el recurso al rol en **Seguridad → Permisos**.
3. «Ver permisos» del usuario en **Seguridad → Usuarios**.
4. Entrar como ese usuario y pulsar **Actualizar permisos** (menú de usuario).

Crear un recurso no crea una pantalla: solo habilita una ruta que ya existe en el menú.

## Problemas conocidos

Ver [`docs/problemas.md`](docs/problemas.md).
