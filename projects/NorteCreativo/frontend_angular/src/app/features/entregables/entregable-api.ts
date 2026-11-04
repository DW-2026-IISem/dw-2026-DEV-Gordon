import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Entregable, EntregablePayload } from '../../core/models/entregable';

// El backend envuelve cada respuesta en español ({ entregables } / { entregable }); el servicio la desenvuelve.
@Service()
export class EntregableApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/entregables`;

  list(): Observable<Entregable[]> {
    return this.http
      .get<{ entregables: Entregable[] }>(this.base)
      .pipe(map((res) => res.entregables));
  }

  get(id: number): Observable<Entregable> {
    return this.http
      .get<{ entregable: Entregable }>(`${this.base}/${id}`)
      .pipe(map((res) => res.entregable));
  }

  create(payload: EntregablePayload): Observable<Entregable> {
    return this.http
      .post<{ entregable: Entregable }>(this.base, payload)
      .pipe(map((res) => res.entregable));
  }

  update(id: number, payload: Partial<EntregablePayload>): Observable<Entregable> {
    return this.http
      .patch<{ entregable: Entregable }>(`${this.base}/${id}`, payload)
      .pipe(map((res) => res.entregable));
  }

  replace(id: number, payload: EntregablePayload): Observable<Entregable> {
    return this.http
      .put<{ entregable: Entregable }>(`${this.base}/${id}`, payload)
      .pipe(map((res) => res.entregable));
  }

  deactivate(id: number): Observable<Entregable> {
    return this.http
      .patch<{ entregable: Entregable }>(`${this.base}/${id}/deactivate`, {})
      .pipe(map((res) => res.entregable));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`).pipe(map(() => undefined));
  }
}
