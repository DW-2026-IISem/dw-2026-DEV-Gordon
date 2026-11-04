import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';

// Se enruta en ISS-09 (guard de permisos); por ahora solo existe el componente.
@Component({
  imports: [RouterLink, PageHeader, EmptyState],
  selector: 'app-forbidden',
  styleUrl: './forbidden.css',
  templateUrl: './forbidden.html',
})
export class Forbidden {}
