import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectToken } from '../features/auth/authSelectors';
import './OrdersPage.css';

/**
 * OrdersPage - Historial de pedidos y detalle interactivo.
 * Consume de forma real el endpoint GET /api/pedidos de Spring Boot.
 */
const OrdersPage = () => {
    const navigate = useNavigate();
    // Token desde Redux — NO más localStorage.getItem('token')
    const token = useSelector(selectToken);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:8081/api/pedidos', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Error al traer pedidos');
                const data = await response.json();
                
                // Ordenar por ID descendente (más nuevos primero)
                const sorted = (data || []).sort((a, b) => b.id - a.id);
                setOrders(sorted);
            } catch (err) {
                console.error(err.message);
                setError('No se pudo conectar con el servidor. Verificá que el backend esté corriendo.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate]);

    // Formatear Fecha y Hora del ISO String retornado por el Backend
    const formatDateTime = (isoString) => {
        if (!isoString) return 'Sin fecha';
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return isoString;
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year} a las ${hours}:${minutes} hs`;
        } catch (err) {
            return isoString;
        }
    };

    return (
        <div className="orders-page page container">
            <h2 className="orders-title">Mis Pedidos</h2>

            {loading ? (
                <div style={{ padding: '40px 0', color: '#86868b' }}>Cargando tus órdenes de compra...</div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <p style={{ color: '#ff3b30', fontSize: '16px', marginBottom: '24px' }}>{error}</p>
                    <button className="btn-back-store" onClick={() => navigate('/')} style={{ background: '#0071e3', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', cursor: 'pointer', fontWeight: '600' }}>
                        Volver al Catálogo
                    </button>
                </div>
            ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <p style={{ color: '#86868b', fontSize: '16px', marginBottom: '24px' }}>Aún no has realizado ninguna compra.</p>
                    <button className="btn-back-store" onClick={() => navigate('/')} style={{ background: '#0071e3', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', cursor: 'pointer', fontWeight: '600' }}>
                        Ir al Catálogo de Productos
                    </button>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div 
                            key={order.id} 
                            className="order-card"
                            onClick={() => setSelectedOrder(order)}
                        >
                            <div className="order-info">
                                <h4>Pedido #{order.id}</h4>
                                <p className="order-date">Realizado el: {formatDateTime(order.fechaCreacion)}</p>
                            </div>
                            <div className="order-financials">
                                <span className="order-total">${order.total.toFixed(2)}</span>
                                <span className="order-status">Completado</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Detalle de Pedido */}
            {selectedOrder && (
                <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
                    <div className="order-detail-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-x" onClick={() => setSelectedOrder(null)}>✕</button>
                        
                        <div className="modal-header">
                            <h3>Detalle de Compra</h3>
                            <div className="modal-meta">
                                <span><strong>Pedido:</strong> #{selectedOrder.id}</span>
                                <span><strong>Fecha y hora:</strong> {formatDateTime(selectedOrder.fechaCreacion)}</span>
                            </div>
                        </div>

                        <div className="modal-divider"></div>

                        <h4 className="items-section-title">Artículos Comprados</h4>
                        <div className="order-items-list">
                            {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                selectedOrder.items.map(item => (
                                    <div key={item.id} className="order-item-row">
                                        <div className="item-details">
                                            <h5>{item.productoNombre || `Producto #${item.productoId}`}</h5>
                                            <span className="item-qty-price">{item.cantidad} x ${item.precioUnitario.toFixed(2)}</span>
                                        </div>
                                        <span className="item-subtotal">
                                            ${(item.cantidad * item.precioUnitario).toFixed(2)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#86868b', fontSize: '14px', margin: 0 }}>No hay ítems registrados en este pedido.</p>
                            )}
                        </div>

                        <div className="modal-divider"></div>

                        <div className="modal-footer">
                            <span className="modal-total-label">Total del Pedido:</span>
                            <span className="modal-total-value">${selectedOrder.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;