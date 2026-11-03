import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Cliente } from '../../core/models/cliente';
import { AprobacionApi } from '../aprobaciones/aprobacion-api';
import { ClienteApi } from './cliente-api';

const cliente: Cliente = {
  id: 1,
  tipo_documento: 'NIT',
  numero_documento: '900123456',
  nombre: 'Cliente demo',
  telefono: null,
  email: null,
  status: 'active',
  createdAt: '2026-09-30T00:00:00.000Z',
  updatedAt: '2026-09-30T00:00:00.000Z',
};

describe('servicios de API', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }));

  it('ClienteApi.list() desenvuelve { clientes } y devuelve Cliente[]', () => {
    const http = TestBed.inject(HttpTestingController);
    let resultado: Cliente[] | undefined;

    TestBed.inject(ClienteApi).list().subscribe((lista) => (resultado = lista));
    http.expectOne(`${environment.apiUrl}/clientes`).flush({ clientes: [cliente] });

    expect(Array.isArray(resultado)).toBe(true);
    expect(resultado).toEqual([cliente]);
  });

  it('ClienteApi.get() desenvuelve { cliente } y devuelve Cliente', () => {
    const http = TestBed.inject(HttpTestingController);
    let resultado: Cliente | undefined;

    TestBed.inject(ClienteApi).get(1).subscribe((item) => (resultado = item));
    http.expectOne(`${environment.apiUrl}/clientes/1`).flush({ cliente });

    expect(resultado).toEqual(cliente);
  });

  it('AprobacionApi no expone update, replace, deactivate ni remove', () => {
    const api = TestBed.inject(AprobacionApi);
    for (const metodo of ['update', 'replace', 'deactivate', 'remove']) {
      expect(metodo in api).toBe(false);
    }
    expect(typeof api.list).toBe('function');
    expect(typeof api.create).toBe('function');
  });
});
