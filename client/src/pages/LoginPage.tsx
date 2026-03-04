import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import { Role } from '@/types/user.types';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const user = await login({ email, password });
        if (user) {
            navigate(user.role === Role.AUTHOR ? ROUTES.AUTHOR_DASHBOARD : ROUTES.SOLVER_DASHBOARD);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '80px auto', padding: '24px' }}>
            <h1 style={{ marginBottom: '8px' }}>Task Manager</h1>
            <p style={{ color: '#6b7280', marginTop: 0, marginBottom: '24px' }}>Sign in to continue</p>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p style={{ color: '#b91c1c', fontSize: '14px' }}>{error}</p>}
                <button type="submit" disabled={loading} style={{ width: '100%' }}>
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>
        </div>
    );
}
