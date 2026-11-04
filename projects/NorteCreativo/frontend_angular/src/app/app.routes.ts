import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';
import { permissionGuard } from './core/guards/permission-guard';

export const routes: Routes = [
  {
    path: 'construir',
    loadComponent: () => import('./features/construir/construir').then((m) => m.Construir),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'forbidden',
        loadComponent: () => import('./features/auth/forbidden/forbidden').then((m) => m.Forbidden),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/auth/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'campanias',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/campanias' },
        loadComponent: () => import('./features/campanias/campania-list/campania-list').then((m) => m.CampaniaList),
      },
      {
        path: 'clientes',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/clientes' },
        loadComponent: () => import('./features/clientes/cliente-list/cliente-list').then((m) => m.ClienteList),
      },
      {
        path: 'aprobaciones',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/aprobaciones' },
        loadComponent: () => import('./features/aprobaciones/aprobacion-list/aprobacion-list').then((m) => m.AprobacionList),
      },
      {
        path: 'aprobaciones/nueva',
        canActivate: [permissionGuard],
        data: { permission: 'POST /api/aprobaciones' },
        loadComponent: () => import('./features/aprobaciones/aprobacion-form/aprobacion-form').then((m) => m.AprobacionForm),
      },
      {
        path: 'entregables',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/entregables' },
        loadComponent: () => import('./features/entregables/entregable-list/entregable-list').then((m) => m.EntregableList),
      },
      {
        path: 'entregables/:id',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/entregables/:id' },
        loadComponent: () => import('./features/entregables/entregable-detail/entregable-detail').then((m) => m.EntregableDetail),
      },
      {
        path: 'versiones',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/version-entregables' },
        loadComponent: () => import('./features/versiones/version-list/version-list').then((m) => m.VersionList),
      },
      {
        path: 'hitos',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/hitos' },
        loadComponent: () => import('./features/hitos/hito-list/hito-list').then((m) => m.HitoList),
      },
      {
        path: 'tareas',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/tareas' },
        loadComponent: () => import('./features/tareas/tarea-list/tarea-list').then((m) => m.TareaList),
      },
      {
        path: 'admin/usuarios',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/usuarios' },
        loadComponent: () => import('./features/admin/usuarios/usuario-list/usuario-list').then((m) => m.UsuarioList),
      },
      {
        path: 'admin/roles',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/roles' },
        loadComponent: () => import('./features/admin/roles/rol-list/rol-list').then((m) => m.RolList),
      },
      {
        path: 'admin/recursos',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/recursos' },
        loadComponent: () => import('./features/admin/recursos/recurso-list/recurso-list').then((m) => m.RecursoList),
      },
      {
        path: 'admin/asignaciones',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/asignaciones-rol' },
        loadComponent: () => import('./features/admin/asignaciones/asignacion-list/asignacion-list').then((m) => m.AsignacionList),
      },
      {
        path: 'admin/permisos',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/concesiones-rol' },
        loadComponent: () => import('./features/admin/concesiones/concesion-list/concesion-list').then((m) => m.ConcesionList),
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
