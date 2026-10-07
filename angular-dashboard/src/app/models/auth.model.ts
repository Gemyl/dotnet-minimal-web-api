export interface Session {
    tokenType: string,
    accessToken: string,
    refreshToken: string,
    expiresIn: number
}

export interface User {
    userId: string,
    email: string,
    firstName: string,
    lastName: string,
    session: Session
}