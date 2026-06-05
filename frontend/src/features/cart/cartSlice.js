import { createSlice } from '@reduxjs/toolkit';

/**
 * cartSlice — Estado global del carrito de compras.
 *
 * IMPORTANTE: Los reducers son completamente puros.
 * Toda la lógica async (fetch al backend Spring Boot) vive en cartThunks.js.
 * Este slice solo gestiona la forma del estado y las transiciones síncronas.
 *
 * Estado:
 *   items: array de productos en el carrito (estructura mapeada desde CarritoDTO)
 *   isCartOpen: controla la visibilidad del sidebar de carrito
 *
 * Los totales (cartCount, cartTotal) son valores DERIVADOS calculados
 * en cartSelectors.js, no se almacenan en el estado para evitar redundancia.
 */
const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        isCartOpen: false,
    },
    reducers: {
        /**
         * setCart — Reemplaza los items del carrito con la respuesta del backend.
         * Llamado por los thunks tras cada operación exitosa (fetch, add, remove, clear).
         * Payload: array de items ya mapeados al formato frontend.
         */
        setCart(state, action) {
            state.items = action.payload;
        },

        /**
         * clearCartLocal — Vacía el carrito en el store sin llamar al backend.
         * Usado al hacer logout para limpiar el estado inmediatamente (DT-04 fix).
         */
        clearCartLocal(state) {
            state.items = [];
        },

        /**
         * toggleCart — Alterna la visibilidad del sidebar del carrito.
         */
        toggleCart(state) {
            state.isCartOpen = !state.isCartOpen;
        },

        /**
         * closeCart — Cierra el sidebar del carrito explícitamente.
         * Usado después del checkout para cerrar el panel.
         */
        closeCart(state) {
            state.isCartOpen = false;
        },
    },
});

export const { setCart, clearCartLocal, toggleCart, closeCart } = cartSlice.actions;
export default cartSlice.reducer;
