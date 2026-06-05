import { createSlice } from '@reduxjs/toolkit';

/**
 * authSlice — Estado global de autenticación.
 *
 * IMPORTANTE: Los reducers son completamente puros.
 * No existe ningún efecto secundario (localStorage, fetch, etc.) aquí.
 * La sincronización con localStorage ocurre en store.js via store.subscribe().
 *
 * Estado inicial: se hidrata desde localStorage en store.js (preloadedState).
 */
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: null,
        userRole: 'USER',
        usuarioNombre: '',
        userAvatar: null,
        isAuthenticated: false,
    },
    reducers: {
        /**
         * loginSuccess — Se dispara cuando el backend devuelve un JWT válido.
         * Payload esperado: { token, userRole, usuarioNombre, userAvatar }
         */
        loginSuccess(state, action) {
            const { token, userRole, usuarioNombre, userAvatar } = action.payload;
            state.token = token;
            state.userRole = userRole || 'USER';
            state.usuarioNombre = usuarioNombre || '';
            state.userAvatar = userAvatar || null;
            state.isAuthenticated = true;
        },

        /**
         * logout — Resetea completamente el estado de autenticación.
         * La limpieza de localStorage ocurre en store.subscribe().
         */
        logout(state) {
            state.token = null;
            state.userRole = 'USER';
            state.usuarioNombre = '';
            state.userAvatar = null;
            state.isAuthenticated = false;
        },

        /**
         * updateAvatar — Actualiza solo el avatar sin forzar un re-login.
         * Usado desde ProfilePage tras un PATCH exitoso al backend.
         * Payload: string con el nombre del archivo (ej: "avatar3.webp")
         */
        updateAvatar(state, action) {
            state.userAvatar = action.payload;
        },
    },
});

export const { loginSuccess, logout, updateAvatar } = authSlice.actions;
export default authSlice.reducer;
