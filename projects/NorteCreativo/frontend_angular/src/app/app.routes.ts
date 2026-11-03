import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'construir',
    loadComponent: () => import('./features/construir/construir').then((m) => m.Construir),
  },
  { path: '', redirectTo: 'construir', pathMatch: 'full' },
  { path: '**', redirectTo: 'construir' },
];
