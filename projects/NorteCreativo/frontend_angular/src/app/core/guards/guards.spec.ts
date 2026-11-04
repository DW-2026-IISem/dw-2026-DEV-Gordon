import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, UrlTree } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SessionStore } from '../services/session-store';
import { guestGuard } from './guest-guard';
import { permissionGuard } from './permission-guard';

const TOKENS = {
  access_token: 'a',
  token_type: 'Bearer' as const,
  expires_in: 900,
  refresh_token: 'r',
  refresh_expires_in: 3600,
};

describe('guards de acceso', () => {
  let session: SessionStore;
  let router: Router;
  const original = environment.requireAuth;

  beforeEach(() => {
    environment.requireAuth = true;
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    session = TestBed.inject(SessionStore);
    router = TestBed.inject(Router);
  });
  afterEach(() => (environment.requireAuth = original));

  const routeWith = (permission?: string) =>
    ({ data: { permission } }) as unknown as ActivatedRouteSnapshot;
  const run = (permission?: string) =>
    TestBed.runInInjectionContext(() => permissionGuard(routeWith(permission), {} as never));

  it('guestGuard deja entrar a /login sin sesión', () => {
    expect(TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never))).toBe(true);
  });

  it('guestGuard redirige al panel con sesión', () => {
    session.setTokens(TOKENS);
    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as never, {} as never),
    ) as UrlTree;
    expect(router.serializeUrl(result)).toBe('/dashboard');
  });

  it('permissionGuard deja pasar con el permiso concedido', () => {
    session.setTokens(TOKENS);
    session.setAccess({ id: 1 } as never, [
      { method: 'GET', path: '/api/tareas', roles: ['ADMIN'] },
    ]);
    expect(run('GET /api/tareas')).toBe(true);
  });

  it('permissionGuard manda a /forbidden sin el permiso', () => {
    session.setTokens(TOKENS);
    session.setAccess({ id: 1 } as never, []);
    expect(router.serializeUrl(run('GET /api/tareas') as UrlTree)).toBe(
      '/forbidden?permission=GET%20%2Fapi%2Ftareas',
    );
  });

  it('permissionGuard niega si la ruta no declara permiso (deny by default)', () => {
    session.setTokens(TOKENS);
    expect(run(undefined)).toBeInstanceOf(UrlTree);
  });
});
