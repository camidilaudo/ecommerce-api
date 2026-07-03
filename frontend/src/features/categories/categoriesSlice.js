import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authFetch } from '../../utils/authFetch';

const API_BASE = '/api/categorias';

// ─────────────────────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────────────────────

const extractErrorMessage = async (response, fallback) => {
    const errData = await response.json().catch(() => ({}));
    return errData.error || errData.message || fallback;
};

// ─────────────────────────────────────────────────────────────────────────────
// THUNKS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * fetchCategories — GET /api/categorias
 *
 * Endpoint público (no requiere JWT). Usado por:
 *   - Categorias.jsx    → filtros de la HomePage
 *   - AdminPanel.jsx    → selector de categorías al crear/editar productos
 *   - CategoryManager.jsx → lista + alta + baja de categorías
 *
 * Al ser un endpoint público usamos fetch directo (no authFetch).
 * Si el catálogo ya fue cargado previamente, los componentes pueden
 * evitar el dispatch si detectan items.length > 0 (cache optimistic).
 */
export const fetchCategories = createAsyncThunk(
    'categories/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(API_BASE);
            if (!response.ok) {
                return rejectWithValue('Error al cargar las categorías.');
            }
            return await response.json();
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

/**
 * createCategory — POST /api/categorias
 *
 * Crea una nueva categoría (solo ADMIN). Usa authFetch → 401 → logout + redirect.
 * El fulfilled handler inserta la categoría al final del array local
 * sin necesidad de un segundo fetch.
 *
 * @param {string} nombre — Nombre de la nueva categoría
 */
export const createCategory = createAsyncThunk(
    'categories/create',
    async (nombre, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        try {
            const response = await authFetch(
                API_BASE,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre }),
                },
                thunkAPI
            );
            if (!response.ok) {
                return rejectWithValue(
                    await extractErrorMessage(response, 'No se pudo crear la categoría.')
                );
            }
            return await response.json();
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

/**
 * deleteCategory — DELETE /api/categorias/{id}
 *
 * Elimina una categoría (solo ADMIN). Usa authFetch → 401 → logout + redirect.
 * El fulfilled handler filtra el item del array local
 * sin necesidad de un segundo fetch.
 *
 * @param {number} id — ID de la categoría a eliminar
 */
export const deleteCategory = createAsyncThunk(
    'categories/delete',
    async (id, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        try {
            const response = await authFetch(
                `${API_BASE}/${id}`,
                { method: 'DELETE' },
                thunkAPI
            );
            if (!response.ok) {
                return rejectWithValue(
                    await extractErrorMessage(response, 'No se pudo eliminar la categoría.')
                );
            }
            // Retornamos el id para que el reducer filtre el array localmente
            return id;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * categoriesSlice — Estado global de categorías.
 *
 * Fuente de verdad compartida entre:
 *   - Categorias.jsx    (filtros de HomePage)
 *   - AdminPanel.jsx    (selector de categorías en formulario de productos)
 *   - CategoryManager.jsx (CRUD de categorías)
 *
 * Elimina el fetch duplicado que existía en cada uno de esos componentes
 * de forma independiente.
 *
 * Patrón consistente con productsSlice y usersSlice:
 *   items / loading / error / extraReducers / helpers setPending + setRejected
 */

const setPending = (state) => {
    state.loading = true;
    state.error = null;
};

const setRejected = (state, action) => {
    state.loading = false;
    state.error = action.payload || action.error.message;
};

const categoriesSlice = createSlice({
    name: 'categories',
    initialState: {
        /** Array de objetos { id, nombre } del catálogo de categorías */
        items: [],
        /** true mientras fetchCategories / createCategory / deleteCategory está en curso */
        loading: false,
        /** Mensaje del último error (null si no hay) */
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // ── fetchCategories ───────────────────────────────────────────
            .addCase(fetchCategories.pending, setPending)
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.items = action.payload;
                state.loading = false;
            })
            .addCase(fetchCategories.rejected, setRejected)

            // ── createCategory ────────────────────────────────────────────
            .addCase(createCategory.pending, setPending)
            .addCase(createCategory.fulfilled, (state, action) => {
                // Insertar al final del array local sin re-fetch
                if (action.payload?.id) {
                    state.items = [...state.items, action.payload];
                }
                state.loading = false;
            })
            .addCase(createCategory.rejected, setRejected)

            // ── deleteCategory ────────────────────────────────────────────
            .addCase(deleteCategory.pending, setPending)
            .addCase(deleteCategory.fulfilled, (state, action) => {
                // Filtrar el item eliminado por id sin re-fetch
                state.items = state.items.filter((cat) => cat.id !== action.payload);
                state.loading = false;
            })
            .addCase(deleteCategory.rejected, setRejected);
    },
});

export default categoriesSlice.reducer;
