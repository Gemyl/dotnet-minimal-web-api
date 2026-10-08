import { Component, inject, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { AuthService } from '../../../services/auth-service';
import { Router } from '@angular/router';

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

  login(): void {
    this._authService.login(this.loginModel())
    .subscribe({
      next: () => {
        if (this._authService._isAuthenticated()) {
          this._router.navigate(["/products"]);

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
