import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types/user.types';
import { ROUTES } from '@/constants/routes';

interface Props {
    allowedRoles?: Role[];
}

export default function RequireAuth({ allowedRoles }: Props) {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div>loading...</div>;

    if (!isAuthenticated || !user) {
        return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const dest = user.role === Role.AUTHOR ? ROUTES.AUTHOR_DASHBOARD : ROUTES.SOLVER_DASHBOARD;
        return <Navigate to={dest} replace />;
    }

    return <Outlet />;
}
