import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const CartContext = createContext();

/**
 * CartProvider - Contexto global del carrito de compras.
 * Sincronizado con la base de datos MySQL de Spring Boot.
 *
 * DT-04 FIX: al hacer logout (token = null), el useEffect limpia el carrito automáticamente.
 * DT-05 FIX: 'token' es dependencia del useEffect → recarga el carrito al iniciar sesión.
 * BUG-06 FIX: addToCart envía UNA sola request POST con ?cantidad=N en lugar de N requests.
 */
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // DT-04 + DT-05 FIX: consumir el token del AuthContext para reaccionar al login/logout
    const { token } = useAuth();

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

    /**
     * DT-05 FIX: 'token' como dependencia → se ejecuta cuando el usuario hace login.
     * DT-04 FIX: cuando token es null (logout), limpia el carrito inmediatamente.
     */
    useEffect(() => {
        const fetchCart = async () => {
            if (!token) {
                // DT-04: limpiar carrito al cerrar sesión (sin esperar recarga)
                setCart([]);
                return;
            }
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
    }, [token]); // ← DT-05 FIX: dependencia en token, no array vacío []

    /**
     * BUG-06 FIX: una sola request POST /api/carrito/agregar/{id}?cantidad=N
     * en lugar del loop de N requests secuenciales.
     */
    const addToCart = async (product, quantityRequested = 1, showToast = true) => {
        if (!token) {
            toast.warn('Por favor, iniciá sesión para poder agregar productos al carrito.');
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8081/api/carrito/agregar/${product.id}?cantidad=${quantityRequested}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || errData.message || 'No hay suficiente stock de este producto.');
            }

            const cartData = await response.json();
            setCart(mapBackendCartToFrontend(cartData));

            if (showToast) {
                toast.success(`¡"${product.nombre}" agregado al carrito! 🛒`);
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    // Eliminar producto del carrito persistente
    const removeFromCart = async (productId) => {
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
                throw new Error(errData.error || errData.message || 'Error al eliminar el producto del carrito.');
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
                throw new Error(errData.error || errData.message || 'Error al vaciar el carrito.');
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