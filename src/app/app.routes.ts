import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },

  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('../features/auth/login/login/login.component').then(
            (m) => m.LoginComponent,
          ),
      },

      {
        path: 'register',
        loadComponent: () =>
          import('../features/auth/register/register/register.component').then(
            (m) => m.RegisterComponent,
          ),
      },

      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },

  {
    path: 'dashboard',

    // ✅ حماية الرووت
    canActivate: [authGuard],

    loadComponent: () =>
      import('../features/dashboard/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },

  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
