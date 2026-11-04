import { HttpErrorResponse } from '@angular/common/http';
import { toApiMessage } from './api-error';

describe('toApiMessage', () => {
  it('distingue backend caído (status 0) de un 403', () => {
    const caido = toApiMessage(
      new HttpErrorResponse({ status: 0, error: new ProgressEvent('error') }),
    );
    const prohibido = toApiMessage(
      new HttpErrorResponse({
        status: 403,
        error: { message: 'No autorizado: sin concesión para GET /api/usuarios' },
      }),
    );

    expect(caido).toContain('No se pudo conectar con el servidor');
    expect(prohibido).toBe('No autorizado: sin concesión para GET /api/usuarios');
    expect(caido).not.toBe(prohibido);
  });

  it('muestra la lista errors de un 400', () => {
    const mensaje = toApiMessage(
      new HttpErrorResponse({
        status: 400,
        error: {
          message: 'Error de validación',
          errors: ['Cliente.nombre cannot be null', 'Cliente.numero_documento cannot be null'],
        },
      }),
    );

    expect(mensaje).toContain('Cliente.nombre cannot be null');
    expect(mensaje).toContain('Cliente.numero_documento cannot be null');
  });

  it('usa el message del backend en 401, 404 y 409', () => {
    for (const status of [401, 404, 409]) {
      expect(
        toApiMessage(new HttpErrorResponse({ status, error: { message: `mensaje ${status}` } })),
      ).toBe(`mensaje ${status}`);
    }
  });

  it('da un texto genérico si el error no es HTTP', () => {
    expect(toApiMessage('algo')).toBe('Ocurrió un error inesperado.');
    expect(toApiMessage(new Error('falló'))).toBe('falló');
  });
});
