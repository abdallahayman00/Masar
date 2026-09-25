import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

// يمنع المستخدم المسجل دخول من فتح صفحات login/register
export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.isLoggedIn()) {
    return router.createUrlTree(['/dashboard']);
  }

  authService.clearAuthData();
  return true;
};
