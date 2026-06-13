import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authFetch } from '../../utils/authFetch';

const API_BASE = 'http://localhost:8081';

// ─────────────────────────────────────────────────────────────────────────────
// THUNKS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * fetchUsers — GET /api/usuarios
 *
 * Carga la lista de usuarios registrados (solo ADMIN).
 * Acepta un string de búsqueda opcional que se pasa como query param.
 * Usa authFetch → detecta 401 → dispatch logout → redirect /login.
 *
 * @param {string} [search=''] — Término de búsqueda opcional
 */
export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (search = '', thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        const url = search.trim()
            ? `${API_BASE}/api/usuarios?search=${encodeURIComponent(search.trim())}`
            : `${API_BASE}/api/usuarios`;

        try {
            const response = await authFetch(url, {}, thunkAPI);
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                return rejectWithValue(
                    errData.message || errData.error || 'No se pudo cargar la lista de usuarios.'
                );
            }
            return await response.json();
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

/**
 * toggleUserActive — PATCH /api/usuarios/{id}/toggle-activo
 *
 * Bloquea o desbloquea la cuenta de un usuario.
 * Después de un toggle exitoso, actualiza el usuario en el array local
 * del store sin refetch completo (optimistic-like update via immer).
 * Usa authFetch → detecta 401 → dispatch logout → redirect /login.
 *
 * @param {object} usuario — Objeto completo del usuario a togglear
 */
export const toggleUserActive = createAsyncThunk(
    'users/toggleUserActive',
    async (usuario, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        try {
            const response = await authFetch(
                `${API_BASE}/api/usuarios/${usuario.id}/toggle-activo`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ activo: !usuario.activo }),
                },
                thunkAPI
            );
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                return rejectWithValue(
                    errData.message || errData.error || 'No se pudo cambiar el estado del usuario.'
                );
            }
            // Retornar el id del usuario para que extraReducer actualice
            // el array de forma eficiente sin un segundo fetch
            return { id: usuario.id, nuevoActivo: !usuario.activo };
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

/**
 * fetchAdminStats — GET /api/admin/stats
 *
 * Carga las estadísticas globales del panel de administración.
 * Se centraliza aquí (en usersSlice) por las siguientes razones:
 *
 * 1. ELIMINA EL FETCH DUPLICADO: tanto AdminPanel como UsersPage llamaban
 *    a /api/admin/stats por separado. Ahora ambos leen del mismo slice.
 * 2. COLOCALIDAD: las stats son métricas de usuarios (totalUsers, totalActivos,
 *    totalBloqueados, totalAdmins, totalClientes) — pertenecen al módulo users.
 * 3. EFICIENCIA: un único dispatch compartido en lugar de dos instancias
 *    de fetch independientes.
 *
 * Falla silenciosamente (no corta el flujo si el endpoint no responde):
 * las stats son no críticas — si no llegan, las KPI cards simplemente
 * no se renderizan.
 */
export const fetchAdminStats = createAsyncThunk(
    'users/fetchAdminStats',
    async (_, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        try {
            const response = await authFetch(
                `${API_BASE}/api/admin/stats`,
                {},
                thunkAPI
            );
            if (!response.ok) {
                return rejectWithValue('Error al cargar estadísticas');
            }
            return await response.json();
        } catch (err) {
            // Falla silenciosamente — no interrumpe el flujo del usuario
            return rejectWithValue(err.message);
        }
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * usersSlice — Estado global de gestión de usuarios (módulo ADMIN).
 *
 * Contiene:
 *   - items: lista de usuarios (UsersPage)
 *   - stats: estadísticas globales (AdminPanel + UsersPage)
 *   - loading, error, actionLoadingId: estados de operaciones async
 *
 * La búsqueda, ordenamiento y paginación siguen siendo estado local
 * en UsersPage (son estado de UI, no estado de negocio).
 */
const usersSlice = createSlice({
    name: 'users',
    initialState: {
        /** Array de usuarios registrados */
        items: [],
        /** true mientras fetchUsers está en curso */
        loading: false,
        /** Mensaje del último error de carga (null si no hay) */
        error: null,

        /** ID del usuario siendo procesado por toggleUserActive (null si ninguno) */
        actionLoadingId: null,

        /** Estadísticas globales del panel admin (null si no cargaron aún) */
        stats: null,
        /** true mientras fetchAdminStats está en curso */
        loadingStats: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // ── fetchUsers ────────────────────────────────────────────────
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.items = action.payload || [];
                state.loading = false;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })

            // ── toggleUserActive ──────────────────────────────────────────
            .addCase(toggleUserActive.pending, (state, action) => {
                // action.meta.arg es el usuario completo pasado al thunk
                state.actionLoadingId = action.meta.arg.id;
            })
            .addCase(toggleUserActive.fulfilled, (state, action) => {
                const { id, nuevoActivo } = action.payload;
                const user = state.items.find((u) => u.id === id);
                if (user) {
                    user.activo = nuevoActivo;
                }
                state.actionLoadingId = null;
            })
            .addCase(toggleUserActive.rejected, (state) => {
                state.actionLoadingId = null;
            })

            // ── fetchAdminStats ───────────────────────────────────────────
            .addCase(fetchAdminStats.pending, (state) => {
                state.loadingStats = true;
            })
            .addCase(fetchAdminStats.fulfilled, (state, action) => {
                state.stats = action.payload;
                state.loadingStats = false;
            })
            .addCase(fetchAdminStats.rejected, (state) => {
                // Falla silenciosa — stats no críticas
                state.loadingStats = false;
            });
    },
});

export default usersSlice.reducer;
