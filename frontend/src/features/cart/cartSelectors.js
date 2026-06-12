/**
 * cartSelectors.js — Selectores reutilizables para el slice del carrito.
 *
 * Los totales (cartCount, cartTotal) son valores DERIVADOS.
 * Se calculan aquí en lugar de almacenarse en el estado para evitar
 * duplicación de datos y posibles inconsistencias.
 */

/** Retorna el array de items del carrito */
export const selectCart = (state) => state.cart.items;

/** Retorna si el sidebar del carrito está abierto */
export const selectIsCartOpen = (state) => state.cart.isCartOpen;

/** Retorna si hay una operación async del carrito en curso */
export const selectCartLoading = (state) => state.cart.loading;

/** Retorna el mensaje del último error de una operación async (null si no hay) */
export const selectCartError = (state) => state.cart.error;

/**
 * Retorna la cantidad total de unidades en el carrito.
 * Equivale al `cartCount` del CartContext original.
 */
export const selectCartCount = (state) =>
    state.cart.items.reduce((acc, item) => acc + item.quantity, 0);

/**
 * Retorna el precio total del carrito.
 * Equivale al `cartTotal` del CartContext original.
 */
export const selectCartTotal = (state) =>
    state.cart.items.reduce((acc, item) => acc + item.precio * item.quantity, 0);
