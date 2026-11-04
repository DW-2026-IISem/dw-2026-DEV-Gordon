import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AsignacionRol, AsignacionRolPayload } from '../../core/models/asignacion-rol';

// Tabla puente del RBAC: se crean, se consultan, se desactivan y se reactivan (no se actualizan ni se borran).
@Service()
export class AsignacionRolApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/asignaciones-rol`;

  list(): Observable<AsignacionRol[]> {
    return this.http
      .get<{ asignaciones: AsignacionRol[] }>(this.base)
      .pipe(map((res) => res.asignaciones));
  }

  get(id: number): Observable<AsignacionRol> {
    return this.http
      .get<{ asignacion: AsignacionRol }>(`${this.base}/${id}`)
      .pipe(map((res) => res.asignacion));
  }

  create(payload: AsignacionRolPayload): Observable<AsignacionRol> {
    return this.http
      .post<{ asignacion: AsignacionRol }>(this.base, payload)
      .pipe(map((res) => res.asignacion));
  }

  deactivate(id: number): Observable<AsignacionRol> {
    return this.http
      .patch<{ asignacion: AsignacionRol }>(`${this.base}/${id}/deactivate`, {})
      .pipe(map((res) => res.asignacion));
  }

  reactivate(id: number): Observable<AsignacionRol> {
    return this.http
      .patch<{ asignacion: AsignacionRol }>(`${this.base}/${id}/reactivate`, {})
      .pipe(map((res) => res.asignacion));
  }
}
