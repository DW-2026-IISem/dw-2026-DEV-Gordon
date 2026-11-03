import { Component, computed, input, output } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';

@Component({
  imports: [PanelMenuModule],
  selector: 'app-aside',
  styleUrl: './aside.css',
  templateUrl: './aside.html',
})
export class Aside {
  readonly items = input.required<MenuItem[]>();
  readonly navigated = output<string>();

  // Solo las hojas emiten `navigated`; los grupos solo se expanden o se contraen.
  protected readonly model = computed<MenuItem[]>(() => this.withNavigation(this.items()));

  private withNavigation(items: MenuItem[]): MenuItem[] {
    return items.map((item) =>
      item.items?.length
        ? { ...item, items: this.withNavigation(item.items) }
        : { ...item, command: () => this.navigated.emit(item.label ?? '') },
    );
  }
}
