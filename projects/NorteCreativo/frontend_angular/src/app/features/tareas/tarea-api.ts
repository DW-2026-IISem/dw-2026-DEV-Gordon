import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Tarea, TareaPayload } from '../../core/models/tarea';

// El backend envuelve cada respuesta en español ({ tareas } / { tarea }); el servicio la desenvuelve.
@Service()
export class TareaApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/tareas`;

  list(): Observable<Tarea[]> {
    return this.http.get<{ tareas: Tarea[] }>(this.base).pipe(map((res) => res.tareas));
  }

  get(id: number): Observable<Tarea> {
    return this.http.get<{ tarea: Tarea }>(`${this.base}/${id}`).pipe(map((res) => res.tarea));
  }

  create(payload: TareaPayload): Observable<Tarea> {
    return this.http.post<{ tarea: Tarea }>(this.base, payload).pipe(map((res) => res.tarea));
  }

  update(id: number, payload: Partial<TareaPayload>): Observable<Tarea> {
    return this.http
      .patch<{ tarea: Tarea }>(`${this.base}/${id}`, payload)
      .pipe(map((res) => res.tarea));
  }

  replace(id: number, payload: TareaPayload): Observable<Tarea> {
    return this.http
      .put<{ tarea: Tarea }>(`${this.base}/${id}`, payload)
      .pipe(map((res) => res.tarea));
  }

  deactivate(id: number): Observable<Tarea> {
    return this.http
      .patch<{ tarea: Tarea }>(`${this.base}/${id}/deactivate`, {})
      .pipe(map((res) => res.tarea));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`).pipe(map(() => undefined));
  }
}
