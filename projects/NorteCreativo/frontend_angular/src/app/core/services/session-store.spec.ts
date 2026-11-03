import { environment } from '../../../environments/environment';
import { Perfil, Permiso } from '../models/auth';
import { SessionStore } from './session-store';

const perfil: Perfil = {
  id: 1,
  username: 'admin',
  email: 'admin@nortecreativo.com',
  status: 'active',
  roles: [{ id: 1, name: 'ADMIN', description: null }],
};

const permisos: Permiso[] = [
  { method: 'GET', path: '/api/clientes', roles: ['ADMIN'] },
  { method: 'GET', path: '/api/hitos/:id', roles: ['ADMIN'] },
];

describe('SessionStore', () => {
  const original = environment.requireAuth;

  beforeEach(() => localStorage.clear());
  afterEach(() => {
    environment.requireAuth = original;
    localStorage.clear();
  });

  it('concede todo mientras requireAuth sea false', () => {
    environment.requireAuth = false;
    expect(new SessionStore().can('DELETE', '/api/cualquier/cosa')).toBe(true);
  });

  it('con requireAuth true compara método y ruta (:id como regex, sin query string)', () => {
    environment.requireAuth = true;
    const store = new SessionStore();
    store.setAccess(perfil, permisos);

    expect(store.can('GET', '/api/clientes?page=2')).toBe(true);
    expect(store.canPermission('GET /api/clientes')).toBe(true);
    expect(store.can('GET', '/api/hitos/42')).toBe(true);
    expect(store.can('GET', '/api/hitos/42/extra')).toBe(false);
    expect(store.can('POST', '/api/clientes')).toBe(false);
    expect(store.permissionCount()).toBe(2);
    expect(store.roleNames()).toEqual(['ADMIN']);
  });

  it('persiste en localStorage y se restaura, y clear() la borra', () => {
    const a = new SessionStore();
    a.setTokens({ access_token: 'a', token_type: 'Bearer', expires_in: 900, refresh_token: 'r', refresh_expires_in: 604800 });
    a.setAccess(perfil, permisos);
    expect(localStorage.getItem('nortecreativo.session.v1')).not.toBeNull();

    const b = new SessionStore();
    expect(b.isAuthenticated()).toBe(true);
    expect(b.usuario()?.username).toBe('admin');

    b.clear();
    expect(b.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('nortecreativo.session.v1')).toBeNull();
  });

  it('ignora un JSON dañado o con otra forma', () => {
    localStorage.setItem('nortecreativo.session.v1', '{"accessToken": 5}');
    expect(new SessionStore().isAuthenticated()).toBe(false);
    localStorage.setItem('nortecreativo.session.v1', 'no es json');
    expect(new SessionStore().isAuthenticated()).toBe(false);
  });
});
