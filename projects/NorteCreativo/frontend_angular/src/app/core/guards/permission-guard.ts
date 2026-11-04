import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SessionStore } from '../services/session-store';

// Lee `data.permission` de la ruta ("GET /api/tareas"). Deny by default: sin permiso declarado o sin concesión, /forbidden.
export const permissionGuard: CanActivateFn = (route) => {
  if (!environment.requireAuth) return true;
  const permission = route.data['permission'] as string | undefined;
  if (permission && inject(SessionStore).canPermission(permission)) return true;
  return inject(Router).createUrlTree(['/forbidden'], { queryParams: { permission } });
};
