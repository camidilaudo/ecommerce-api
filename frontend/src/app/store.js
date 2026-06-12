import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';
import favoritesReducer from '../features/favorites/favoritesSlice';
import productsReducer from '../features/products/productsSlice';

// ─────────────────────────────────────────────────────────────────────────────
// HIDRATACIÓN INICIAL (Tarea 4)
//
// Se lee localStorage UNA SOLA VEZ al iniciar la aplicación para construir
// el estado inicial del store. Después de esto, ningún componente ni reducer
// debe leer localStorage directamente.
//
// Flujo garantizado:
//   localStorage → preloadedState → store → useSelector → Componente
// ─────────────────────────────────────────────────────────────────────────────
const token = localStorage.getItem('token') || null;

const preloadedState = {
    auth: {
        token,
        userRole: localStorage.getItem('userRole') || 'USER',
        usuarioNombre: localStorage.getItem('usuarioNombre') || '',
        userAvatar: localStorage.getItem('userAvatar') || null,
        // isAuthenticated se deriva del token para garantizar coherencia
        isAuthenticated: !!token,
    },
    // cart NO se prehydrata aquí: se recarga desde el backend (fetchCart)
    // cuando AppInitializer detecta que hay un token activo.
    // favorites NO se prehydrata aquí: se carga en AppInitializer
    // una vez que se conoce el usuarioNombre del store.
};

// ─────────────────────────────────────────────────────────────────────────────
// STORE PRINCIPAL
//
// Preparado para futuras slices: agregar el reducer en el objeto `reducer`.
// ─────────────────────────────────────────────────────────────────────────────
export const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        favorites: favoritesReducer,
        products: productsReducer,
        // Futuras slices: orders, notifications, wishlist, dashboard...
    },
    preloadedState,
});

// ─────────────────────────────────────────────────────────────────────────────
// CAPA DE PERSISTENCIA DESACOPLADA (Ajuste #1 del plan)
//
// store.subscribe() es un efecto secundario FUERA de los reducers.
// Se ejecuta cada vez que el store cambia y sincroniza selectivamente
// el estado de auth con localStorage.
//
// Los reducers permanecen completamente puros.
// ─────────────────────────────────────────────────────────────────────────────
let previousToken = store.getState().auth.token;

store.subscribe(() => {
    const { auth, favorites } = store.getState();

    // ── Auth persistence ──────────────────────────────────────────────────
    if (auth.token) {
        localStorage.setItem('token', auth.token);
        localStorage.setItem('userRole', auth.userRole);
        localStorage.setItem('usuarioNombre', auth.usuarioNombre);

        if (auth.userAvatar) {
            localStorage.setItem('userAvatar', auth.userAvatar);
        } else {
            localStorage.removeItem('userAvatar');
        }
    } else {
        // Logout: eliminar todas las claves de sesión
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('usuarioNombre');
        localStorage.removeItem('userAvatar');
    }

    // ── Favorites persistence (por usuario, clave dinámica) ───────────────
    // Solo persiste si hay un usuario autenticado identificado por nombre.
    // Esto replica el comportamiento del FavoriteContext original.
    const storageKey = auth.isAuthenticated && auth.usuarioNombre
        ? `favorites_${auth.usuarioNombre}`
        : 'favorites_guest';

    localStorage.setItem(storageKey, JSON.stringify(favorites.items));

    // Si el usuario cerró sesión, también limpiamos la clave de invitado
    // para evitar que los datos del usuario anterior queden expuestos.
    if (!auth.token && previousToken) {
        localStorage.removeItem('favorites_guest');
    }

    previousToken = auth.token;
});
