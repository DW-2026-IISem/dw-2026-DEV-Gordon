import { normalizePath } from './resource-match';

// Interruptor del modo práctica (Fase I del frontend). Si la variable falta o tiene cualquier valor
// distinto de "false", vale true: es más seguro equivocarse cerrando que abriendo.
// Se lee en cada llamada (no al importar) para que dotenv ya haya cargado el .env.
export const isAuthEnabled = (): boolean => (process.env.AUTH_ENABLED ?? 'true').trim().toLowerCase() !== 'false';

// Recursos de negocio que el modo práctica deja pasar sin token.
const NEGOCIO_ABIERTO = ['clientes', 'campanias', 'hitos', 'tareas', 'entregables', 'version-entregables'];

// Con AUTH_ENABLED=false: ¿esta petición se atiende sin JWT ni RBAC?
// Solo negocio + GET de aprobaciones. POST /api/aprobaciones queda cerrado (RN-05: el aprobador sale del token).
// Administración, perfil, permisos y sesiones nunca están en la lista.
export const isOpenInPracticeMode = (method: string, originalUrl: string): boolean => {
  if (isAuthEnabled()) return false;

  const verbo = method.toUpperCase();
  const [api, recurso] = normalizePath(originalUrl).split('/').filter(Boolean);
  if (api !== 'api' || !recurso) return false;

  if (recurso === 'aprobaciones') return verbo === 'GET' || verbo === 'HEAD';
  return NEGOCIO_ABIERTO.includes(recurso);
};
