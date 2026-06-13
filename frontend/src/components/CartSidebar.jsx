import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FocusLock from 'react-focus-lock';

// Selectores — Redux como única fuente de verdad
import { selectCart, selectCartTotal, selectIsCartOpen } from '../features/cart/cartSelectors';

// Acciones y thunks
import { toggleCart } from '../features/cart/cartSlice';
import { removeFromCart, clearCart, checkout } from '../features/cart/cartThunks';

import './CartSidebar.css';
import { toast } from 'react-toastify';

/**
 * CartSidebar — Panel lateral del carrito de compras.
 */
const CartSidebar = () => {
    const dispatch = useDispatch();

    // Todo el estado del carrito desde Redux
    const cart = useSelector(selectCart);
    const cartTotal = useSelector(selectCartTotal);
    const isCartOpen = useSelector(selectIsCartOpen);

    const [loadingCheckout, setLoadingCheckout] = useState(false);

    // Efecto para tecla Escape y bloqueo de scroll
    useEffect(() => {
        if (!isCartOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                dispatch(toggleCart());
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isCartOpen, dispatch]);

    if (!isCartOpen) return null;

    const handleRemove = (productId) => {
        dispatch(removeFromCart(productId))
            .unwrap()
            .then(() => toast.info('Producto removido del carrito.'))
            .catch((err) => toast.error(err));
    };

    const handleClear = () => {
        dispatch(clearCart())
            .unwrap()
            .then(() => toast.info('Carrito vaciado.'))
            .catch((err) => toast.error(err));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) {
            return toast.info('El carrito está vacío');
        }
        setLoadingCheckout(true);
        try {
            const body = await dispatch(checkout()).unwrap();
            toast.success(body?.mensaje || 'Compra realizada con éxito');
        } catch (err) {
            console.error('Checkout error:', err);
            toast.error(`Error al finalizar compra: ${err}`);
        } finally {
            setLoadingCheckout(false);
        }
    };

    return (
        <div className="cart-overlay" onClick={() => dispatch(toggleCart())} role="dialog" aria-modal="true" aria-label="Carrito de compras">
            <FocusLock returnFocus>
                <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
                    <div className="cart-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h3 style={{ margin: 0 }}>Tu Carrito</h3>
                            {cart.length > 0 && (
                                <button
                                    onClick={() => {
                                        if (window.confirm('¿Estás seguro de que querés vaciar todo el carrito?')) {
                                            handleClear();
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
                                    aria-label="Vaciar carrito"
                                >
                                    Vaciar
                                </button>
                            )}
                        </div>
                        <button className="close-btn" onClick={() => dispatch(toggleCart())} aria-label="Cerrar carrito">✕</button>
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
                                        <button className="remove-btn" onClick={() => handleRemove(item.id)} aria-label={`Eliminar ${item.nombre} del carrito`}>Eliminar</button>
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
            </FocusLock>
        </div>
    );
};

export default CartSidebar;