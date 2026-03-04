import { createContext, useContext, useState, ReactNode } from 'react';
import { User, LoginCredentials } from '@/types/user.types';
import * as authService from '@/services/api/authService';
import { saveToken, saveUser, getUser, clearAuth } from '@/services/storage/authStorage';
import { normalizeError } from '@/utils/errorHandler';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<User | null>;
    logout: () => void;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(getUser<User>());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function login(credentials: LoginCredentials): Promise<User | null> {
        setLoading(true);
        setError(null);
        try {
            const { accessToken, user: u } = await authService.login(credentials);
            saveToken(accessToken);
            saveUser(u);
            setUser(u);
            setLoading(false);
            return u;
        } catch (err) {
            const msg = normalizeError(err).message;
            setError(msg);
            setLoading(false);
            return null;
        }
    }

    function logout() {
        // fire and forget, if it fails we still clear local state
        authService.logout().catch(() => {});
        clearAuth();
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{ user, isAuthenticated: !!user, loading, login, logout, error }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('wrap your app in AuthProvider');
    return ctx;
}
