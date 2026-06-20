import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './app/store';
import { selectIsAuthenticated } from './features/auth/authSelectors';
import { fetchCart } from './features/cart/cartThunks';
import { AccessibilityProvider } from './context/AccessibilityContext';
import './index.css';
import App from './App.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * AppInitializer — Componente interno que sincroniza el carrito
 * con el store Redux cuando cambia el estado de autenticación.
 *
 * Se ejecuta DENTRO del Provider de Redux y PersistGate para tener
 * acceso al store ya hidratado. No renderiza nada propio — es un efecto puro.
 *
 * Nota: la carga de favoritos fue eliminada de este componente porque
 * redux-persist los restaura automáticamente desde localStorage
 * al inicializar el store (via PersistGate). clearFavorites() en
 * Navbar.jsx sigue encargándose de limpiarlos al hacer logout.
 */
const AppInitializer = ({ children }) => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    // Recargar carrito desde el backend al cambiar de sesión.
    // fetchCart limpia el carrito local si no hay token activo.
    useEffect(() => {
        dispatch(fetchCart());
    }, [isAuthenticated, dispatch]);

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
         * 3. PersistGate — bloquea el renderizado hasta que redux-persist
         *    haya hidratado el store desde localStorage. Garantiza que al
         *    montar cualquier componente, el estado de auth ya esté disponible.
         *
         * 4. BrowserRouter — enrutamiento con React Router.
         *
         * 5. AppInitializer — efectos de sincronización post-login/logout.
         */}
        <AccessibilityProvider>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <BrowserRouter>
                        <AppInitializer>
                            <App />
                            <ToastContainer position="top-right" autoClose={4000} />
                        </AppInitializer>
                    </BrowserRouter>
                </PersistGate>
            </Provider>
        </AccessibilityProvider>
    </StrictMode>,
);