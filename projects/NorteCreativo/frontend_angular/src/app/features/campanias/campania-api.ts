import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Campania, CampaniaPayload } from '../../core/models/campania';

// El backend envuelve cada respuesta en español ({ campanias } / { campania }); el servicio la desenvuelve.
@Service()
export class CampaniaApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/campanias`;

  list(): Observable<Campania[]> {
    return this.http.get<{ campanias: Campania[] }>(this.base).pipe(map((res) => res.campanias));
  }

  get(id: number): Observable<Campania> {
    return this.http.get<{ campania: Campania }>(`${this.base}/${id}`).pipe(map((res) => res.campania));
  }

  create(payload: CampaniaPayload): Observable<Campania> {
    return this.http.post<{ campania: Campania }>(this.base, payload).pipe(map((res) => res.campania));
  }

  update(id: number, payload: Partial<CampaniaPayload>): Observable<Campania> {
    return this.http.patch<{ campania: Campania }>(`${this.base}/${id}`, payload).pipe(map((res) => res.campania));
  }

  replace(id: number, payload: CampaniaPayload): Observable<Campania> {
    return this.http.put<{ campania: Campania }>(`${this.base}/${id}`, payload).pipe(map((res) => res.campania));
  }

  deactivate(id: number): Observable<Campania> {
    return this.http.patch<{ campania: Campania }>(`${this.base}/${id}/deactivate`, {}).pipe(map((res) => res.campania));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`).pipe(map(() => undefined));
  }
}
