import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import {
  catchError,
  finalize,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { Perfil, PermisosRespuesta, SessionTokens } from '../models/auth';
import { SessionStore } from './session-store';

// Contrato real: login/refresh devuelven solo tokens; el perfil y los permisos se piden aparte.
@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionStore);
  private readonly base = environment.apiUrl;

  // Guarda los tokens y completa el acceso (perfil + permisos) antes de entregar el perfil.
  login(identifier: string, password: string): Observable<Perfil> {
    return this.http
      .post<SessionTokens>(`${this.base}/sesion/login`, { identifier, password })
      .pipe(
        tap((tokens) => this.session.setTokens(tokens)),
        switchMap(() => this.me()),
      );
  }

  // Perfil y permisos en paralelo; si falla, la sesión no queda a medias.
  me(): Observable<Perfil> {
    return forkJoin({
      perfil: this.http
        .get<{ usuario: Perfil }>(`${this.base}/sesion/perfil`)
        .pipe(map((res) => res.usuario)),
      permisos: this.http
        .get<PermisosRespuesta>(`${this.base}/permisos`)
        .pipe(map((res) => res.permisos)),
    }).pipe(
      tap(({ perfil, permisos }) => this.session.setAccess(perfil, permisos)),
      map(({ perfil }) => perfil),
      catchError((err: unknown) => {
        this.session.clear();
        return throwError(() => err);
      }),
    );
  }

  // Refresh rotativo: el par anterior deja de servir, se guarda el nuevo.
  refresh(): Observable<SessionTokens> {
    const refreshToken = this.session.refreshToken();
    if (!refreshToken) return throwError(() => new Error('No hay refresh token.'));
    return this.http
      .post<SessionTokens>(`${this.base}/sesion/refresh`, { refresh_token: refreshToken })
      .pipe(tap((tokens) => this.session.setTokens(tokens)));
  }

  // Avisa al backend, ignora su error y limpia siempre la sesión local.
  logout(): Observable<void> {
    const refreshToken = this.session.refreshToken();
    const request: Observable<unknown> = refreshToken
      ? this.http.post(`${this.base}/sesion/logout`, { refresh_token: refreshToken })
      : of(null);
    return request.pipe(
      catchError(() => of(null)),
      map(() => undefined),
      finalize(() => this.session.clear()),
    );
  }
}
