import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Usuario, UsuarioPatch, UsuarioPayload } from '../../../../core/models/usuario';
import { UsuarioForm } from './usuario-form';

describe('UsuarioForm', () => {
  let fixture: ComponentFixture<UsuarioForm>;
  let emitted: (UsuarioPayload | UsuarioPatch)[];

  const submit = () =>
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
  const setValue = (id: string, value: string) => {
    const input = fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UsuarioForm] }).compileComponents();
    fixture = TestBed.createComponent(UsuarioForm);
    emitted = [];
    fixture.componentInstance.saved.subscribe((v) => emitted.push(v));
    fixture.detectChanges();
  });

  it('al crear envía username, email, password y status', () => {
    setValue('usuario-username', 'prueba_front');
    setValue('usuario-email', 'prueba@example.com');
    const form = (fixture.componentInstance as unknown as { form: UsuarioForm['form'] }).form;
    form.controls.password.setValue('Clave12345');
    submit();
    expect(emitted).toEqual([
      {
        username: 'prueba_front',
        email: 'prueba@example.com',
        password: 'Clave12345',
        status: 'active',
      },
    ]);
  });

  it('al crear sin contraseña no emite', () => {
    setValue('usuario-username', 'x');
    setValue('usuario-email', 'x@example.com');
    submit();
    expect(emitted).toEqual([]);
  });

  it('al editar solo envía username y email (sin password ni status)', async () => {
    const usuario: Usuario = {
      id: 9,
      username: 'ana',
      email: 'ana@example.com',
      status: 'active',
      createdAt: '',
      updatedAt: '',
    };
    fixture.componentRef.setInput('usuario', usuario);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    submit();
    expect(emitted).toEqual([{ username: 'ana', email: 'ana@example.com' }]);
  });
});
