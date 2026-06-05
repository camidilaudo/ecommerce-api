import { toast } from 'react-toastify';
import { setCart, clearCartLocal, closeCart } from './cartSlice';
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
 * fetchCart — Carga el carrito desde el backend.
 *
 * Reemplaza el useEffect([token]) del CartContext original.
 * Se dispara desde AppInitializer en main.jsx cuando el token cambia.
 *
 * DT-04 fix: si no hay token, limpia el carrito local.
 * DT-05 fix: se re-dispara cuando el usuario hace login/logout.
 */
export const fetchCart = () => async (dispatch, getState) => {
    const token = selectToken(getState());

    if (!token) {
        // DT-04: limpiar carrito local si no hay sesión activa
        dispatch(clearCartLocal());
        return;
    }

    try {
        const response = await fetch(API_BASE, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            const data = await response.json();
            dispatch(setCart(mapBackendCartToFrontend(data)));
        }
    } catch (err) {
        console.error('Error al recuperar el carrito desde el servidor:', err);
    }
};

/**
 * addToCartThunk — Agrega un producto al carrito persistente.
 *
 * BUG-06 fix: una sola request POST con ?cantidad=N.
 * @param {object} product — Producto a agregar
 * @param {number} quantityRequested — Cantidad (default: 1)
 * @param {boolean} showToast — Mostrar notificación de éxito (default: true)
 */
export const addToCartThunk = (product, quantityRequested = 1, showToast = true) => async (dispatch, getState) => {
    const token = selectToken(getState());

    if (!token) {
        toast.warn('Por favor, iniciá sesión para poder agregar productos al carrito.');
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/agregar/${product.id}?cantidad=${quantityRequested}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || errData.message || 'No hay suficiente stock de este producto.');
        }

        const cartData = await response.json();
        dispatch(setCart(mapBackendCartToFrontend(cartData)));

        if (showToast) {
            toast.success(`¡"${product.nombre}" agregado al carrito! 🛒`);
        }
    } catch (err) {
        toast.error(err.message);
    }
};

/**
 * removeFromCartThunk — Elimina un producto del carrito persistente.
 * @param {number} productId
 */
export const removeFromCartThunk = (productId) => async (dispatch, getState) => {
    const token = selectToken(getState());
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE}/eliminar/${productId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || errData.message || 'Error al eliminar el producto del carrito.');
        }

        const data = await response.json();
        dispatch(setCart(mapBackendCartToFrontend(data)));
        toast.info('Producto removido del carrito.');
    } catch (err) {
        toast.error(err.message);
    }
};

/**
 * clearCartThunk — Vacía el carrito en la base de datos y en el store.
 */
export const clearCartThunk = () => async (dispatch, getState) => {
    const token = selectToken(getState());

    if (!token) {
        dispatch(clearCartLocal());
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/vaciar`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || errData.message || 'Error al vaciar el carrito.');
        }

        dispatch(clearCartLocal());
        toast.info('Carrito vaciado.');
    } catch (err) {
        toast.error(err.message);
    }
};

/**
 * checkoutThunk — Finaliza la compra.
 * El backend identifica al usuario por JWT, no necesita body.
 */
export const checkoutThunk = () => async (dispatch, getState) => {
    const token = selectToken(getState());
    if (!token) return;

    const response = await fetch(`${API_BASE}/checkout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || 'Error al procesar la compra.');
    }

    const body = await response.json();
    dispatch(clearCartLocal());
    dispatch(closeCart());

    return body;
};
