import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { SessionStore } from '../../core/services/session-store';

// *appHasPermission="'POST /api/clientes'": muestra el bloque solo si la sesión tiene ese permiso.
// El flag `rendered` hace idempotente al effect: no duplica ni borra la vista sin necesidad.
@Directive({ selector: '[appHasPermission]' })
export class HasPermission {
  private readonly template = inject(TemplateRef<unknown>);
  private readonly container = inject(ViewContainerRef);
  private readonly session = inject(SessionStore);

  readonly appHasPermission = input.required<string>();

  private rendered = false;

  constructor() {
    effect(() => {
      const allowed = this.session.canPermission(this.appHasPermission());
      if (allowed && !this.rendered) {
        this.container.createEmbeddedView(this.template);
        this.rendered = true;
      } else if (!allowed && this.rendered) {
        this.container.clear();
        this.rendered = false;
      }
    });
  }
}
