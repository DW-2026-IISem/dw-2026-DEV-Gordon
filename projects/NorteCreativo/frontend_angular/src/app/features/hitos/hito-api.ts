import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Hito, HitoPayload } from '../../core/models/hito';

// El backend envuelve cada respuesta en español ({ hitos } / { hito }); el servicio la desenvuelve.
@Service()
export class HitoApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/hitos`;

  list(): Observable<Hito[]> {
    return this.http.get<{ hitos: Hito[] }>(this.base).pipe(map((res) => res.hitos));
  }

  get(id: number): Observable<Hito> {
    return this.http.get<{ hito: Hito }>(`${this.base}/${id}`).pipe(map((res) => res.hito));
  }

  create(payload: HitoPayload): Observable<Hito> {
    return this.http.post<{ hito: Hito }>(this.base, payload).pipe(map((res) => res.hito));
  }

  update(id: number, payload: Partial<HitoPayload>): Observable<Hito> {
    return this.http.patch<{ hito: Hito }>(`${this.base}/${id}`, payload).pipe(map((res) => res.hito));
  }

  replace(id: number, payload: HitoPayload): Observable<Hito> {
    return this.http.put<{ hito: Hito }>(`${this.base}/${id}`, payload).pipe(map((res) => res.hito));
  }

  deactivate(id: number): Observable<Hito> {
    return this.http.patch<{ hito: Hito }>(`${this.base}/${id}/deactivate`, {}).pipe(map((res) => res.hito));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`).pipe(map(() => undefined));
  }
}
