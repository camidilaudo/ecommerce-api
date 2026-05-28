import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

/**
 * CartProvider - Contexto global del carrito de compras.
 * Sincronizado con la base de datos MySQL de Spring Boot.
 */
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    // Mapea la estructura del DTO de Backend (CarritoDTO) a la del Estado de Frontend
    const mapBackendCartToFrontend = (backendCart) => {
        if (!backendCart || !backendCart.items) return [];
        return backendCart.items.map(item => ({
            id: item.producto.id,
            nombre: item.producto.nombre,
            precio: item.producto.precio,
            imagen: item.producto.imagen || (item.producto.imagenes && item.producto.imagenes[0]) || '',
            stock: item.producto.stock,
            quantity: item.cantidad
        }));
    };

    // Carga el carrito del usuario autenticado de la base de datos al inicio
    useEffect(() => {
        const fetchCart = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const response = await fetch('http://localhost:8081/api/carrito', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setCart(mapBackendCartToFrontend(data));
                }
            } catch (err) {
                console.error('Error al recuperar el carrito desde el servidor:', err);
            }
        };
        fetchCart();
    }, []);

    // Agregar producto al carrito persistente
    const addToCart = async (product, quantityRequested = 1, showToast = true) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.warn('Por favor, iniciá sesión para poder agregar productos al carrito.');
            return;
        }

        try {
            // El backend agrega de a 1 unidad por invocación al endpoint POST
            // Invocamos tantas veces como unidades pida (por defecto es 1)
            let lastCartData = null;
            for (let i = 0; i < quantityRequested; i++) {
                const response = await fetch(`http://localhost:8081/api/carrito/agregar/${product.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.message || 'No hay suficiente stock de este producto.');
                }
                lastCartData = await response.json();
            }

            if (lastCartData) {
                setCart(mapBackendCartToFrontend(lastCartData));
            }
            
            // UX Enhancement: Sutil toast de aviso en vez de forzar la apertura del sidebar
            if (showToast) {
                toast.success(`¡"${product.nombre}" agregado al carrito! 🛒`);
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    // Eliminar producto del carrito persistente
    const removeFromCart = async (productId) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`http://localhost:8081/api/carrito/eliminar/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al eliminar el producto del carrito.');
            }

            const data = await response.json();
            setCart(mapBackendCartToFrontend(data));
            toast.info('Producto removido del carrito.');
        } catch (err) {
            toast.error(err.message);
        }
    };

    // Vaciar el carrito en memoria y en la base de datos
    const clearCart = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setCart([]);
            return;
        }

        try {
            const response = await fetch('http://localhost:8081/api/carrito/vaciar', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al vaciar el carrito.');
            }

            setCart([]);
            toast.info('Carrito vaciado.');
        } catch (err) {
            toast.error(err.message);
        }
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