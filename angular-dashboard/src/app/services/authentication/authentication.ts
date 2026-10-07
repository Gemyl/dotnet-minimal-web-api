import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { Session } from '../../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private _http = inject(HttpClient);
  private _router = inject(Router);
  public user = signal({token: ''});

  public login(credentials: {email: string, password: string}): Observable<Session> {
    return this._http.post<Session>(
      "http://localhost:5000/auth/login", 
      credentials
    ).pipe(
      tap(response => {
        this.user.set({token: response.accessToken})
      })
    );
  }

  public logout(): void {
    this.user.set({token: ''});
    this._router.navigate(['/login']);
  }
}
