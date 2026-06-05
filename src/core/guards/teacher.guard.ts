import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const teacherGuard: CanActivateFn = () => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (token && role === 'Teacher') {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};
