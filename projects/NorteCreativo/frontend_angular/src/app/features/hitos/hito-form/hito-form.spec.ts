import { TestBed } from '@angular/core/testing';
import { Campania } from '../../../core/models/campania';
import { HitoPayload } from '../../../core/models/hito';
import { HitoForm } from './hito-form';

const campania = (id: number, nombre: string, status: 'active' | 'inactive'): Campania => ({
  id,
  cliente_id: 1,
  nombre,
  descripcion: null,
  status,
  createdAt: '2026-09-30T00:00:00.000Z',
  updatedAt: '2026-09-30T00:00:00.000Z',
});

describe('HitoForm', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(HitoForm);
    fixture.componentRef.setInput('campanias', [
      campania(1, 'Activa', 'active'),
      campania(2, 'Inactiva', 'inactive'),
    ]);
    const emitidos: HitoPayload[] = [];
    fixture.componentInstance.saved.subscribe((payload) => emitidos.push(payload));
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const internals = fixture.componentInstance as unknown as {
      campaniasActivas: () => Campania[];
      form: { controls: Record<string, { setValue: (v: unknown) => void }> };
    };
    const enviar = async () => {
      host.querySelector('form')?.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { host, emitidos, internals, enviar };
  };

  it('sin campaña ni nombre bloquea el envío y muestra los errores', async () => {
    const { host, emitidos, enviar } = await setup();
    await enviar();
    expect(emitidos).toHaveLength(0);
    expect(host.textContent).toContain('Elige una campaña.');
    expect(host.textContent).toContain('El nombre es obligatorio.');
  });

  it('el select solo ofrece campañas activas', async () => {
    const { internals } = await setup();
    expect(internals.campaniasActivas().map((c) => c.nombre)).toEqual(['Activa']);
  });

  it('no tiene campo de estado ni de fecha de cierre', async () => {
    const { internals } = await setup();
    expect(Object.keys(internals.form.controls)).toEqual(['campania_id', 'nombre', 'descripcion']);
  });

  it('emite campania_id numérico y no lleva estado', async () => {
    const { emitidos, internals, enviar } = await setup();
    internals.form.controls['campania_id'].setValue(1);
    internals.form.controls['nombre'].setValue(' Primer hito ');
    await enviar();
    expect(emitidos).toEqual([{ campania_id: 1, nombre: 'Primer hito', descripcion: null }]);
    expect('estado' in emitidos[0]).toBe(false);
  });
});
