// auth.interceptor.ts
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const token =
    localStorage.getItem('authToken') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('authToken') ||
    sessionStorage.getItem('token');

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

  return next(clonedRequest);
};
