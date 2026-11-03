import { TestBed } from '@angular/core/testing';
import { StatusTag } from './status-tag';

describe('StatusTag', () => {
  it('cambia de color cuando cambia su input', async () => {
    const fixture = TestBed.createComponent(StatusTag);
    const host = fixture.nativeElement as HTMLElement;

    fixture.componentRef.setInput('value', 'active');
    await fixture.whenStable();
    expect(host.querySelector('.p-tag')?.classList.contains('p-tag-success')).toBe(true);
    expect(host.textContent).toContain('Activo');

    fixture.componentRef.setInput('value', 'inactive');
    await fixture.whenStable();
    expect(host.querySelector('.p-tag')?.classList.contains('p-tag-success')).toBe(false);
    expect(host.querySelector('.p-tag')?.classList.contains('p-tag-secondary')).toBe(true);
    expect(host.textContent).toContain('Inactivo');
  });

  it('pinta los estados del dominio', async () => {
    const fixture = TestBed.createComponent(StatusTag);
    const host = fixture.nativeElement as HTMLElement;

    fixture.componentRef.setInput('value', 'RECHAZADA');
    await fixture.whenStable();
    expect(host.querySelector('.p-tag')?.classList.contains('p-tag-danger')).toBe(true);
  });
});
