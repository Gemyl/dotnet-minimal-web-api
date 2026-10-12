import { Component, inject, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { AuthService } from '../../../services/auth-service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormField],
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
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);

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
              : "/products";
               
          this._router.navigate([target]);

        } else {
          console.warn('Not authenticated');
        }
      },
      error: (err) => {
        console.error("Login Failed", err);
      }
    })
  } 

}
