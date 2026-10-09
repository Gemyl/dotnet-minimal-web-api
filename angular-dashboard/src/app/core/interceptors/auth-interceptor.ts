import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service';
import { AUTH_RETRIED, SKIP_AUTH } from '../helpers/auth.tokens';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (req.context.get(SKIP_AUTH)) {
    return next(req);
  }

  const accessToken = authService.getAccessToken();

  const authenticatedRequest = accessToken
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    : req;

  return next(authenticatedRequest).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      // if first refresh attempt failed
      if (req.context.get(AUTH_RETRIED)) {
        authService.clearSession();
        return throwError(() => error);
      }

      return authService.refreshAccessToken().pipe(
        switchMap(() => {
          const newAccessToken = authService.getAccessToken();

          if (!newAccessToken) {  
            authService.clearSession();
            return throwError(() => error);
          }

          const retryRequest = req.clone({
            context: req.context.set(AUTH_RETRIED, true),

            setHeaders: {
              Authorization: `Bearer ${newAccessToken}`,
            },
          });

          return next(retryRequest);
        }),

        catchError((refreshError: unknown) => {
          if (
            refreshError instanceof HttpErrorResponse &&
            (refreshError.status === 400 ||
              refreshError.status === 401 ||
              refreshError.status === 403)
          ) {
            authService.clearSession();
          }

          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
