import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth-service';
import { ROUTES } from '../../../../../app.routes';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})

export class Navbar {
  protected router = inject(Router);
  protected authService = inject(AuthService);
  protected readonly _routes = ROUTES;

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate([this._routes.LOGIN]);
    });
  }
}
