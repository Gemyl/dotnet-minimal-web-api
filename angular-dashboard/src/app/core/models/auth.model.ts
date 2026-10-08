export interface LoginRequest {
    email: string,
    password: string,
    twoFactorCode?: string,
    twoFactorRecoverCode?: string
}

export interface TokenResponse {
    tokenType: string,
    accessToken: string,
    expiresIn: number,
    refreshToken: string
}

export interface AuthSession {
    accessToken: string,
    refreshToken: string,
    expiresAt: number
}