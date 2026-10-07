import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../../services/authentication/authentication';

@Component({
  selector: 'app-navbar',
  imports: [],
  providers: [Router],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})

export class Navbar {
  protected router = inject(Router);
  private _auth = inject(AuthenticationService);

  logout() {
    this._auth.logout();
  }
}
