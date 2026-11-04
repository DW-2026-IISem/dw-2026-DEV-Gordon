import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Recurso, RecursoPayload } from '../../core/models/recurso';

// El backend envuelve cada respuesta en español ({ recursos } / { recurso }); el servicio la desenvuelve.
@Service()
export class RecursoApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/recursos`;

  list(): Observable<Recurso[]> {
    return this.http.get<{ recursos: Recurso[] }>(this.base).pipe(map((res) => res.recursos));
  }

  get(id: number): Observable<Recurso> {
    return this.http
      .get<{ recurso: Recurso }>(`${this.base}/${id}`)
      .pipe(map((res) => res.recurso));
  }

  create(payload: RecursoPayload): Observable<Recurso> {
    return this.http.post<{ recurso: Recurso }>(this.base, payload).pipe(map((res) => res.recurso));
  }

  update(id: number, payload: Partial<RecursoPayload>): Observable<Recurso> {
    return this.http
      .patch<{ recurso: Recurso }>(`${this.base}/${id}`, payload)
      .pipe(map((res) => res.recurso));
  }

  replace(id: number, payload: RecursoPayload): Observable<Recurso> {
    return this.http
      .put<{ recurso: Recurso }>(`${this.base}/${id}`, payload)
      .pipe(map((res) => res.recurso));
  }

  deactivate(id: number): Observable<Recurso> {
    return this.http
      .patch<{ recurso: Recurso }>(`${this.base}/${id}/deactivate`, {})
      .pipe(map((res) => res.recurso));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`).pipe(map(() => undefined));
  }
}
