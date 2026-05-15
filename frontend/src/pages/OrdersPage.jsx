import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/ProductList.css';

/**
 * OrdersPage - Historial de pedidos del usuario logueado.
 * Realiza peticiones asíncronas seguras inyectando el token Bearer.
 */
const OrdersPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
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
                setOrders(data);
            } catch (err) {
                console.error(err.message);
                // Datos mockeados de control para pruebas visuales en clase
                setOrders([
                    { id: 1024, fecha: "15-05-2026", total: 4500.00, estado: "ENTREGADO" },
                    { id: 1089, fecha: "15-05-2026", total: 12000.50, estado: "PROCESANDO" }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate]);

    return (
        <div className="container" style={{ padding: '60px 20px', minHeight: '80vh' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>Mis Pedidos</h2>

            {loading ? (
                <p>Cargando órdenes de compra...</p>
            ) : orders.length === 0 ? (
                <p style={{ color: '#86868b' }}>Aún no has realizado ninguna compra.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {orders.map(order => (
                        <div key={order.id} style={{ border: '1px solid #d2d2d7', borderRadius: '14px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
                            <div>
                                <h4 style={{ margin: '0 0 4px 0' }}>Pedido #{order.id}</h4>
                                <p style={{ margin: '0', color: '#86868b', fontSize: '14px' }}>Fecha: {order.fecha}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ display: 'block', fontWeight: '700', fontSize: '16px' }}>${order.total.toFixed(2)}</span>
                                <span style={{ fontSize: '12px', fontWeight: '600', color: order.estado === 'ENTREGADO' ? '#34c759' : '#0071e3' }}>
                                    {order.estado}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;