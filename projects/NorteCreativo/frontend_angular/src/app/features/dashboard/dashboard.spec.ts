import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AprobacionApi } from '../aprobaciones/aprobacion-api';
import { CampaniaApi } from '../campanias/campania-api';
import { ClienteApi } from '../clientes/cliente-api';
import { HitoApi } from '../hitos/hito-api';
import { VersionEntregableApi } from '../versiones/version-entregable-api';
import { environment } from '../../../environments/environment';
import { Dashboard } from './dashboard';

const hito = (id: number, estado: string) => ({ id, estado, status: 'active' });
const version = (id: number, estado: string, createdAt: string) => ({ id, entregable_id: id, numero_version: 1, total: 10, estado, createdAt });
const aprobacion = (id: number, fecha: string) => ({ id, version_entregable_id: 1, estado: 'APROBADA', fecha });

type Internals = {
  resumen: () => Record<string, number>;
  pendientes: () => { id: number }[];
  ultimasAprobaciones: () => { id: number }[];
};

describe('Dashboard', () => {
  const original = environment.requireAuth;
  beforeEach(() => (environment.requireAuth = false));
  afterEach(() => (environment.requireAuth = original));

  const setup = async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ClienteApi, useValue: { list: () => of([{ id: 1, status: 'active' }, { id: 2, status: 'active' }]) } },
        { provide: CampaniaApi, useValue: { list: () => of([{ id: 1, status: 'active' }]) } },
        { provide: HitoApi, useValue: { list: () => of([hito(1, 'ABIERTO'), hito(2, 'ABIERTO'), hito(3, 'CERRADO'), hito(4, 'FACTURADO')]) } },
        {
          provide: VersionEntregableApi,
          useValue: {
            list: () =>
              of([
                version(1, 'EN_REVISION', '2026-01-03'),
                version(2, 'EN_REVISION', '2026-01-01'),
                version(3, 'APROBADA', '2026-01-02'),
                ...[4, 5, 6, 7, 8].map((i) => version(i, 'EN_REVISION', `2026-02-0${i - 3}`)),
              ]),
          },
        },
        { provide: AprobacionApi, useValue: { list: () => of([1, 2, 3, 4, 5, 6, 7].map((i) => aprobacion(i, `2026-03-0${i}`))) } },
      ],
    });
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    return fixture.componentInstance as unknown as Internals;
  };

  it('los KPIs se calculan a partir de los listados', async () => {
    const d = await setup();
    expect(d.resumen()).toEqual({
      clientes_activos: 2,
      campanias_activas: 1,
      hitos_abiertos: 2,
      hitos_cerrados: 1,
      versiones_en_revision: 7,
    });
  });

  it('pendientes: las 5 en revisión más antiguas', async () => {
    const d = await setup();
    expect(d.pendientes().map((v) => v.id)).toEqual([2, 1, 4, 5, 6]);
  });

  it('últimas aprobaciones: las 5 más recientes', async () => {
    const d = await setup();
    expect(d.ultimasAprobaciones().map((a) => a.id)).toEqual([7, 6, 5, 4, 3]);
  });
});
