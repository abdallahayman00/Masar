import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token =
    localStorage.getItem('token') || sessionStorage.getItem('token');

  // لو فيه توكن → اسمح بالدخول
  if (token) {
    return true;
  }

  // لو مفيش → رجعه للوجين
  router.navigate(['/auth/login']);

  return false;
};
