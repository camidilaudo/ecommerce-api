import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Selectores — Redux como única fuente de verdad
import { selectCart, selectCartTotal, selectIsCartOpen } from '../features/cart/cartSelectors';
import { selectToken } from '../features/auth/authSelectors';

// Acciones y thunks
import { toggleCart, closeCart } from '../features/cart/cartSlice';
import { removeFromCartThunk, clearCartThunk, checkoutThunk } from '../features/cart/cartThunks';

import './CartSidebar.css';
import { toast } from 'react-toastify';
import { handleApiResponse } from '../utils/apiHelpers';

/**
 * CartSidebar — Panel lateral del carrito de compras.
 *
 * MIGRADO:
 * - useCart() → useSelector + useDispatch
 * - localStorage.getItem('token') → useSelector(selectToken)   ← fuente de verdad única
 *
 * El token ya no se lee desde localStorage directamente.
 * Todos los datos vienen del store Redux.
 */
const CartSidebar = () => {
    const dispatch = useDispatch();

    // Todo el estado del carrito desde Redux
    const cart = useSelector(selectCart);
    const cartTotal = useSelector(selectCartTotal);
    const isCartOpen = useSelector(selectIsCartOpen);

    // Token desde Redux — NO más localStorage.getItem('token')
    const token = useSelector(selectToken);

    const [loadingCheckout, setLoadingCheckout] = useState(false);

    if (!isCartOpen) return null;

    const handleCheckout = async () => {
        if (cart.length === 0) {
            return toast.info('El carrito está vacío');
        }
        setLoadingCheckout(true);
        try {
            // checkoutThunk obtiene el token internamente desde getState()
            const body = await dispatch(checkoutThunk());
            toast.success(body?.mensaje || 'Compra realizada con éxito');
        } catch (err) {
            console.error('Checkout error:', err);
            toast.error(`Error al finalizar compra: ${err.message}`);
        } finally {
            setLoadingCheckout(false);
        }
    };

    return (
        <div className="cart-overlay" onClick={() => dispatch(toggleCart())}>
            <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
                <div className="cart-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h3 style={{ margin: 0 }}>Tu Carrito</h3>
                        {cart.length > 0 && (
                            <button
                                onClick={() => {
                                    if (window.confirm('¿Estás seguro de que querés vaciar todo el carrito?')) {
                                        dispatch(clearCartThunk());
                                    }
                                }}
                                style={{
                                    background: 'rgba(255, 59, 48, 0.1)',
                                    color: '#ff3b30',
                                    border: 'none',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s, transform 0.1s',
                                    outline: 'none'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 59, 48, 0.18)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)'}
                                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                Vaciar
                            </button>
                        )}
                    </div>
                    <button className="close-btn" onClick={() => dispatch(toggleCart())}>✕</button>
                </div>

                <div className="cart-content">
                    {cart.length === 0 ? (
                        <p className="empty-msg">No hay productos aún.</p>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="cart-item">
                                <img src={item.imagen} alt={item.nombre} />
                                <div className="item-info">
                                    <h4>{item.nombre}</h4>
                                    <p>{item.quantity} x ${item.precio}</p>
                                    <button className="remove-btn" onClick={() => dispatch(removeFromCartThunk(item.id))}>Eliminar</button>
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