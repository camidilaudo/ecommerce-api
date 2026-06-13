import { createAsyncThunk } from '@reduxjs/toolkit';
import { authFetch } from '../../utils/authFetch';

/**
 * cartThunks.js — Thunks del carrito de compras.
 *
 * Todos los thunks usan authFetch en lugar de fetch directo.
 * authFetch adjunta automáticamente el Bearer token del store y detecta
 * respuestas 401 (token expirado), haciendo logout + redirect a /login.
 *
 * Convención: los thunks siempre rechazan con rejectWithValue(string),
 * así los componentes pueden hacer .unwrap().catch(toast.error).
 */

const API_BASE = 'http://localhost:8081/api/carrito';

/**
 * Mapea la estructura del DTO de Backend (CarritoDTO) al formato del store frontend.
 * Mantiene exactamente la misma lógica del CartContext original.
 */
const mapBackendCartToFrontend = (backendCart) => {
    if (!backendCart || !backendCart.items) return [];
    return backendCart.items.map((item) => ({
        id: item.producto.id,
        nombre: item.producto.nombre,
        precio: item.producto.precio,
        imagen: item.producto.imagen || (item.producto.imagenes && item.producto.imagenes[0]) || '',
        stock: item.producto.stock,
        quantity: item.cantidad,
    }));
};

/**
 * Extrae un mensaje legible del body de error del backend.
 */
const extractErrorMessage = async (response, fallback) => {
    const errData = await response.json().catch(() => ({}));
    return errData.error || errData.message || fallback;
};

/**
 * fetchCart — Carga el carrito desde el backend.
 *
 * Se dispara desde AppInitializer en main.jsx cuando cambia la sesión.
 * Si no hay token, resuelve con [] para limpiar el carrito local.
 * Si el token está expirado (401), authFetch hace logout + redirect automático.
 */
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, thunkAPI) => {
        const { getState, rejectWithValue } = thunkAPI;
        const token = getState().auth.token;

        // Sin sesión activa → carrito local vacío
        if (!token) return [];

        try {
            const response = await authFetch(API_BASE, {}, thunkAPI);

            if (!response.ok) {
                return rejectWithValue(
                    await extractErrorMessage(response, 'Error al recuperar el carrito desde el servidor.')
                );
            }

            return mapBackendCartToFrontend(await response.json());
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

/**
 * addToCart — Agrega un producto al carrito persistente.
 *
 * @param {object} arg — { product, quantity = 1 }
 */
export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async ({ product, quantity = 1 }, thunkAPI) => {
        const { getState, rejectWithValue } = thunkAPI;
        const token = getState().auth.token;

        if (!token) {
            return rejectWithValue('Por favor, iniciá sesión para poder agregar productos al carrito.');
        }

        try {
            const response = await authFetch(
                `${API_BASE}/agregar/${product.id}?cantidad=${quantity}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                },
                thunkAPI
            );

            if (!response.ok) {
                return rejectWithValue(
                    await extractErrorMessage(response, 'No hay suficiente stock de este producto.')
                );
            }

            return mapBackendCartToFrontend(await response.json());
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

/**
 * removeFromCart — Elimina un producto del carrito persistente.
 * @param {number} productId
 */
export const removeFromCart = createAsyncThunk(
    'cart/removeFromCart',
    async (productId, thunkAPI) => {
        const { getState, rejectWithValue } = thunkAPI;
        const token = getState().auth.token;
        if (!token) return rejectWithValue('Sesión no válida.');

        try {
            const response = await authFetch(
                `${API_BASE}/eliminar/${productId}`,
                { method: 'DELETE' },
                thunkAPI
            );

            if (!response.ok) {
                return rejectWithValue(
                    await extractErrorMessage(response, 'Error al eliminar el producto del carrito.')
                );
            }

            return mapBackendCartToFrontend(await response.json());
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

/**
 * clearCart — Vacía el carrito en la base de datos y en el store.
 */
export const clearCart = createAsyncThunk(
    'cart/clearCart',
    async (_, thunkAPI) => {
        const { getState, rejectWithValue } = thunkAPI;
        const token = getState().auth.token;
        if (!token) return null;

        try {
            const response = await authFetch(
                `${API_BASE}/vaciar`,
                { method: 'DELETE' },
                thunkAPI
            );

            if (!response.ok) {
                return rejectWithValue(
                    await extractErrorMessage(response, 'Error al vaciar el carrito.')
                );
            }

            return null;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

/**
 * checkout — Finaliza la compra.
 * El backend identifica al usuario por JWT, no necesita body.
 * Resuelve con el body de la respuesta ({ mensaje }) para el toast del componente.
 * El fulfilled en cartSlice vacía items y cierra el sidebar.
 */
export const checkout = createAsyncThunk(
    'cart/checkout',
    async (_, thunkAPI) => {
        const { getState, rejectWithValue } = thunkAPI;
        const token = getState().auth.token;
        if (!token) return rejectWithValue('Sesión no válida.');

        try {
            const response = await authFetch(
                `${API_BASE}/checkout`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                },
                thunkAPI
            );

            if (!response.ok) {
                return rejectWithValue(
                    await extractErrorMessage(response, 'Error al procesar la compra.')
                );
            }

            return await response.json();
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);
