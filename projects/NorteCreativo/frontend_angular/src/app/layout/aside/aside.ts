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

  protected readonly model = computed<MenuItem[]>(() =>
    this.items().map((item) => ({ ...item, command: () => this.navigated.emit(item.label ?? '') })),
  );
}
