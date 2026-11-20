import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

// Lazy loading : le code de chaque page n'est téléchargé qu'à la première visite.
export const routes: Routes = [
  { path: '', redirectTo: 'tasks', pathMatch: 'full' },
  {
    path: 'tasks',
    title: 'Mes tâches · TaskFlow',
    loadComponent: () => import('./pages/task-list/task-list').then((m) => m.TaskList),
  },
  {
    path: 'tasks/new',
    title: 'Nouvelle tâche · TaskFlow',
    loadComponent: () => import('./pages/task-editor/task-editor').then((m) => m.TaskEditor),
  },
  {
    path: 'tasks/:id',
    title: 'Détail · TaskFlow',
    loadComponent: () => import('./pages/task-detail/task-detail').then((m) => m.TaskDetail),
  },
  {
    path: 'tasks/:id/edit',
    title: 'Modifier · TaskFlow',
    loadComponent: () => import('./pages/task-editor/task-editor').then((m) => m.TaskEditor),
  },
  {
    path: 'login',
    title: 'Connexion · TaskFlow',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'admin',
    title: 'Administration · TaskFlow',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/admin').then((m) => m.Admin),
  },
  // '**' capte les URL inconnues : toujours en dernier
  {
    path: '**',
    title: 'Page introuvable · TaskFlow',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
