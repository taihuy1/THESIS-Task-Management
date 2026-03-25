import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import { Role } from '@/types/user.types';

interface LoginFormData {
    email: string;
    password: string;
}

export default function LoginPage() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>();
    const { login, loading, error } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data: LoginFormData) => {
        const user = await login(data);
        if (user) {
            navigate(user.role === Role.AUTHOR ? ROUTES.AUTHOR_DASHBOARD : ROUTES.SOLVER_DASHBOARD);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '80px auto', padding: '24px' }}>
            <h1 style={{ marginBottom: '8px' }}>Task Manager</h1>
            <p style={{ color: '#6b7280', marginTop: 0, marginBottom: '24px' }}>Sign in to continue</p>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{ marginBottom: '16px' }}>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        style={errors.email ? { borderColor: '#dc2626', borderWidth: '1.5px', borderStyle: 'solid' } : undefined}
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Enter a valid email address',
                            },
                        })}
                    />
                    {errors.email && (
                        <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '4px', marginBottom: 0 }}>
                            <span>*</span> {errors.email.message}
                        </p>
                    )}
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        style={errors.password ? { borderColor: '#dc2626', borderWidth: '1.5px', borderStyle: 'solid' } : undefined}
                        {...register('password', {
                            required: 'Password is required',
                            minLength: {
                                value: 6,
                                message: 'Password must be at least 6 characters',
                            },
                        })}
                    />
                    {errors.password && (
                        <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '4px', marginBottom: 0 }}>
                            <span>*</span> {errors.password.message}
                        </p>
                    )}
                </div>
                {error && <p style={{ color: '#b91c1c', fontSize: '14px' }}>{error}</p>}
                <button type="submit" disabled={loading} style={{ width: '100%' }}>
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>
        </div>
    );
}
