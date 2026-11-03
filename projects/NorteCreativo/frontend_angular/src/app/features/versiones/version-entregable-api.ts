import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VersionEntregable, VersionEntregablePayload } from '../../core/models/version-entregable';

// El backend envuelve cada respuesta en español ({ versiones } / { version }); el servicio la desenvuelve.
@Service()
export class VersionEntregableApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/version-entregables`;

  list(): Observable<VersionEntregable[]> {
    return this.http.get<{ versiones: VersionEntregable[] }>(this.base).pipe(map((res) => res.versiones));
  }

  get(id: number): Observable<VersionEntregable> {
    return this.http.get<{ version: VersionEntregable }>(`${this.base}/${id}`).pipe(map((res) => res.version));
  }

  create(payload: VersionEntregablePayload): Observable<VersionEntregable> {
    return this.http.post<{ version: VersionEntregable }>(this.base, payload).pipe(map((res) => res.version));
  }

  update(id: number, payload: Partial<VersionEntregablePayload>): Observable<VersionEntregable> {
    return this.http.patch<{ version: VersionEntregable }>(`${this.base}/${id}`, payload).pipe(map((res) => res.version));
  }

  replace(id: number, payload: VersionEntregablePayload): Observable<VersionEntregable> {
    return this.http.put<{ version: VersionEntregable }>(`${this.base}/${id}`, payload).pipe(map((res) => res.version));
  }

  deactivate(id: number): Observable<VersionEntregable> {
    return this.http.patch<{ version: VersionEntregable }>(`${this.base}/${id}/deactivate`, {}).pipe(map((res) => res.version));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`).pipe(map(() => undefined));
  }
}
