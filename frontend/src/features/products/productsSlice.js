import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authFetch } from '../../utils/authFetch';

/**
 * productsSlice — Estado global del catálogo de productos.
 *
 * Centraliza todas las llamadas HTTP a /api/productos que antes vivían
 * como useState + useEffect locales en HomePage, ProductDetailPage,
 * AdminPanel y Favorite.
 *
 * Estado:
 *   items: catálogo completo (GET /api/productos)
 *   selectedProduct: producto de la vista de detalle (GET /api/productos/{id})
 *   relatedProducts: productos de la misma categoría para "Recomendados"
 *   loading: operación principal en curso
 *   loadingRelated: carga de recomendados (UX independiente del detalle)
 *   error: mensaje del último error (null si no hay)
 *
 * Convención: los thunks siempre rechazan con rejectWithValue(string),
 * así los componentes pueden hacer .unwrap().catch(toast.error).
 */

const API_BASE = 'http://localhost:8081/api/productos';

const extractErrorMessage = async (response, fallback) => {
    const errData = await response.json().catch(() => ({}));
    return errData.error || errData.message || fallback;
};

// ─────────────────────────────────────────────────────────────────────────────
// THUNKS — lecturas públicas
// ─────────────────────────────────────────────────────────────────────────────

/** Carga el catálogo completo. */
export const fetchProducts = createAsyncThunk(
    'products/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(API_BASE);
            if (!response.ok) {
                return rejectWithValue('Error de comunicación con el servidor');
            }
            return await response.json();
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

/** Carga el detalle de un producto por id. */
export const fetchProductById = createAsyncThunk(
    'products/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE}/${id}`);
            if (!response.ok) {
                if (response.status === 404) {
                    return rejectWithValue('El artículo solicitado no existe.');
                }
                return rejectWithValue('Error al conectar con el servidor.');
            }
            return await response.json();
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

/** Carga los productos de una categoría (sección "Recomendados"). */
export const fetchProductsByCategory = createAsyncThunk(
    'products/fetchByCategory',
    async (categoryId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE}/categoria/${categoryId}`);
            if (!response.ok) {
                return rejectWithValue('Error al cargar productos relacionados.');
            }
            return await response.json();
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// THUNKS — mutaciones de admin (requieren JWT)
// ─────────────────────────────────────────────────────────────────────────────

/** Alta de producto (Admin). */
export const createProduct = createAsyncThunk(
    'products/create',
    async (productData, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        try {
            const response = await authFetch(API_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            }, thunkAPI);
            if (!response.ok) {
                return rejectWithValue(
                    await extractErrorMessage(response, 'No se pudo dar de alta el producto.')
                );
            }
            return await response.json().catch(() => null);
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

/** Modificación de producto (Admin). */
export const updateProduct = createAsyncThunk(
    'products/update',
    async ({ id, data }, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        try {
            const response = await authFetch(`${API_BASE}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            }, thunkAPI);
            if (!response.ok) {
                return rejectWithValue(
                    await extractErrorMessage(response, 'No se pudo actualizar el producto.')
                );
            }
            return await response.json().catch(() => null);
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

/** Baja de producto (Admin). El payload útil es action.meta.arg (el id). */
export const deleteProduct = createAsyncThunk(
    'products/delete',
    async (id, thunkAPI) => {
        const { rejectWithValue } = thunkAPI;
        try {
            const response = await authFetch(`${API_BASE}/${id}`, {
                method: 'DELETE',
            }, thunkAPI);
            if (!response.ok) {
                return rejectWithValue(
                    await extractErrorMessage(response, 'No se pudo eliminar el artículo.')
                );
            }
            return id;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────────────────────────────────────

const setPending = (state) => {
    state.loading = true;
    state.error = null;
};

const setRejected = (state, action) => {
    state.loading = false;
    state.error = action.payload || action.error.message;
};

const productsSlice = createSlice({
    name: 'products',
    initialState: {
        items: [],
        selectedProduct: null,
        relatedProducts: [],
        loading: false,
        loadingRelated: false,
        error: null,
    },
    reducers: {
        /**
         * clearSelectedProduct — Resetea el detalle al desmontar ProductDetailPage,
         * evitando el flash del producto anterior al navegar a otro detalle.
         */
        clearSelectedProduct(state) {
            state.selectedProduct = null;
            state.relatedProducts = [];
        },

        /** clearError — Limpia el error al reintentar. */
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchProducts
            .addCase(fetchProducts.pending, setPending)
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.items = action.payload;
                state.loading = false;
            })
            .addCase(fetchProducts.rejected, setRejected)

            // fetchProductById
            .addCase(fetchProductById.pending, (state) => {
                state.loading = true;
                state.selectedProduct = null;
                state.error = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.selectedProduct = action.payload;
                state.loading = false;
            })
            .addCase(fetchProductById.rejected, setRejected)

            // fetchProductsByCategory — excluye el producto en detalle y limita a 4
            .addCase(fetchProductsByCategory.pending, (state) => {
                state.loadingRelated = true;
            })
            .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
                const currentId = state.selectedProduct?.id;
                state.relatedProducts = action.payload
                    .filter((p) => p.id !== currentId)
                    .slice(0, 4);
                state.loadingRelated = false;
            })
            .addCase(fetchProductsByCategory.rejected, (state) => {
                state.loadingRelated = false;
            })

            // createProduct — AdminPanel re-fetchea la lista tras el alta,
            // pero si el backend devuelve el producto creado lo insertamos ya.
            .addCase(createProduct.pending, setPending)
            .addCase(createProduct.fulfilled, (state, action) => {
                if (action.payload?.id) {
                    state.items = [action.payload, ...state.items];
                }
                state.loading = false;
            })
            .addCase(createProduct.rejected, setRejected)

            // updateProduct
            .addCase(updateProduct.pending, setPending)
            .addCase(updateProduct.fulfilled, (state, action) => {
                if (action.payload?.id) {
                    state.items = state.items.map((p) =>
                        p.id === action.payload.id ? action.payload : p
                    );
                }
                state.loading = false;
            })
            .addCase(updateProduct.rejected, setRejected)

            // deleteProduct — payload: id eliminado
            .addCase(deleteProduct.pending, setPending)
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.items = state.items.filter((p) => p.id !== action.payload);
                state.loading = false;
            })
            .addCase(deleteProduct.rejected, setRejected);
    },
});

export const { clearSelectedProduct, clearError } = productsSlice.actions;
export default productsSlice.reducer;
