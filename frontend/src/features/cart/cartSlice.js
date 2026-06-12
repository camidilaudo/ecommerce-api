import { createSlice } from '@reduxjs/toolkit';
import { fetchCart, addToCart, removeFromCart, clearCart, checkout } from './cartThunks';

/**
 * cartSlice — Estado global del carrito de compras.
 *
 * Toda la lógica async (fetch al backend Spring Boot) vive en cartThunks.js
 * como createAsyncThunk. Este slice gestiona la forma del estado, las
 * transiciones síncronas y los ciclos pending/fulfilled/rejected de cada thunk.
 *
 * Estado:
 *   items: array de productos en el carrito (estructura mapeada desde CarritoDTO)
 *   isCartOpen: controla la visibilidad del sidebar de carrito
 *   loading: hay una operación async del carrito en curso
 *   error: mensaje del último error de una operación async (null si no hay)
 *
 * Los totales (cartCount, cartTotal) son valores DERIVADOS calculados
 * en cartSelectors.js, no se almacenan en el estado para evitar redundancia.
 */

// Helpers compartidos por todos los thunks del carrito
const setPending = (state) => {
    state.loading = true;
    state.error = null;
};

const setRejected = (state, action) => {
    state.loading = false;
    state.error = action.payload || action.error.message;
};

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        isCartOpen: false,
        loading: false,
        error: null,
    },
    reducers: {
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
         */
        closeCart(state) {
            state.isCartOpen = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchCart — payload: items ya mapeados al formato frontend
            .addCase(fetchCart.pending, setPending)
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.items = action.payload;
                state.loading = false;
            })
            .addCase(fetchCart.rejected, setRejected)

            // addToCart — payload: carrito completo actualizado
            .addCase(addToCart.pending, setPending)
            .addCase(addToCart.fulfilled, (state, action) => {
                state.items = action.payload;
                state.loading = false;
            })
            .addCase(addToCart.rejected, setRejected)

            // removeFromCart — payload: carrito completo actualizado
            .addCase(removeFromCart.pending, setPending)
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.items = action.payload;
                state.loading = false;
            })
            .addCase(removeFromCart.rejected, setRejected)

            // clearCart — el backend vació el carrito
            .addCase(clearCart.pending, setPending)
            .addCase(clearCart.fulfilled, (state) => {
                state.items = [];
                state.loading = false;
            })
            .addCase(clearCart.rejected, setRejected)

            // checkout — compra finalizada: vacía el carrito y cierra el sidebar
            .addCase(checkout.pending, setPending)
            .addCase(checkout.fulfilled, (state) => {
                state.items = [];
                state.isCartOpen = false;
                state.loading = false;
            })
            .addCase(checkout.rejected, setRejected);
    },
});

export const { clearCartLocal, toggleCart, closeCart } = cartSlice.actions;
export default cartSlice.reducer;
