import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const studentGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!authService.isLoggedIn()) {
    authService.clearAuthData();
    return router.createUrlTree(['/auth/login']);
  }

  if (authService.getStoredRole().toLowerCase() === 'student') {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
