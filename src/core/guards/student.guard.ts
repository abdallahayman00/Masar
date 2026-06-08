import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const studentGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (token && role === 'Student') {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};
