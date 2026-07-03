import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authFetch } from '../../utils/authFetch';

const API_BASE = '/api';

// ─────────────────────────────────────────────────────────────────────────────
// THUNKS — Autenticación
// ─────────────────────────────────────────────────────────────────────────────

/**
 * loginThunk — POST /api/auth/login
 *
 * Envía las credenciales al backend. El servidor responde con los datos
 * del usuario y setea el JWT como una cookie HttpOnly (no viene en el body).
 * El fulfilled handler guarda rol, nombre y avatar en el store.
 *
 * credentials: 'include' es necesario para que el browser acepte
 * la cookie Set-Cookie de la respuesta.
 *
 * Payload: { email, password }
 * Fulfills: { role, nombre, avatar, mensaje } (sin token — va en cookie)
 */
export const loginThunk = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
                credentials: 'include', // Acepta la cookie HttpOnly del Set-Cookie
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                return rejectWithValue(
                    errData.message || errData.error || 'Credenciales inválidas. Verificá tu email y contraseña.'
                );
            }
            return await response.json();
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

/**
 * registerThunk — POST /api/auth/register
 *
 * Migra el fetch directo de RegisterPage.jsx a Redux Toolkit.
 * El fulfilled no modifica el estado de auth (el registro no inicia sesión),
 * solo resuelve para que el componente pueda navegar a /login.
 *
 * Payload: { nombreUsuario, nombre, apellido, email, password, fechaNacimiento, sexo, avatar }
 */
export const registerThunk = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
                credentials: 'include',
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                return rejectWithValue(
                    errData.message || errData.error || `Error ${response.status}: no se pudo completar el registro.`
                );
            }
            return await response.json().catch(() => ({ success: true }));
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// THUNKS — Perfil de usuario
// ─────────────────────────────────────────────────────────────────────────────

/**
 * fetchProfileThunk — GET /api/usuarios/me
 *
 * Carga el perfil completo del usuario autenticado y lo guarda en auth.profile.
 * Usa authFetch → detecta 401 → dispatch logout → redirect /login.
 * ProfilePage lee auth.profile via useSelector(selectProfile).
 */
export const fetchProfileThunk = createAsyncThunk(
    'auth/fetchProfile',
    async (_, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        try {
            const response = await authFetch(
                `${API_BASE}/usuarios/me`,
                { headers: { 'Content-Type': 'application/json' } },
                thunkAPI
            );
            if (!response.ok) {
                return rejectWithValue('Error al cargar el perfil de usuario.');
            }
            return await response.json();
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

/**
 * updateAvatarThunk — PATCH /api/usuarios/me/avatar
 *
 * Actualiza el avatar en el backend y en Redux (auth.userAvatar + auth.profile.avatar).
 * Usa authFetch → detecta 401 → dispatch logout → redirect /login.
 *
 * Payload: string con el nombre del archivo (ej: "avatar3.webp")
 * Fulfills: el mismo string (para actualizar el store sin un segundo fetch)
 */
export const updateAvatarThunk = createAsyncThunk(
    'auth/updateAvatar',
    async (avatar, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        try {
            const response = await authFetch(
                `${API_BASE}/usuarios/me/avatar`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ avatar }),
                },
                thunkAPI
            );
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                return rejectWithValue(errData.message || 'Error al guardar el avatar.');
            }
            return avatar;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

/**
 * logoutThunk — POST /api/auth/logout
 *
 * Borra la cookie HttpOnly JWT en el servidor y limpia el estado de Redux.
 * Se despacha desde Navbar.jsx al hacer logout.
 */
export const logoutThunk = createAsyncThunk(
    'auth/logoutThunk',
    async (_, { dispatch }) => {
        try {
            await fetch(`${API_BASE}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (_) {
            // Falla silenciosamente — la cookie expirará sola
        }
        // Despachar la acción síncrona de logout para limpiar el state
        dispatch({ type: 'auth/logout' });
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * authSlice — Estado global de autenticación.
 *
 * NOTA: El JWT ya NO se almacena en el state de Redux.
 * Es gestionado como una cookie HttpOnly por el browser (protección XSS).
 *
 * Los reducers síncronos (loginSuccess, logout, updateAvatar) se mantienen
 * para compatibilidad con código existente.
 *
 * Los thunks (loginThunk, registerThunk, fetchProfileThunk, updateAvatarThunk)
 * gestionan su propio estado de loading/error via extraReducers.
 *
 * La sincronización con localStorage ocurre en store.js via redux-persist
 * (solo userRole, usuarioNombre, userAvatar, isAuthenticated — sin token).
 */
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        // ── Sesión activa ──────────────────────────────────────────────────
        // NOTA: token ya no vive en Redux — es una cookie HttpOnly
        userRole: 'USER',
        usuarioNombre: '',
        userAvatar: null,
        isAuthenticated: false,

        // ── Perfil completo (GET /api/usuarios/me) ─────────────────────────
        profile: null,
        loadingProfile: false,
        errorProfile: null,

        // ── Estados async de autenticación ─────────────────────────────────
        loadingLogin: false,
        errorLogin: null,
        loadingRegister: false,
        errorRegister: null,
    },
    reducers: {
        /**
         * loginSuccess — Reducer síncrono mantenido para compatibilidad.
         * Puede usarse cuando los datos de sesión llegan por un mecanismo externo al thunk.
         * Payload esperado: { userRole, usuarioNombre, userAvatar }
         */
        loginSuccess(state, action) {
            const { userRole, usuarioNombre, userAvatar } = action.payload;
            state.userRole = userRole || 'USER';
            state.usuarioNombre = usuarioNombre || '';
            state.userAvatar = userAvatar || null;
            state.isAuthenticated = true;
        },

        /**
         * logout — Resetea completamente el estado de autenticación.
         * La cookie JWT se borra desde el servidor via logoutThunk.
         * También se dispara desde authFetch via { type: 'auth/logout' }
         * cuando el servidor responde 401.
         */
        logout(state) {
            state.userRole = 'USER';
            state.usuarioNombre = '';
            state.userAvatar = null;
            state.isAuthenticated = false;
            state.profile = null;
            state.errorLogin = null;
            state.errorRegister = null;
        },

        /**
         * updateAvatar — Actualiza solo el avatar sin forzar un re-login.
         * Mantenido para compatibilidad. Preferir updateAvatarThunk para
         * sincronizar con el backend al mismo tiempo.
         * Payload: string con el nombre del archivo (ej: "avatar3.webp")
         */
        updateAvatar(state, action) {
            state.userAvatar = action.payload;
            if (state.profile) {
                state.profile = { ...state.profile, avatar: action.payload };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // ── loginThunk ────────────────────────────────────────────────
            .addCase(loginThunk.pending, (state) => {
                state.loadingLogin = true;
                state.errorLogin = null;
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                const { role, nombre, avatar } = action.payload;
                // NOTA: token NO se guarda — va como cookie HttpOnly
                state.userRole = role || 'USER';
                state.usuarioNombre = nombre || '';
                state.userAvatar = avatar || null;
                state.isAuthenticated = true;
                state.loadingLogin = false;
                state.errorLogin = null;
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.loadingLogin = false;
                state.errorLogin = action.payload || action.error.message;
            })

            // ── registerThunk ─────────────────────────────────────────────
            .addCase(registerThunk.pending, (state) => {
                state.loadingRegister = true;
                state.errorRegister = null;
            })
            .addCase(registerThunk.fulfilled, (state) => {
                state.loadingRegister = false;
                state.errorRegister = null;
            })
            .addCase(registerThunk.rejected, (state, action) => {
                state.loadingRegister = false;
                state.errorRegister = action.payload || action.error.message;
            })

            // ── fetchProfileThunk ─────────────────────────────────────────
            .addCase(fetchProfileThunk.pending, (state) => {
                state.loadingProfile = true;
                state.errorProfile = null;
            })
            .addCase(fetchProfileThunk.fulfilled, (state, action) => {
                state.profile = action.payload;
                state.loadingProfile = false;
            })
            .addCase(fetchProfileThunk.rejected, (state, action) => {
                state.loadingProfile = false;
                state.errorProfile = action.payload || action.error.message;
            })

            // ── updateAvatarThunk ─────────────────────────────────────────
            // No tiene pending/rejected propios: el componente gestiona el
            // estado del botón con useState(guardandoAvatar) y .unwrap().
            .addCase(updateAvatarThunk.fulfilled, (state, action) => {
                state.userAvatar = action.payload;
                if (state.profile) {
                    state.profile = { ...state.profile, avatar: action.payload };
                }
            });
    },
});

export const { loginSuccess, logout, updateAvatar } = authSlice.actions;
export default authSlice.reducer;
