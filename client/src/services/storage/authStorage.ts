const TK = 'auth_token';
const UK = 'auth_user';

export const saveToken = (t: string) => localStorage.setItem(TK, t);
export const getToken = () => localStorage.getItem(TK);

export function saveUser(user: object) {
    localStorage.setItem(UK, JSON.stringify(user));
}

export function getUser<T>(): T | null {
    const raw = localStorage.getItem(UK);
    return raw ? JSON.parse(raw) : null;
}

export function clearAuth() {
    localStorage.removeItem(TK);
    localStorage.removeItem(UK);
}
