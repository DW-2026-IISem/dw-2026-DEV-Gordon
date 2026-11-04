import { TestBed } from '@angular/core/testing';
import { CampaniaPayload } from '../../../core/models/campania';
import { Cliente } from '../../../core/models/cliente';
import { CampaniaForm } from './campania-form';

const cliente = (id: number, nombre: string, status: 'active' | 'inactive'): Cliente => ({
  id,
  tipo_documento: 'NIT',
  numero_documento: `90${id}`,
  nombre,
  telefono: null,
  email: null,
  status,
  createdAt: '2026-09-30T00:00:00.000Z',
  updatedAt: '2026-09-30T00:00:00.000Z',
});

describe('CampaniaForm', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(CampaniaForm);
    fixture.componentRef.setInput('clientes', [
      cliente(1, 'Cliente Activo', 'active'),
      cliente(2, 'Cliente Inactivo', 'inactive'),
    ]);
    const emitidos: CampaniaPayload[] = [];
    fixture.componentInstance.saved.subscribe((payload) => emitidos.push(payload));
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const escribir = async (id: string, valor: string) => {
      const input = host.querySelector<HTMLInputElement>(`#${id}`);
      if (!input) throw new Error(`No existe #${id}`);
      input.value = valor;
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));
      await fixture.whenStable();
    };
    const enviar = async () => {
      host.querySelector('form')?.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { fixture, host, emitidos, escribir, enviar };
  };

  it('sin cliente ni nombre bloquea el envío y muestra los errores', async () => {
    const { host, emitidos, enviar } = await setup();
    await enviar();
    expect(emitidos).toHaveLength(0);
    expect(host.textContent).toContain('Elige un cliente.');
    expect(host.textContent).toContain('El nombre es obligatorio.');
  });

  it('el nombre no puede superar 120 caracteres', async () => {
    const { host, emitidos, escribir, enviar } = await setup();
    await escribir('campania-nombre', 'x'.repeat(121));
    await enviar();
    expect(emitidos).toHaveLength(0);
    expect(host.textContent).toContain('no puede superar 120 caracteres');
  });

  it('el select solo ofrece clientes activos', async () => {
    const { fixture } = await setup();
    const opciones = (
      fixture.componentInstance as unknown as { clientesActivos: () => Cliente[] }
    ).clientesActivos();
    expect(opciones.map((c) => c.nombre)).toEqual(['Cliente Activo']);
  });

  it('con datos válidos emite cliente_id numérico y no lleva status', async () => {
    const { fixture, emitidos, escribir, enviar } = await setup();
    const form = (
      fixture.componentInstance as unknown as {
        form: { controls: { cliente_id: { setValue: (v: number) => void } } };
      }
    ).form;
    form.controls.cliente_id.setValue(1);
    await escribir('campania-nombre', ' Lanzamiento ');
    await enviar();
    expect(emitidos).toEqual([{ cliente_id: 1, nombre: 'Lanzamiento', descripcion: null }]);
    expect(typeof emitidos[0].cliente_id).toBe('number');
    expect('status' in emitidos[0]).toBe(false);
  });
});
