import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthSession, LoginRequest, TokenResponse } from '../models/auth.model';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _session = signal<AuthSession | null>(null);
  public readonly _isAuthenticated = computed(() => this._session() != null);
  private readonly _http = inject(HttpClient);
  private readonly _identityUrl = environment.IDENTITY_URL;

  public login(req: LoginRequest): Observable<TokenResponse>{
    return this._http.post<TokenResponse>(
      `${this._identityUrl}/login`,
      req
    ).pipe(
      tap((response) => {this.setSession(response)})
    )
  }

  public getAccessToken(): string | null {
    return this._session()?.accessToken ?? null;
  }

  private setSession(res: TokenResponse): void {
    const session: AuthSession = {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      expiresAt: Date.now() + res.expiresIn * 1000
    };

    this._session.set(session);
  }
}
