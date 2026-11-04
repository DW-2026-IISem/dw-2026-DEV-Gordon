import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

// Va después del de autenticación: traduce "sin respuesta" (status 0) a un mensaje entendible.
export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 0) {
        return throwError(
          () =>
            new HttpErrorResponse({
              error: {
                message: 'Backend no disponible. Verifica que esté encendido en el puerto 3012.',
              },
              status: 0,
              statusText: error.statusText,
              url: error.url ?? undefined,
            }),
        );
      }
      return throwError(() => error);
    }),
  );
