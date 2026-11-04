import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PermisosRespuesta } from '../../core/models/auth';
import { Usuario, UsuarioPatch, UsuarioPayload } from '../../core/models/usuario';

// El backend envuelve cada respuesta en español ({ usuarios } / { usuario }); el servicio la desenvuelve.
@Service()
export class UsuarioApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/usuarios`;

  list(): Observable<Usuario[]> {
    return this.http.get<{ usuarios: Usuario[] }>(this.base).pipe(map((res) => res.usuarios));
  }

  get(id: number): Observable<Usuario> {
    return this.http.get<{ usuario: Usuario }>(`${this.base}/${id}`).pipe(map((res) => res.usuario));
  }

  // Permisos efectivos de cualquier usuario (cadena completa activa), con los roles que los conceden.
  permisos(id: number): Observable<PermisosRespuesta> {
    return this.http.get<PermisosRespuesta>(`${this.base}/${id}/permisos`);
  }

  create(payload: UsuarioPayload): Observable<Usuario> {
    return this.http.post<{ usuario: Usuario }>(this.base, payload).pipe(map((res) => res.usuario));
  }

  update(id: number, payload: UsuarioPatch): Observable<Usuario> {
    return this.http.patch<{ usuario: Usuario }>(`${this.base}/${id}`, payload).pipe(map((res) => res.usuario));
  }

  replace(id: number, payload: UsuarioPayload): Observable<Usuario> {
    return this.http.put<{ usuario: Usuario }>(`${this.base}/${id}`, payload).pipe(map((res) => res.usuario));
  }

  deactivate(id: number): Observable<Usuario> {
    return this.http.patch<{ usuario: Usuario }>(`${this.base}/${id}/deactivate`, {}).pipe(map((res) => res.usuario));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`).pipe(map(() => undefined));
  }
}
