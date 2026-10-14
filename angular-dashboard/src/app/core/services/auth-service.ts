import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthSession, LoginRequest, TokenResponse, AuthStatus, RefreshResponse, SignupRequest } from '../models/auth.model';
import { HttpClient, HttpContext } from '@angular/common/http';
import { catchError, finalize, map, Observable, of, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { SKIP_AUTH } from '../helpers/auth.tokens';
import { ToastService } from './toast-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _session = signal<AuthSession | null>(null);
  public readonly _isAuthenticated = computed(() => this._session() != null);
  private refreshInFlight$: Observable<RefreshResponse> | null = null;
  private readonly _http = inject(HttpClient);
  private readonly _identityUrl = environment.IDENTITY_URL;
  private authStatus = signal<AuthStatus>(AuthStatus.Pending);
  private initializationInFlight$: Observable<boolean> | null = null;
  private initializationCompleted: boolean = false;
  private readonly _toasts = inject(ToastService);

  public signup(req: SignupRequest): Observable<any> {
    return this._http.post(
      `${this._identityUrl}/register-user`,
      req,
      {
        context: new HttpContext().set(SKIP_AUTH, false)
      }
    );
  }

  public login(req: LoginRequest): Observable<TokenResponse>{
    return this._http.post<TokenResponse>(
      `${this._identityUrl}/login`,
      req,
      {
        withCredentials: true,
        context: new HttpContext().set(SKIP_AUTH, true)
      }
    ).pipe(
      tap((response) => {
        this.setSession(response);
        this.authStatus.set(AuthStatus.Authenticated);
        this.initializationCompleted = true;
      })
    )
  }

  public logout(): Observable<null>{
    return this._http.post<null>(
      `${this._identityUrl}/logout`,
      {},
      {
        withCredentials: true,
        context: new HttpContext().set(SKIP_AUTH, true)
      }
    ).pipe(
      tap(() => {
        this.clearSession();
        this.authStatus.set(AuthStatus.Unauthenticated);
        this.initializationCompleted = true;
      })
    );
  }

  public getAccessToken(): string | null {
    return this._session()?.accessToken ?? null;
  }

  private setSession(res: TokenResponse): void {
    const session: AuthSession = {
      accessToken: res.accessToken,
      expiresAt: Date.now() + res.expiresIn * 1000
    };

    this._session.set(session);
  }

  clearSession(): void {
    this._session.set(null);
  }

  refreshAccessToken(): Observable<RefreshResponse> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$
    }

    const request$ = this._http.post<RefreshResponse>(
      `${this._identityUrl}/refresh`, 
      {}, 
      {
        withCredentials: true,
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

  initializeAuth(): Observable<boolean> {
    // case 1: initialization has been completed (return true or false)
    if (this.initializationCompleted) {
      return of(this.authStatus() == AuthStatus.Authenticated);
    }

    // case 2: initialization is on progress (return the same observable)
    if (this.initializationInFlight$) {
      return this.initializationInFlight$;
    }

    // case 3: making the first initialization attempt
    this.authStatus.set(AuthStatus.Initializing);

    const request$ = this.refreshAccessToken()
    .pipe(
      tap(() => {
        this.authStatus.set(AuthStatus.Authenticated);
      }),

      map(() => true),

      catchError(() => {
        this._toasts.error("Failed to refresh session.");
        this.clearSession();
        this.authStatus.set(AuthStatus.Unauthenticated);
        return of(false);
      }),

      finalize(() => {
        this.initializationCompleted = true;
        this.initializationInFlight$ = null;
      }),

      shareReplay({
        bufferSize: 1,
        refCount: false
      })
    );

    this.initializationInFlight$ = request$;
    return request$;
  }
}
