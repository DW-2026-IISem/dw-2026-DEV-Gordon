import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Aprobacion, AprobacionPayload, AprobacionResultado } from '../../core/models/aprobacion';

// Las aprobaciones son un registro inmutable: solo se listan, se consultan y se crean.
@Service()
export class AprobacionApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/aprobaciones`;

  list(): Observable<Aprobacion[]> {
    return this.http
      .get<{ aprobaciones: Aprobacion[] }>(this.base)
      .pipe(map((res) => res.aprobaciones));
  }

  get(id: number): Observable<Aprobacion> {
    return this.http
      .get<{ aprobacion: Aprobacion }>(`${this.base}/${id}`)
      .pipe(map((res) => res.aprobacion));
  }

  // Devuelve { aprobacion, hito_cerrado, hito_id, fecha_cierre }: no lleva sobre que desenvolver.
  create(payload: AprobacionPayload): Observable<AprobacionResultado> {
    return this.http.post<AprobacionResultado>(this.base, payload);
  }
}
