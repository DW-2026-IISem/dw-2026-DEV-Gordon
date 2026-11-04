import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SessionStore } from '../services/session-store';

// Con sesión iniciada, /login no tiene sentido: lleva al panel.
export const guestGuard: CanActivateFn = () => {
  if (environment.requireAuth && inject(SessionStore).isAuthenticated()) {
    return inject(Router).createUrlTree(['/dashboard']);
  }
  return true;
};
