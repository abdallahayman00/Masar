import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!authService.isLoggedIn()) {
    authService.clearAuthData();
    return router.createUrlTree(['/auth/login']);
  }

  if (authService.getStoredRole().toLowerCase() === 'admin') {
    return true;
  }

  // مسجل دخول لكن بدور مختلف -> رجّعه على لوحته
  return router.createUrlTree(['/dashboard']);
};
