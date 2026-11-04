import { TestBed } from '@angular/core/testing';
import { EntregablePayload } from '../../../core/models/entregable';
import { Tarea } from '../../../core/models/tarea';
import { EntregableForm } from './entregable-form';

const tarea = (id: number, nombre: string, status: 'active' | 'inactive'): Tarea => ({
  id,
  hito_id: 5,
  nombre,
  descripcion: null,
  status,
  createdAt: '2026-09-30T00:00:00.000Z',
  updatedAt: '2026-09-30T00:00:00.000Z',
});

type Controls = Record<string, { setValue: (v: unknown) => void }>;

describe('EntregableForm', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(EntregableForm);
    fixture.componentRef.setInput('tareas', [
      tarea(1, 'Brief', 'active'),
      tarea(2, 'Vieja', 'inactive'),
    ]);
    fixture.componentRef.setInput('hitosPorId', new Map([[5, 'Redes']]));
    const emitidos: EntregablePayload[] = [];
    fixture.componentInstance.saved.subscribe((p) => emitidos.push(p));
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const internals = fixture.componentInstance as unknown as {
      tareasActivas: () => { id: number; etiqueta: string }[];
      form: { controls: Controls };
    };
    const enviar = async () => {
      host.querySelector('form')?.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { host, emitidos, internals, enviar };
  };

  it('sin tarea bloquea el envío', async () => {
    const { host, emitidos, enviar } = await setup();
    await enviar();
    expect(emitidos).toHaveLength(0);
    expect(host.textContent).toContain('Elige una tarea.');
  });

  it('ofrece solo tareas activas con la etiqueta «Hito · Tarea»', async () => {
    const { internals } = await setup();
    expect(internals.tareasActivas()).toEqual([{ id: 1, etiqueta: 'Redes · Brief' }]);
  });

  it('con fecha de fin anterior a la de inicio bloquea el envío', async () => {
    const { host, emitidos, internals, enviar } = await setup();
    internals.form.controls['tarea_id'].setValue(1);
    internals.form.controls['fecha_inicio'].setValue(new Date('2026-10-10'));
    internals.form.controls['fecha_fin'].setValue(new Date('2026-10-01'));
    await enviar();
    expect(emitidos).toHaveLength(0);
    expect(host.textContent).toContain('no puede ser anterior');
  });

  it('con total negativo bloquea el envío', async () => {
    const { host, emitidos, internals, enviar } = await setup();
    internals.form.controls['tarea_id'].setValue(1);
    internals.form.controls['total'].setValue(-5);
    await enviar();
    expect(emitidos).toHaveLength(0);
    expect(host.textContent).toContain('El total no puede ser negativo.');
  });

  it('emite tarea_id y total numéricos', async () => {
    const { emitidos, internals, enviar } = await setup();
    internals.form.controls['tarea_id'].setValue(1);
    internals.form.controls['total'].setValue('1500' as unknown as number);
    await enviar();
    expect(emitidos).toHaveLength(1);
    expect(emitidos[0].tarea_id).toBe(1);
    expect(emitidos[0].total).toBe(1500);
    expect(typeof emitidos[0].total).toBe('number');
    expect(emitidos[0].estado).toBe('EN_PROCESO');
  });
});
