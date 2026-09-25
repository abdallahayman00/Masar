// auth.interceptor.ts
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token =
    localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) {
    return next(req);
  }

  const cleanToken = token.replace(/['"]+/g, '');

  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/json',
    },
  });

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // توكن مرفوض من السيرفر (منتهي/غير صالح) -> امسح الجلسة ورجّع على تسجيل الدخول
      if (error.status === 401) {
        authService.clearAuthData();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    }),
  );
};
