import { createAsyncThunk } from '@reduxjs/toolkit';
import { selectToken } from '../auth/authSelectors';

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
 * DT-04 fix: si no hay token, resuelve con [] para limpiar el carrito local.
 * DT-05 fix: se re-dispara cuando el usuario hace login/logout.
 *
 * Los toasts viven en los componentes (via .unwrap()), no acá:
 * el thunk solo resuelve con el payload o rechaza con un mensaje (string).
 */
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { getState, rejectWithValue }) => {
        const token = selectToken(getState());

        // DT-04: sin sesión activa → carrito local vacío
        if (!token) return [];

        try {
            const response = await fetch(API_BASE, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                return rejectWithValue(
                    await extractErrorMessage(response, 'Error al recuperar el carrito desde el servidor.')
                );
            }

            const data = await response.json();
            return mapBackendCartToFrontend(data);
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

/**
 * addToCart — Agrega un producto al carrito persistente.
 *
 * BUG-06 fix: una sola request POST con ?cantidad=N.
 * @param {object} arg — { product, quantity = 1 }
 */
export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async ({ product, quantity = 1 }, { getState, rejectWithValue }) => {
        const token = selectToken(getState());

        if (!token) {
            return rejectWithValue('Por favor, iniciá sesión para poder agregar productos al carrito.');
        }

        try {
            const response = await fetch(
                `${API_BASE}/agregar/${product.id}?cantidad=${quantity}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                return rejectWithValue(
                    await extractErrorMessage(response, 'No hay suficiente stock de este producto.')
                );
            }

            const cartData = await response.json();
            return mapBackendCartToFrontend(cartData);
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
    async (productId, { getState, rejectWithValue }) => {
        const token = selectToken(getState());
        if (!token) return rejectWithValue('Sesión no válida.');

        try {
            const response = await fetch(`${API_BASE}/eliminar/${productId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                return rejectWithValue(
                    await extractErrorMessage(response, 'Error al eliminar el producto del carrito.')
                );
            }

            const data = await response.json();
            return mapBackendCartToFrontend(data);
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

/**
 * clearCart — Vacía el carrito en la base de datos y en el store.
 * Sin token resuelve igual: el fulfilled deja items = [] (mismo efecto local).
 */
export const clearCart = createAsyncThunk(
    'cart/clearCart',
    async (_, { getState, rejectWithValue }) => {
        const token = selectToken(getState());
        if (!token) return null;

        try {
            const response = await fetch(`${API_BASE}/vaciar`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

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
    async (_, { getState, rejectWithValue }) => {
        const token = selectToken(getState());
        if (!token) return rejectWithValue('Sesión no válida.');

        try {
            const response = await fetch(`${API_BASE}/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

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
