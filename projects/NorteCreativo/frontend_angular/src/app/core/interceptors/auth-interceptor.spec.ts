import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { environment } from '../../../environments/environment';
import { SessionTokens } from '../models/auth';
import { SessionStore } from '../services/session-store';
import { authInterceptor } from './auth-interceptor';

const api = environment.apiUrl;
const tokens = (n: string): SessionTokens => ({
  access_token: `access-${n}`,
  token_type: 'Bearer',
  expires_in: 900,
  refresh_token: `refresh-${n}`,
  refresh_expires_in: 604800,
});

describe('authInterceptor', () => {
  const original = environment.requireAuth;
  let http: HttpClient;
  let backend: HttpTestingController;
  let session: SessionStore;

  beforeEach(() => {
    localStorage.clear();
    environment.requireAuth = true;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', children: [] }]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        MessageService,
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    session = TestBed.inject(SessionStore);
    session.setTokens(tokens('viejo'));
  });

  afterEach(() => {
    environment.requireAuth = original;
    localStorage.clear();
  });

  it('agrega Bearer a la API, pero no en login ni refresh', () => {
    http.get(`${api}/clientes`).subscribe();
    http.post(`${api}/sesion/login`, {}).subscribe();
    http.post(`${api}/sesion/refresh`, {}).subscribe();
    expect(backend.expectOne(`${api}/clientes`).request.headers.get('Authorization')).toBe(
      'Bearer access-viejo',
    );
    expect(backend.expectOne(`${api}/sesion/login`).request.headers.has('Authorization')).toBe(
      false,
    );
    expect(backend.expectOne(`${api}/sesion/refresh`).request.headers.has('Authorization')).toBe(
      false,
    );
  });

  it('no agrega Bearer a otros orígenes', () => {
    http.get('https://otro.example/datos').subscribe();
    expect(
      backend.expectOne('https://otro.example/datos').request.headers.has('Authorization'),
    ).toBe(false);
  });

  it('varios 401 a la vez comparten un solo refresh y reintentan con el token nuevo', () => {
    const resultados: unknown[] = [];
    for (const recurso of ['clientes', 'campanias', 'hitos']) {
      http.get(`${api}/${recurso}`).subscribe((r) => resultados.push(r));
    }
    for (const req of backend.match(
      (r) => r.url.startsWith(`${api}/`) && !r.url.includes('/sesion/'),
    )) {
      req.flush({ message: 'vencido' }, { status: 401, statusText: 'Unauthorized' });
    }

    const refreshes = backend.match(`${api}/sesion/refresh`);
    expect(refreshes).toHaveLength(1);
    expect(refreshes[0].request.body).toEqual({ refresh_token: 'refresh-viejo' });
    refreshes[0].flush(tokens('nuevo'));

    const reintentos = backend.match((r) => !r.url.includes('/sesion/'));
    expect(reintentos).toHaveLength(3);
    for (const req of reintentos) {
      expect(req.request.headers.get('Authorization')).toBe('Bearer access-nuevo');
      req.flush({ ok: true });
    }
    expect(resultados).toHaveLength(3);
    expect(session.refreshToken()).toBe('refresh-nuevo');
  });

  it('si el refresh responde 401 limpia la sesión y va a /login', () => {
    const router = TestBed.inject(Router);
    const navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    http.get(`${api}/clientes`).subscribe({ error: () => undefined });
    backend.expectOne(`${api}/clientes`).flush({}, { status: 401, statusText: 'Unauthorized' });
    backend
      .expectOne(`${api}/sesion/refresh`)
      .flush({ message: 'rotado' }, { status: 401, statusText: 'Unauthorized' });
    expect(session.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('nortecreativo.session.v1')).toBeNull();
    expect(navegar).toHaveBeenCalledWith(['/login'], expect.anything());
  });
});
