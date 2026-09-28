import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [],
  providers: [Router],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})

export class Navbar {
  protected router = inject(Router);
}
