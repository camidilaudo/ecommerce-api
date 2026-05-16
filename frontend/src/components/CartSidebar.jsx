import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import './CartSidebar.css';
import { toast } from 'react-toastify';
import { handleApiResponse } from '../utils/apiHelpers';

const CartSidebar = () => {
    const { cart, removeFromCart, cartTotal, isCartOpen, toggleCart, clearCart } = useCart();
    const [loadingCheckout, setLoadingCheckout] = useState(false);
    const token = localStorage.getItem('token');

    if (!isCartOpen) return null;

    const handleCheckout = async () => {
        if (cart.length === 0) {
            return toast.info('El carrito está vacío');
        }
        setLoadingCheckout(true);
        try {
            // Ajusta el payload al formato que espera tu backend
            const payload = {
                items: cart.map(i => ({ productoId: i.id, cantidad: i.quantity }))
            };

            const response = await fetch('http://localhost:8081/api/carrito/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const body = await handleApiResponse(response);
            toast.success(body?.message || 'Compra realizada con éxito');
            clearCart();
            toggleCart(); // cierra el sidebar
        } catch (err) {
            console.error('Checkout error:', err);
            toast.error(`Error al finalizar compra: ${err.message}`);
        } finally {
            setLoadingCheckout(false);
        }
    };

    return (
        <div className="cart-overlay" onClick={toggleCart}>
            <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
                <div className="cart-header">
                    <h3>Tu Carrito</h3>
                    <button className="close-btn" onClick={toggleCart}>✕</button>
                </div>

                <div className="cart-content">
                    {cart.length === 0 ? (
                        <p className="empty-msg">No hay productos aún.</p>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="cart-item">
                                <img src={item.imagen} alt={item.nombre} />
                                <div className="item-info">
                                    <h4>{item.nombre}</h4>
                                    <p>{item.quantity} x ${item.precio}</p>
                                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Eliminar</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="cart-footer">
                        <div className="total-row">
                            <span>Total estimado:</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <button className="checkout-btn" onClick={handleCheckout} disabled={loadingCheckout}>
                            {loadingCheckout ? 'Procesando...' : 'Finalizar Compra'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartSidebar;