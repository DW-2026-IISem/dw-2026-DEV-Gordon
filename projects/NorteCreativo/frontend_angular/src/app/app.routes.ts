import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'construir',
    loadComponent: () => import('./features/construir/construir').then((m) => m.Construir),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'campanias',
        loadComponent: () => import('./features/campanias/campania-list/campania-list').then((m) => m.CampaniaList),
      },
      {
        path: 'clientes',
        loadComponent: () => import('./features/clientes/cliente-list/cliente-list').then((m) => m.ClienteList),
      },
      {
        path: 'entregables',
        loadComponent: () => import('./features/entregables/entregable-list/entregable-list').then((m) => m.EntregableList),
      },
      {
        path: 'entregables/:id',
        loadComponent: () => import('./features/entregables/entregable-detail/entregable-detail').then((m) => m.EntregableDetail),
      },
      {
        path: 'versiones',
        loadComponent: () => import('./features/versiones/version-list/version-list').then((m) => m.VersionList),
      },
      {
        path: 'hitos',
        loadComponent: () => import('./features/hitos/hito-list/hito-list').then((m) => m.HitoList),
      },
      {
        path: 'tareas',
        loadComponent: () => import('./features/tareas/tarea-list/tarea-list').then((m) => m.TareaList),
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
