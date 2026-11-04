import { TestBed } from '@angular/core/testing';
import { VersionEntregablePayload } from '../../../core/models/version-entregable';
import { VersionForm } from './version-form';

type Controls = Record<string, { setValue: (v: unknown) => void }>;

describe('VersionForm', () => {
  const setup = async () => {
    const fixture = TestBed.createComponent(VersionForm);
    fixture.componentRef.setInput('entregableId', 9);
    const emitidos: VersionEntregablePayload[] = [];
    fixture.componentInstance.saved.subscribe((p) => emitidos.push(p));
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const internals = fixture.componentInstance as unknown as { form: { controls: Controls } };
    const enviar = async () => {
      host.querySelector('form')?.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { host, emitidos, internals, enviar };
  };

  it('no tiene campos de numero_version ni de estado', async () => {
    const { internals } = await setup();
    expect(Object.keys(internals.form.controls)).toEqual(['fecha_inicio', 'fecha_fin', 'total', 'observaciones']);
  });

  it('emite el entregable fijo sin numero_version, estado ni status', async () => {
    const { emitidos, enviar } = await setup();
    await enviar();
    expect(emitidos).toHaveLength(1);
    expect(emitidos[0].entregable_id).toBe(9);
    for (const campo of ['numero_version', 'estado', 'status']) expect(campo in emitidos[0]).toBe(false);
  });

  it('con total negativo bloquea el envío', async () => {
    const { host, emitidos, internals, enviar } = await setup();
    internals.form.controls['total'].setValue(-1);
    await enviar();
    expect(emitidos).toHaveLength(0);
    expect(host.textContent).toContain('El total no puede ser negativo.');
  });

  it('con fin anterior a inicio bloquea el envío', async () => {
    const { emitidos, internals, enviar } = await setup();
    internals.form.controls['fecha_inicio'].setValue(new Date('2026-10-10'));
    internals.form.controls['fecha_fin'].setValue(new Date('2026-10-01'));
    await enviar();
    expect(emitidos).toHaveLength(0);
  });
});
