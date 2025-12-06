import {jwtDecode} from "jwt-decode";

export const ACCESS_TOKEN_KEY = 'access_token';

export function getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function  isAuthenticated(): boolean {
    try {
        const token = getAccessToken();
        jwtDecode(token ?? '');
        return true
    }
    catch {
        clearAccessToken()
        return false;
    }
}

export function setAccessToken(token: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

// Remove access token from local storage when logged out
export function clearAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
}