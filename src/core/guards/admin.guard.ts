import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  const role = localStorage.getItem('role') || sessionStorage.getItem('role');

  if (role === 'Admin') {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
