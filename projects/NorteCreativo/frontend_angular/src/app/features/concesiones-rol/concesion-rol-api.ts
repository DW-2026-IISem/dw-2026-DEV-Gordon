import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ConcesionRol,
  ConcesionRolPayload,
  ConcesionRolFiltros,
} from '../../core/models/concesion-rol';

// Tabla puente del RBAC: se crean, se consultan, se desactivan y se reactivan (no se actualizan ni se borran).
@Service()
export class ConcesionRolApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/concesiones-rol`;

  list(filtros: ConcesionRolFiltros = {}): Observable<ConcesionRol[]> {
    let params = new HttpParams();
    if (filtros.role_id !== undefined) params = params.set('role_id', filtros.role_id);
    if (filtros.resource_id !== undefined) params = params.set('resource_id', filtros.resource_id);
    return this.http
      .get<{ concesiones: ConcesionRol[] }>(this.base, { params })
      .pipe(map((res) => res.concesiones));
  }

  get(id: number): Observable<ConcesionRol> {
    return this.http
      .get<{ concesion: ConcesionRol }>(`${this.base}/${id}`)
      .pipe(map((res) => res.concesion));
  }

  create(payload: ConcesionRolPayload): Observable<ConcesionRol> {
    return this.http
      .post<{ concesion: ConcesionRol }>(this.base, payload)
      .pipe(map((res) => res.concesion));
  }

  deactivate(id: number): Observable<ConcesionRol> {
    return this.http
      .patch<{ concesion: ConcesionRol }>(`${this.base}/${id}/deactivate`, {})
      .pipe(map((res) => res.concesion));
  }

  reactivate(id: number): Observable<ConcesionRol> {
    return this.http
      .patch<{ concesion: ConcesionRol }>(`${this.base}/${id}/reactivate`, {})
      .pipe(map((res) => res.concesion));
  }
}
