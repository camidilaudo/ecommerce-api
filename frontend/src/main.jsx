import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './app/store';
import { selectIsAuthenticated, selectUsuarioNombre } from './features/auth/authSelectors';
import { loadFavorites } from './features/favorites/favoritesSlice';
import { fetchCart } from './features/cart/cartThunks';
import './index.css';
import App from './App.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * AppInitializer — Componente interno que reemplaza la lógica reactiva
 * de CartContext y FavoriteContext que dependía del token/usuario.
 *
 * Responsabilidades:
 * 1. Cargar el carrito desde el backend cuando el usuario inicia/cierra sesión (DT-05 fix).
 * 2. Cargar los favoritos desde localStorage cuando cambia el usuario activo.
 *
 * Se ejecuta DENTRO del Provider para tener acceso al store.
 * No renderiza nada propio — es un efecto puro.
 */
const AppInitializer = ({ children }) => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const usuarioNombre = useSelector(selectUsuarioNombre);

    // DT-05 fix: recargar carrito cuando cambia el estado de autenticación.
    // DT-04 fix: si el usuario cierra sesión (isAuthenticated = false),
    //            fetchCart detecta la ausencia de token y limpia el carrito local.
    useEffect(() => {
        dispatch(fetchCart());
    }, [isAuthenticated, dispatch]);

    // Cargar favoritos desde localStorage cuando cambia el usuario activo.
    // Replica el useEffect([usuarioNombre, isAuthenticated]) del FavoriteContext original.
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
         * Provider reemplaza a AuthProvider + FavoriteProvider + CartProvider.
         * Un solo Provider expone el store global a toda la aplicación.
         */}
        <Provider store={store}>
            <BrowserRouter>
                <AppInitializer>
                    <App />
                    <ToastContainer position="top-right" autoClose={4000} />
                </AppInitializer>
            </BrowserRouter>
        </Provider>
    </StrictMode>,
);