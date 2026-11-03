import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Rol, RolPayload } from '../../core/models/rol';

// El backend envuelve cada respuesta en español ({ roles } / { rol }); el servicio la desenvuelve.
@Service()
export class RolApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/roles`;

  list(): Observable<Rol[]> {
    return this.http.get<{ roles: Rol[] }>(this.base).pipe(map((res) => res.roles));
  }

  get(id: number): Observable<Rol> {
    return this.http.get<{ rol: Rol }>(`${this.base}/${id}`).pipe(map((res) => res.rol));
  }

  create(payload: RolPayload): Observable<Rol> {
    return this.http.post<{ rol: Rol }>(this.base, payload).pipe(map((res) => res.rol));
  }

  update(id: number, payload: Partial<RolPayload>): Observable<Rol> {
    return this.http.patch<{ rol: Rol }>(`${this.base}/${id}`, payload).pipe(map((res) => res.rol));
  }

  replace(id: number, payload: RolPayload): Observable<Rol> {
    return this.http.put<{ rol: Rol }>(`${this.base}/${id}`, payload).pipe(map((res) => res.rol));
  }

  deactivate(id: number): Observable<Rol> {
    return this.http.patch<{ rol: Rol }>(`${this.base}/${id}/deactivate`, {}).pipe(map((res) => res.rol));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`).pipe(map(() => undefined));
  }
}
