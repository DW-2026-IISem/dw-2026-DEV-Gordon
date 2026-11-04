import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SessionStore } from '../services/session-store';
import { authGuard } from './auth-guard';

describe('authGuard', () => {
  const original = environment.requireAuth;
  const state = { url: '/dashboard' } as RouterStateSnapshot;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });
  afterEach(() => {
    environment.requireAuth = original;
    localStorage.clear();
  });

  const run = () => TestBed.runInInjectionContext(() => authGuard({} as never, state));

  it('sin sesión redirige a /login con returnUrl', () => {
    environment.requireAuth = true;
    const result = run() as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/login?returnUrl=%2Fdashboard');
  });

  it('con sesión deja pasar', () => {
    environment.requireAuth = true;
    TestBed.inject(SessionStore).setTokens({
      access_token: 'a',
      token_type: 'Bearer',
      expires_in: 1,
      refresh_token: 'r',
      refresh_expires_in: 1,
    });
    expect(run()).toBe(true);
  });

  it('con requireAuth false deja pasar sin sesión', () => {
    environment.requireAuth = false;
    expect(run()).toBe(true);
  });
});
