import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

/**
 * CartProvider - Contexto global del carrito.
 * Valida stock y controla la visibilidad del sidebar.
 * Añade clearCart para limpiar tras checkout.
 */
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);
        const currentQuantity = existingItem ? existingItem.quantity : 0;

        if (currentQuantity < product.stock) {
            if (existingItem) {
                setCart(cart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ));
            } else {
                setCart([...cart, { ...product, quantity: 1 }]);
                setIsCartOpen(true);
            }
        } else {
            // Mantuvimos la llamada a alert por compatibilidad, pero se recomienda usar toast
            alert(`No hay más stock disponible de ${product.nombre}`);
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cart, addToCart, removeFromCart, cartCount, cartTotal,
            isCartOpen, toggleCart, clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);