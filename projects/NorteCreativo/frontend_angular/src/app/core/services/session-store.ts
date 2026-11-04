import { computed, Service, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Perfil, Permiso, SessionTokens } from '../models/auth';

const STORAGE_KEY = 'nortecreativo.session.v1';

interface PersistedSession {
  accessToken: string | null;
  refreshToken: string | null;
  usuario: Perfil | null;
  permisos: Permiso[];
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isPersisted = (value: unknown): value is PersistedSession =>
  isRecord(value) &&
  (value['accessToken'] === null || typeof value['accessToken'] === 'string') &&
  (value['refreshToken'] === null || typeof value['refreshToken'] === 'string') &&
  (value['usuario'] === null || (isRecord(value['usuario']) && Array.isArray(value['usuario']['roles']))) &&
  Array.isArray(value['permisos']);

// "/api/hitos/:id" -> /^\/api\/hitos\/[^/]+$/ ; cada ":param" cubre exactamente un segmento.
const toMatcher = (path: string): RegExp => {
  const source = normalizePath(path)
    .split('/')
    .map((segment) => (segment.startsWith(':') ? '[^/]+' : segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    .join('/');
  return new RegExp(`^${source}$`);
};

const normalizePath = (path: string): string => {
  const clean = path.split('?')[0].split('#')[0].trim();
  const withSlash = clean.startsWith('/') ? clean : `/${clean}`;
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : withSlash;
};

// Única fuente de verdad de la sesión. No depende de AuthService (llega en ISS-08).
@Service()
export class SessionStore {
  private readonly _accessToken = signal<string | null>(null);
  private readonly _refreshToken = signal<string | null>(null);
  private readonly _usuario = signal<Perfil | null>(null);
  private readonly _permisos = signal<Permiso[]>([]);

  readonly accessToken = this._accessToken.asReadonly();
  readonly refreshToken = this._refreshToken.asReadonly();
  readonly usuario = this._usuario.asReadonly();
  readonly permisos = this._permisos.asReadonly();

  readonly isAuthenticated = computed(() => this._accessToken() !== null);
  readonly roleNames = computed(() => this._usuario()?.roles.map((rol) => rol.name) ?? []);
  readonly permissionCount = computed(() => this._permisos().length);

  private readonly matchers = computed(() =>
    this._permisos().map((permiso) => ({ method: permiso.method.toUpperCase(), regex: toMatcher(permiso.path) })),
  );

  constructor() {
    this.restore();
  }

  setTokens(tokens: SessionTokens): void {
    this._accessToken.set(tokens.access_token);
    this._refreshToken.set(tokens.refresh_token);
    this.persist();
  }

  setAccess(perfil: Perfil, permisos: Permiso[]): void {
    this._usuario.set(perfil);
    this._permisos.set(permisos);
    this.persist();
  }

  clear(): void {
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this._usuario.set(null);
    this._permisos.set([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Sin localStorage (modo privado, bloqueado): la sesión vive solo en memoria.
    }
  }

  // Fase I (requireAuth false): todo se considera concedido.
  can(method: string, path: string): boolean {
    if (!environment.requireAuth) return true;
    const verb = method.toUpperCase();
    const target = normalizePath(path);
    return this.matchers().some((m) => m.method === verb && m.regex.test(target));
  }

  // Atajo: canPermission('GET /api/clientes').
  canPermission(permission: string): boolean {
    const [method, ...rest] = permission.trim().split(/\s+/);
    return this.can(method ?? '', rest.join(' '));
  }

  // true si la sesión tiene al menos uno de los permisos (para mostrar u ocultar una columna de acciones).
  canAny(permissions: readonly string[]): boolean {
    return permissions.some((permission) => this.canPermission(permission));
  }

  private persist(): void {
    const data: PersistedSession = {
      accessToken: this._accessToken(),
      refreshToken: this._refreshToken(),
      usuario: this._usuario(),
      permisos: this._permisos(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Sin localStorage: la sesión vive solo en memoria.
    }
  }

  private restore(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (!isPersisted(parsed)) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      this._accessToken.set(parsed.accessToken);
      this._refreshToken.set(parsed.refreshToken);
      this._usuario.set(parsed.usuario);
      this._permisos.set(parsed.permisos);
    } catch {
      // JSON dañado o localStorage no disponible: se arranca sin sesión.
    }
  }
}
