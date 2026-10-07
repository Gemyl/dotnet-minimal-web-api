import { Component, inject, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { AuthenticationService } from '../../services/authentication/authentication';
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
  protected loginForm = form(this.loginModel);
  private _auth = inject(AuthenticationService);
  private _router = inject(Router);

  public onLogin() {
    this._auth.login(this.loginModel()).subscribe(response => {
      if (response.accessToken) {
        this._router.navigate(['/products']);
      }
    });
  }

}
