import { createSlice } from '@reduxjs/toolkit';

/**
 * favoritesSlice — Estado global de productos favoritos.
 *
 * IMPORTANTE: Los reducers son completamente puros.
 * La persistencia en localStorage (por usuario) ocurre en store.js
 * mediante store.subscribe(), NO aquí.
 *
 * Mantiene el comportamiento del FavoriteContext original:
 * - Items aislados por usuario (clave dinámica en localStorage)
 * - Toggle: agrega si no existe, elimina si ya existe
 * - Se limpia al hacer logout
 */
const favoritesSlice = createSlice({
    name: 'favorites',
    initialState: {
        items: [],
    },
    reducers: {
        /**
         * loadFavorites — Carga los favoritos del usuario activo desde localStorage.
         * Dispatched por AppInitializer en main.jsx al detectar cambio de sesión.
         * Payload: array de productos favoritos.
         */
        loadFavorites(state, action) {
            state.items = action.payload;
        },

        /**
         * toggleFavorite — Agrega o elimina un producto de favoritos (Toggle).
         * Aprovecha Immer (incluido en RTK) para mutaciones seguras.
         * Payload: objeto producto completo.
         */
        toggleFavorite(state, action) {
            const product = action.payload;
            const existingIndex = state.items.findIndex((item) => item.id === product.id);

            if (existingIndex >= 0) {
                // Ya es favorito → remover
                state.items.splice(existingIndex, 1);
            } else {
                // No es favorito → agregar
                state.items.push(product);
            }
        },

        /**
         * clearFavorites — Limpia todos los favoritos del store.
         * Dispatched al hacer logout para aislar los favoritos por usuario.
         */
        clearFavorites(state) {
            state.items = [];
        },
    },
});

export const { loadFavorites, toggleFavorite, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
