import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authFetch } from '../../utils/authFetch';

const API_BASE = 'http://localhost:8081/api/pedidos';

// ─────────────────────────────────────────────────────────────────────────────
// THUNKS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * fetchOrders — GET /api/pedidos
 *
 * Recupera el historial de pedidos del usuario autenticado.
 * Usa authFetch → detecta 401 → dispatch logout → redirect /login.
 * Los resultados se ordenan por id descendente (más nuevos primero),
 * replicando el comportamiento original de OrdersPage.jsx.
 */
export const fetchOrders = createAsyncThunk(
    'orders/fetchOrders',
    async (_, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        try {
            const response = await authFetch(API_BASE, {}, thunkAPI);
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                return rejectWithValue(
                    errData.message || errData.error || 'Error al traer pedidos'
                );
            }
            const data = await response.json();
            // Ordenar por ID descendente (más nuevos primero)
            return (data || []).sort((a, b) => b.id - a.id);
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ordersSlice — Estado global del historial de pedidos.
 *
 * El estado de loading/error vive aquí.
 * OrdersPage lee del store via useSelector y ya no necesita
 * useState(loading) ni useState(error) locales para los datos.
 *
 * selectedOrder sigue siendo estado local en OrdersPage
 * (es puro estado de UI — qué pedido tiene el modal abierto).
 */
const ordersSlice = createSlice({
    name: 'orders',
    initialState: {
        /** Array de pedidos del usuario, ordenados por id desc */
        items: [],
        /** true mientras fetchOrders está en curso */
        loading: false,
        /** Mensaje del último error (null si no hay) */
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.items = action.payload;
                state.loading = false;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
    },
});

export default ordersSlice.reducer;
