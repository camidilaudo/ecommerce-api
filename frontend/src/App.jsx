import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPanel from './pages/AdminPanel';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import ProductDetailPage from './pages/ProductDetailPage';
import Favorite from './pages/Favorite';
import UsersPage from './pages/UsersPage';

// Route guards
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';

// Layout
import CartSidebar from './components/CartSidebar';
import Navbar from './components/Navbar';

/**
 * App — Define el árbol de rutas con tres niveles de acceso:
 *
 * 🌐 Público        → accesible sin autenticación
 * 🔒 PrivateRoute   → requiere token (isAuthenticated = true)
 * 🛡️ AdminRoute     → requiere token + rol ADMIN
 *
 * La redirección preserva la URL intentada (state.from) para que
 * LoginPage pueda devolver al usuario a su destino post-login.
 */
function App() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="app-root">
            <Navbar onSearch={setSearchQuery} />
            <CartSidebar />
            <Routes>

                {/* ── Rutas Públicas ────────────────────────────────────── */}
                <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/productos/:id" element={<ProductDetailPage />} />
                <Route path="/favoritos" element={<Favorite />} />

                {/* ── Rutas Privadas (requieren sesión) ─────────────────── */}
                <Route element={<PrivateRoute />}>
                    <Route path="/perfil" element={<ProfilePage />} />
                    <Route path="/pedidos" element={<OrdersPage />} />
                </Route>

                {/* ── Rutas Admin (requieren sesión + rol ADMIN) ────────── */}
                <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/admin/usuarios" element={<UsersPage />} />
                </Route>

                {/* ── 404 ───────────────────────────────────────────────── */}
                <Route
                    path="*"
                    element={
                        <div style={{ padding: '100px', textAlign: 'center' }}>
                            Página no encontrada
                        </div>
                    }
                />

            </Routes>
        </div>
    );
}

export default App;