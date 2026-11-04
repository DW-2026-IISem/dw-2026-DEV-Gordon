import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SessionStore } from '../services/session-store';

// Sin sesión -> /login?returnUrl=<ruta pedida>. Con requireAuth en false deja pasar (Fase I).
export const authGuard: CanActivateFn = (_route, state) => {
  if (!environment.requireAuth) return true;
  if (inject(SessionStore).isAuthenticated()) return true;
  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
