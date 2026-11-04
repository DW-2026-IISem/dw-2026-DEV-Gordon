import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, Observable, shareReplay, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionTokens } from '../models/auth';
import { AuthService } from '../services/auth';
import { NotificationService } from '../services/notification';
import { SessionStore } from '../services/session-store';

// Una sola renovación a la vez: las peticiones que reciben 401 al mismo tiempo comparten este Observable.
let refreshInFlight: Observable<SessionTokens> | null = null;

const AUTH_ENDPOINT = /\/sesion\/(login|refresh|logout)$/;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionStore);
  const auth = inject(AuthService);
  const router = inject(Router);
  const notify = inject(NotificationService);

  // El token solo viaja hacia nuestra API y nunca en login, refresh ni logout.
  const isApi = req.url.startsWith(environment.apiUrl);
  const isAuthEndpoint = AUTH_ENDPOINT.test(req.url);
  const withToken = (request: HttpRequest<unknown>, token: string) =>
    request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  const token = session.accessToken();
  const outgoing = isApi && !isAuthEndpoint && token ? withToken(req, token) : req;

  const expire = (): void => {
    const returnUrl = router.url;
    session.clear();
    // El aviso sale ya con /login en pantalla (el toast vive en la raíz de la app).
    void router
      .navigate(['/login'], { queryParams: { returnUrl } })
      .then(() => notify.warn('Tu sesión expiró. Inicia sesión de nuevo.', 'Sesión expirada'));
  };

  return next(outgoing).pipe(
    catchError((error: unknown) => {
      const is401 = error instanceof HttpErrorResponse && error.status === 401;
      if (!is401 || !isApi || isAuthEndpoint || !environment.requireAuth)
        return throwError(() => error);

      if (!session.refreshToken()) {
        expire();
        return throwError(() => error);
      }

      refreshInFlight ??= auth.refresh().pipe(
        shareReplay(1),
        finalize(() => (refreshInFlight = null)),
      );

      return refreshInFlight.pipe(
        // Si la renovación falla (token rotado, familia revocada, usuario desactivado) la sesión se cierra.
        catchError((refreshError: unknown) => {
          expire();
          return throwError(() => refreshError);
        }),
        switchMap((tokens) => next(withToken(req, tokens.access_token))),
      );
    }),
  );
};
