import { TestBed } from '@angular/core/testing';
import { ClientePayload } from '../../../core/models/cliente';
import { ClienteForm } from './cliente-form';

describe('ClienteForm', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(ClienteForm);
    const emitidos: ClientePayload[] = [];
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

  it('con campos vacíos bloquea el envío y muestra los errores', async () => {
    const { host, emitidos, enviar } = await setup();
    await enviar();
    expect(emitidos).toHaveLength(0);
    expect(host.textContent).toContain('El número de documento es obligatorio.');
    expect(host.textContent).toContain('El nombre es obligatorio.');
    expect(host.textContent).toContain('El correo es obligatorio.');
  });

  it('con un email inválido bloquea el envío', async () => {
    const { host, emitidos, escribir, enviar } = await setup();
    await escribir('cliente-numero', '900123456');
    await escribir('cliente-nombre', 'Cliente demo');
    await escribir('cliente-email', 'sin-arroba');
    await enviar();
    expect(emitidos).toHaveLength(0);
    expect(host.textContent).toContain('Escribe un correo válido');
  });

  it('con datos válidos emite el payload sin status y con teléfono null si está vacío', async () => {
    const { emitidos, escribir, enviar } = await setup();
    await escribir('cliente-numero', ' 900123456 ');
    await escribir('cliente-nombre', 'Cliente demo');
    await escribir('cliente-email', 'demo@empresa.com');
    await enviar();
    expect(emitidos).toEqual([
      { tipo_documento: 'CC', numero_documento: '900123456', nombre: 'Cliente demo', telefono: null, email: 'demo@empresa.com' },
    ]);
    expect('status' in emitidos[0]).toBe(false);
  });
});
