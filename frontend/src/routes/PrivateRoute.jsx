import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { selectIsAuthenticated } from '../features/auth/authSelectors';

/**
 * PrivateRoute — Guard para rutas que requieren sesión activa.
 *
 * Si el usuario NO está autenticado:
 *   → Redirige a /login preservando la ruta intentada en location.state.from
 *   → LoginPage la recupera para redirigir de vuelta post-login.
 *
 * Si el usuario SÍ está autenticado:
 *   → Renderiza <Outlet /> (el componente de ruta hijo).
 *
 * Uso en App.jsx:
 *   <Route element={<PrivateRoute />}>
 *     <Route path="/perfil" element={<ProfilePage />} />
 *     <Route path="/pedidos" element={<OrdersPage />} />
 *   </Route>
 */
const PrivateRoute = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
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

    return <Outlet />;
};

export default PrivateRoute;
