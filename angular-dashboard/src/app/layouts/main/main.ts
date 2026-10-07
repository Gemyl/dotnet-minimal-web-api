import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../components/shared/navbar/navbar/navbar';

@Component({
  selector: 'app-main',
  imports: [RouterOutlet, Navbar],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main {}
