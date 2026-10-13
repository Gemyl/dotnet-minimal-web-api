export interface LoginRequest {
    email: string,
    password: string,
    twoFactorCode?: string,
    twoFactorRecoverCode?: string
}

export interface SignupRequest {
    email: string,
    password: string,
    firstName: string,
    lastName: string
}

export interface TokenResponse {
    accessToken: string,
    expiresIn: number,
}

export interface AuthSession {
    accessToken: string,
    expiresAt: number
}

export interface RefreshResponse {
    accessToken: string,
    expiresIn: number
}

export enum AuthStatus {
    Pending = "Pending",
    Initializing = "Initializing",
    Authenticated = "Authenticated",
    Unauthenticated = "Unauthenticated"
}