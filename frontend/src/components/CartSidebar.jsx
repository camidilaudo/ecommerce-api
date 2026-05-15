import React from 'react';
import { useCart } from '../context/CartContext';
import './CartSidebar.css';

const CartSidebar = () => {
    const { cart, removeFromCart, cartTotal, isCartOpen, toggleCart } = useCart();

    if (!isCartOpen) return null;

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
                        {/* TODO: conectar con POST /api/carrito/checkout cuando esté el backend */}
                        <button className="checkout-btn" onClick={() => alert("Checkout próximamente")}>
                            Finalizar Compra
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartSidebar;