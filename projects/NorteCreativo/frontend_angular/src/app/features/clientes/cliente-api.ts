import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cliente, ClientePayload } from '../../core/models/cliente';

// El backend envuelve cada respuesta en español ({ clientes } / { cliente }); el servicio la desenvuelve.
@Service()
export class ClienteApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/clientes`;

  list(): Observable<Cliente[]> {
    return this.http.get<{ clientes: Cliente[] }>(this.base).pipe(map((res) => res.clientes));
  }

  get(id: number): Observable<Cliente> {
    return this.http.get<{ cliente: Cliente }>(`${this.base}/${id}`).pipe(map((res) => res.cliente));
  }

  create(payload: ClientePayload): Observable<Cliente> {
    return this.http.post<{ cliente: Cliente }>(this.base, payload).pipe(map((res) => res.cliente));
  }

  update(id: number, payload: Partial<ClientePayload>): Observable<Cliente> {
    return this.http.patch<{ cliente: Cliente }>(`${this.base}/${id}`, payload).pipe(map((res) => res.cliente));
  }

  replace(id: number, payload: ClientePayload): Observable<Cliente> {
    return this.http.put<{ cliente: Cliente }>(`${this.base}/${id}`, payload).pipe(map((res) => res.cliente));
  }

  deactivate(id: number): Observable<Cliente> {
    return this.http.patch<{ cliente: Cliente }>(`${this.base}/${id}/deactivate`, {}).pipe(map((res) => res.cliente));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`).pipe(map(() => undefined));
  }
}
