import { FormControl } from '@angular/forms';
import { apiPath } from './recurso-form';

describe('apiPath', () => {
  it('rechaza una ruta sin /api/', () => {
    expect(apiPath(new FormControl('clientes', { nonNullable: true }))).toEqual({ apiPath: true });
  });
  it('acepta /api/clientes/:id', () => {
    expect(apiPath(new FormControl('/api/clientes/:id', { nonNullable: true }))).toBeNull();
  });
});
