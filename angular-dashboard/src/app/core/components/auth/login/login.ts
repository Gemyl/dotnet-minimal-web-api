import { Component, inject, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { AuthService } from '../../../services/auth-service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormWrapper } from '../../generic/wrappers/form-wrapper/form-wrapper';
import { ROUTES } from '../../../../app.routes';
import { ToastService } from '../../../services/toast-service';

@Component({
  selector: 'app-login',
  imports: [FormField, FormWrapper],
  templateUrl: './login.html',
  styleUrl: './login.css',
})

export class Login {
  protected loginModel = signal({
    email: '',
    password: ''
  });
  protected loginForm = form(this.loginModel, (f) => {
    required(f.email);
    required(f.password);
  });
  private _authService = inject(AuthService);
  protected readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  protected readonly _routes = ROUTES;
  protected readonly _toasts = inject(ToastService);

  login(): void {
    this._authService.login(this.loginModel())
    .subscribe({
      next: () => {
        if (this._authService._isAuthenticated()) {
          const returnUrl = this._route.snapshot.queryParamMap.get("returnUrl");

          const target = 
            returnUrl?.startsWith("/") &&
            !returnUrl.startsWith("//") &&
            !returnUrl.startsWith("/\\")
              ? returnUrl
              : this._routes.PRODUCTS;
               
          this._router.navigate([target]);

        } else {
          console.warn('Not authenticated');
        }
      },
      error: (err) => {
        if (err.status == 401) {
          this._toasts.error("Invalid credentials.")
        } else {
          this._toasts.error("An unknown error occured. Please, try again later.", 5000)
        }
      }
    })
  } 

}
