import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminOrTeacherGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!authService.isLoggedIn()) {
    authService.clearAuthData();
    return router.createUrlTree(['/auth/login']);
  }

  const role = authService.getStoredRole().toLowerCase();
  if (role === 'admin' || role === 'teacher') {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
