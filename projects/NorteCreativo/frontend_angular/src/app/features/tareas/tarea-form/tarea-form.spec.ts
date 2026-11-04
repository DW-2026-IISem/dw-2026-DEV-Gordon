import { TestBed } from '@angular/core/testing';
import { Hito } from '../../../core/models/hito';
import { TareaPayload } from '../../../core/models/tarea';
import { TareaForm } from './tarea-form';

const hito = (id: number, nombre: string, status: 'active' | 'inactive'): Hito => ({
  id,
  campania_id: 7,
  nombre,
  descripcion: null,
  estado: 'ABIERTO',
  fecha_cierre: null,
  status,
  createdAt: '2026-09-30T00:00:00.000Z',
  updatedAt: '2026-09-30T00:00:00.000Z',
});

describe('TareaForm', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(TareaForm);
    fixture.componentRef.setInput('hitos', [
      hito(1, 'Brief', 'active'),
      hito(2, 'Viejo', 'inactive'),
    ]);
    fixture.componentRef.setInput('campaniasPorId', new Map([[7, 'Carnaval']]));
    const emitidos: TareaPayload[] = [];
    fixture.componentInstance.saved.subscribe((payload) => emitidos.push(payload));
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const internals = fixture.componentInstance as unknown as {
      hitosActivos: () => { id: number; etiqueta: string }[];
      form: { controls: Record<string, { setValue: (v: unknown) => void }> };
    };
    const enviar = async () => {
      host.querySelector('form')?.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { host, emitidos, internals, enviar };
  };

  it('sin hito ni nombre bloquea el envío', async () => {
    const { host, emitidos, enviar } = await setup();
    await enviar();
    expect(emitidos).toHaveLength(0);
    expect(host.textContent).toContain('Elige un hito.');
  });

  it('ofrece solo hitos activos con la etiqueta «Campaña · Hito»', async () => {
    const { internals } = await setup();
    expect(internals.hitosActivos()).toEqual([{ id: 1, etiqueta: 'Carnaval · Brief' }]);
  });

  it('emite hito_id numérico con el nombre recortado', async () => {
    const { emitidos, internals, enviar } = await setup();
    internals.form.controls['hito_id'].setValue(1);
    internals.form.controls['nombre'].setValue(' Redactar ');
    await enviar();
    expect(emitidos).toEqual([{ hito_id: 1, nombre: 'Redactar', descripcion: null }]);
  });
});
