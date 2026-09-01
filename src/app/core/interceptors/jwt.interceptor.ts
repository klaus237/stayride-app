import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap, catchError, throwError } from 'rxjs';
import { TokenService } from '../auth/token.service';
import { Router } from '@angular/router';

const isPublicUrl = (url: string, method: string): boolean => {
  const alwaysPublic = [
    'auth/login',
    'auth/register',
    'auth/refresh',
    'auth/forgot-password',
    'auth/reset-password',
    'auth/verify-email',
    'platform/settings',
  ];
  if (alwaysPublic.some((pub) => url.includes(pub))) return true;

  // GET sur properties et cars est public SAUF routes admin
  if (
    method === 'GET' &&
    (url.includes('/properties') || url.includes('/cars'))
  ) {
    if (url.includes('admin/all') || url.includes('/admin/')) return false;
    return true;
  }

  return false;
};

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn,
) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (isPublicUrl(req.url, req.method)) {
    return next(req);
  }

  return from(tokenService.getAccessToken()).pipe(
    switchMap((token) => {
      const authReq = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;
      return next(authReq);
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        tokenService.clearTokens();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    }),
  );
};
