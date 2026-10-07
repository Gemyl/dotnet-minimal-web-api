import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthenticationService } from '../../services/authentication/authentication';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const _auth = inject(AuthenticationService);
  const _router = inject(Router);

  if (_auth.user().token) {
    return true;
  }

  return _router.createUrlTree(['/login']);
};
