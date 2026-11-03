import { Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  imports: [ButtonModule],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  protected readonly title = 'Norte Creativo';
  readonly menuRequested = output<void>();
}
