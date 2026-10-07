import { HttpInterceptorFn } from '@angular/common/http';
import { AuthenticationService } from '../../services/authentication/authentication';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const _auth = inject(AuthenticationService);
  const user = _auth.user();

  if (user.token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${user.token}`
      }
    });
  }

  return next(req);
};
