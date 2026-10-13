import { Component, inject, signal } from '@angular/core';
import { SignupRequest } from '../../../models/auth.model';
import { form, required, FormField } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-signup',
  imports: [FormField],
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

  handleSignup(): void{
    this._authService.signup(this.signupModel())
    .subscribe(
      (response) => {
        console.log(response);
        this._router.navigate(["/login"]);
      }
    )
  }
}
