import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthSession, LoginRequest, TokenResponse } from '../models/auth.model';
import { HttpClient, HttpContext } from '@angular/common/http';
import { finalize, Observable, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { SKIP_AUTH } from '../helpers/auth.tokens';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _session = signal<AuthSession | null>(null);
  public readonly _isAuthenticated = computed(() => this._session() != null);
  private refreshInFlight$: Observable<TokenResponse> | null = null;
  private readonly _http = inject(HttpClient);
  private readonly _identityUrl = environment.IDENTITY_URL;

  public login(req: LoginRequest): Observable<TokenResponse>{
    return this._http.post<TokenResponse>(
      `${this._identityUrl}/login`,
      req,
      {
        context: new HttpContext().set(SKIP_AUTH, true)
      }
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

  clearSession(): void {
    this._session.set(null);
  }

  refreshAccessToken(): Observable<TokenResponse> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$
    }

    const refreshToken = this._session()?.refreshToken;

    if (!refreshToken) {
      return throwError(() => new Error("No refresh token available!"));
    }

    const request$ = this._http.post<TokenResponse>(
      `${this._identityUrl}/refresh`, 
      {refreshToken}, 
      {
        context: new HttpContext().set(SKIP_AUTH, true)
      }
    ).pipe(
      tap((response) => this.setSession(response)),
      finalize(() => this.refreshInFlight$ = null),
      shareReplay({
        bufferSize: 1,
        refCount: false
      })
    );

    this.refreshInFlight$ = request$;

    return request$;
  }
}
