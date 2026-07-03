import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM STORAGE
//
// redux-persist/lib/storage no resuelve su default export correctamente
// en el contexto ESM de Vite. Se define el adapter manualmente usando
// window.localStorage directamente para garantizar compatibilidad.
// ─────────────────────────────────────────────────────────────────────────────
const storage = {
    getItem:    (key)        => Promise.resolve(window.localStorage.getItem(key)),
    setItem:    (key, value) => Promise.resolve(window.localStorage.setItem(key, value)),
    removeItem: (key)        => Promise.resolve(window.localStorage.removeItem(key)),
};

import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';
import favoritesReducer from '../features/favorites/favoritesSlice';
import productsReducer from '../features/products/productsSlice';
import ordersReducer from '../features/orders/ordersSlice';
import usersReducer from '../features/users/usersSlice';
import categoriesReducer from '../features/categories/categoriesSlice';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIONES DE PERSISTENCIA
//
// whitelist: solo las propiedades del slice que deben sobrevivir a un F5.
// Las propiedades de estado efímero (loading, error, profile) quedan fuera
// intencionalmente: se recalculan al volver a hacer las peticiones al backend.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * authPersistConfig — Persiste los datos esenciales de sesión.
 *
 * Incluye:  userRole, usuarioNombre, userAvatar, isAuthenticated.
 * Excluye:  token (ahora es una cookie HttpOnly gestionada por el browser),
 *           profile (se recarga con fetchProfileThunk en ProfilePage),
 *           loadingLogin, errorLogin, loadingRegister, errorRegister,
 *           loadingProfile, errorProfile.
 */
const authPersistConfig = {
    key: 'auth',
    storage,
    whitelist: ['userRole', 'usuarioNombre', 'userAvatar', 'isAuthenticated'],
};

/**
 * favoritesPersistConfig — Persiste los ítems favoritos del usuario.
 *
 * La limpieza al logout ocurre porque Navbar.jsx despacha clearFavorites()
 * antes del logout(), lo que vacía items en el store y redux-persist
 * sincroniza el estado vacío en localStorage automáticamente.
 */
const favoritesPersistConfig = {
    key: 'favorites',
    storage,
    whitelist: ['items'],
};

// cart NO se persiste: la fuente de verdad es el backend Spring Boot.
// Al cargar la app, AppInitializer despacha fetchCart() que recarga
// el carrito desde el servidor, evitando una caché desincronizada.

// products, orders, users, categories NO se persisten: son datos de catálogo
// que se re-fetchean al navegar a cada página.

// ─────────────────────────────────────────────────────────────────────────────
// ROOT REDUCER
// ─────────────────────────────────────────────────────────────────────────────
const rootReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer),
    cart: cartReducer,
    favorites: persistReducer(favoritesPersistConfig, favoritesReducer),
    products: productsReducer,
    orders: ordersReducer,
    users: usersReducer,
    categories: categoriesReducer,
});

// ─────────────────────────────────────────────────────────────────────────────
// STORE
//
// serializableCheck: se ignoran las action types internas de redux-persist
// para evitar advertencias de "non-serializable value" en consola.
// Estas acciones (FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER)
// son parte del ciclo de vida interno de redux-persist, no del negocio.
// ─────────────────────────────────────────────────────────────────────────────
export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

/**
 * persistor — Controla el ciclo de vida de la persistencia.
 * Exportado para ser consumido por <PersistGate> en main.jsx.
 */
export const persistor = persistStore(store);
