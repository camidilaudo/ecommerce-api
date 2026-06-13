import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { selectIsAuthenticated, selectIsAdmin } from '../features/auth/authSelectors';

/**
 * AdminRoute — Guard para rutas exclusivas de administradores.
 *
 * Dos capas de protección:
 * 1. Sin sesión activa   → Redirige a /login (con state.from).
 * 2. Con sesión pero sin rol ADMIN → Redirige a / (home).
 * 3. Autenticado + ADMIN → Renderiza <Outlet />.
 *
 * Uso en App.jsx:
 *   <Route element={<AdminRoute />}>
 *     <Route path="/admin" element={<AdminPanel />} />
 *     <Route path="/admin/usuarios" element={<UsersPage />} />
 *   </Route>
 */
const AdminRoute = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isAdmin = useSelector(selectIsAdmin);
    const location = useLocation();

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
