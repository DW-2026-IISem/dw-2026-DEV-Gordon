import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { AprobacionPayload } from '../../../core/models/aprobacion';
import { VersionEntregable } from '../../../core/models/version-entregable';
import { VersionEntregableApi } from '../../versiones/version-entregable-api';
import { AprobacionApi } from '../aprobacion-api';
import { AprobacionForm } from './aprobacion-form';

const version = (id: number, estado: VersionEntregable['estado']): VersionEntregable => ({
  id,
  entregable_id: 10 + id,
  numero_version: 1,
  fecha_inicio: null,
  fecha_fin: null,
  total: 1000,
  estado,
  observaciones: null,
  status: 'active',
  createdAt: '2026-09-30T00:00:00.000Z',
  updatedAt: '2026-09-30T00:00:00.000Z',
});

type Internals = {
  opciones: () => { id: number; etiqueta: string }[];
  versionId: { set: (v: number | null) => void; (): number | null };
  estado: { set: (v: 'APROBADA' | 'RECHAZADA') => void };
  comentario: { set: (v: string) => void };
};

describe('AprobacionForm', () => {
  const setup = async (query?: string) => {
    const enviados: AprobacionPayload[] = [];
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'aprobaciones', children: [] }]),
        MessageService,
        {
          provide: VersionEntregableApi,
          useValue: {
            list: () =>
              of([version(1, 'EN_REVISION'), version(2, 'APROBADA'), version(3, 'RECHAZADA')]),
          },
        },
        {
          provide: AprobacionApi,
          useValue: {
            create: (p: AprobacionPayload) => {
              enviados.push(p);
              return of({
                aprobacion: { estado: p.estado },
                hito_cerrado: false,
                hito_id: 1,
                fecha_cierre: null,
              });
            },
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(AprobacionForm);
    if (query) fixture.componentRef.setInput('version', query);
    await fixture.whenStable();
    const internals = fixture.componentInstance as unknown as Internals & { enviar: () => void };
    const host = fixture.nativeElement as HTMLElement;
    return { fixture, host, enviados, internals };
  };

  it('el select solo ofrece versiones EN_REVISION con etiqueta sin tareas', async () => {
    const { internals } = await setup();
    expect(internals.opciones().map((o) => o.etiqueta.replace(/\s/g, ' '))).toEqual([
      'Entregable #11 · v1 · $ 1.000',
    ]);
  });

  it('?version=<id> preselecciona la versión en revisión', async () => {
    const { internals } = await setup('1');
    expect(internals.versionId()).toBe(1);
  });

  it('RECHAZADA sin comentario no envía y muestra el error', async () => {
    const { fixture, host, enviados, internals } = await setup();
    internals.versionId.set(1);
    internals.estado.set('RECHAZADA');
    internals.enviar();
    await fixture.whenStable();
    expect(enviados).toHaveLength(0);
    expect(host.textContent).toContain('Explica por qué se rechaza');
  });

  it('el POST lleva solo version_entregable_id, estado y comentario (nunca aprobador_id)', async () => {
    const { enviados, internals } = await setup();
    internals.versionId.set(1);
    internals.estado.set('RECHAZADA');
    internals.comentario.set(' Falta el logo ');
    internals.enviar();
    expect(enviados).toEqual([
      { version_entregable_id: 1, estado: 'RECHAZADA', comentario: 'Falta el logo' },
    ]);
    expect('aprobador_id' in enviados[0]).toBe(false);
  });
});
