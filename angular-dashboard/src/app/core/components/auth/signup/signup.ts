import { Component, inject, signal } from '@angular/core';
import { SignupRequest } from '../../../models/auth.model';
import { form, required, FormField } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth-service';
import { FormWrapper } from '../../generic/wrappers/form-wrapper/form-wrapper';
import { ROUTES } from '../../../../app.routes';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../../services/toast-service';

@Component({
  selector: 'app-signup',
  imports: [FormField, FormWrapper],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  private signupModel = signal<SignupRequest>({
    email: "",
    password: "",
    firstName: "",
    lastName: ""
  });
  protected signupForm = form(this.signupModel, (f) => {
    required(f.email);
    required(f.password); 
  });
  private readonly _router = inject(Router);
  private readonly _authService = inject(AuthService);
  private readonly _routes = ROUTES;
  private readonly _toasts = inject(ToastService);
  protected errors = signal([]);

  handleSignup(): void{
    this._authService.signup(this.signupModel())
    .pipe(
      catchError((error) => {
        console.log('FAILED');
        this.errors.set(error.error?.map((e: {code: string, description: string}) => e?.description));
        console.log(this.errors());
        return throwError(() => error);
      })
    )
    .subscribe(
      () => {
        this._toasts.success("Registration successful.");
        this._router.navigate([this._routes.LOGIN]);
      }
    )
  }
}
