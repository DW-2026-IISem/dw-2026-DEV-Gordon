import { HttpErrorResponse } from '@angular/common/http';

interface ApiErrorBody {
  message?: string;
  errors?: string[];
}

// Traduce un error HTTP a un texto para el usuario. Distingue "backend caído" (status 0) de un 403.
export function toApiMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
  }

  const body = (typeof error.error === 'object' && error.error !== null ? error.error : {}) as ApiErrorBody;

  switch (error.status) {
    case 0:
      return 'No se pudo conectar con el servidor. Verifica que el backend esté encendido (puerto 3012) y que permita este origen.';
    case 400:
      return body.errors?.length ? body.errors.join('\n') : (body.message ?? 'La solicitud no es válida.');
    case 401:
      return body.message ?? 'Tu sesión no es válida o venció. Inicia sesión de nuevo.';
    case 403:
      return body.message ?? 'No tienes permiso para realizar esta acción.';
    case 404:
      return body.message ?? 'No se encontró el recurso solicitado.';
    case 409:
      return body.message ?? 'La operación entra en conflicto con el estado actual de los datos.';
    default:
      return body.message ?? 'Ocurrió un error en el servidor. Inténtalo de nuevo.';
  }
}
