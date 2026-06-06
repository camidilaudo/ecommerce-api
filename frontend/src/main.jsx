import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './app/store';
import { selectIsAuthenticated, selectUsuarioNombre } from './features/auth/authSelectors';
import { loadFavorites } from './features/favorites/favoritesSlice';
import { fetchCart } from './features/cart/cartThunks';
import { AccessibilityProvider } from './context/AccessibilityContext';
import './index.css';
import App from './App.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * AppInitializer — Componente interno que sincroniza el carrito y favoritos
 * con el store Redux cuando cambia el estado de autenticación.
 *
 * Se ejecuta DENTRO del Provider de Redux para tener acceso al store.
 * No renderiza nada propio — es un efecto puro.
 */
const AppInitializer = ({ children }) => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const usuarioNombre = useSelector(selectUsuarioNombre);

    // DT-05: recargar carrito al cambiar sesión.
    // DT-04: fetchCart limpia el carrito local si no hay token.
    useEffect(() => {
        dispatch(fetchCart());
    }, [isAuthenticated, dispatch]);

    // Cargar favoritos del usuario activo desde localStorage.
    useEffect(() => {
        const storageKey = isAuthenticated && usuarioNombre
            ? `favorites_${usuarioNombre}`
            : 'favorites_guest';

        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                dispatch(loadFavorites(JSON.parse(stored)));
            } catch {
                dispatch(loadFavorites([]));
            }
        } else {
            dispatch(loadFavorites([]));
        }
    }, [isAuthenticated, usuarioNombre, dispatch]);

    return children;
};

createRoot(document.getElementById('root')).render(
    <StrictMode>
        {/*
         * Árbol de providers — orden de afuera hacia adentro:
         *
         * 1. AccessibilityProvider (Context API) — preferencias de UI (tema,
         *    fuente, contraste, movimiento). Independiente de Redux por diseño:
         *    representa configuración de interfaz, no estado de negocio.
         *
         * 2. Provider (Redux) — estado de negocio: auth, cart, favorites.
         *
         * 3. BrowserRouter — enrutamiento con React Router.
         *
         * 4. AppInitializer — efectos de sincronización post-login/logout.
         */}
        <AccessibilityProvider>
            <Provider store={store}>
                <BrowserRouter>
                    <AppInitializer>
                        <App />
                        <ToastContainer position="top-right" autoClose={4000} />
                    </AppInitializer>
                </BrowserRouter>
            </Provider>
        </AccessibilityProvider>
    </StrictMode>,
);