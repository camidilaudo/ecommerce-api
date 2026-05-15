import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

/**
 * AdminPanel - Panel de Gestión de Productos (CRUD).
 * Cumple con el requisito de Alta, Baja y Modificación de la actividad grupal.
 * Conecta con Spring Boot 4.0.5 en el puerto 8081.
 */
const AdminPanel = () => {
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estado unificado para el formulario de alta de producto
    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        categoria: '',
        imagen: ''
    });

    // Recuperamos el token de seguridad del localStorage
    const token = localStorage.getItem('token');

    // useEffect: Carga la lista actual de artículos al montar la vista
    useEffect(() => {
        // Redirección de seguridad: si no hay sesión, mandamos al login
        if (!token) {
            navigate('/login');
            return;
        }
        fetchProducts();
    }, [token, navigate]);

    /**
     * Trae todos los productos desde el endpoint público del Backend.
     * GET http://localhost:8081/api/productos
     */
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8081/api/productos');
            if (!response.ok) throw new Error('Error al sincronizar el catálogo');
            const data = await response.json();
            setProductos(data);
        } catch (err) {
            console.error("Error Admin:", err.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Procesa el formulario y envía un alta al servidor.
     * POST http://localhost:8081/api/productos
     */
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8081/api/productos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Cabecera obligatoria JWT
                },
                body: JSON.stringify({
                    ...form,
                    precio: Number(form.precio),
                    stock: Number(form.stock)
                })
            });

            if (!response.ok) throw new Error('No se pudo dar de alta el producto');

            alert('¡Producto publicado con éxito!');
            // Limpiamos el formulario
            setForm({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '', imagen: '' });
            // Recargamos la tabla de inmediato
            fetchProducts();
        } catch (err) {
            alert(err.message);
        }
    };

    /**
     * Envía la orden de baja lógica/física de un artículo usando su ID.
     * DELETE http://localhost:8081/api/productos/{id}
     */
    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este producto del catálogo?')) return;

        try {
            const response = await fetch(`http://localhost:8081/api/productos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('No se pudo eliminar el artículo');

            alert('Producto removido');
            fetchProducts();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="admin-page container">
            <header className="admin-header">
                <div>
                    <h2>Panel de Administración</h2>
                    <p>Módulo de Alta, Baja y Modificación de Artículos</p>
                </div>
                <button className="btn-back-store" onClick={() => navigate('/')}>
                    Volver a la Tienda
                </button>
            </header>

            <div className="admin-grid">
                {/* Formulario de Alta */}
                <div className="admin-card">
                    <h3>Publicar Nuevo Artículo</h3>
                    <form onSubmit={handleCreate} className="admin-form">
                        <div className="admin-input-group">
                            <label>Nombre del Producto</label>
                            <input type="text" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
                        </div>
                        <div className="admin-input-group">
                            <label>Descripción Corta</label>
                            <input type="text" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} required />
                        </div>
                        <div className="admin-row">
                            <div className="admin-input-group">
                                <label>Precio ($)</label>
                                <input type="number" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} required min="1" />
                            </div>
                            <div className="admin-input-group">
                                <label>Stock Inicial</label>
                                <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required min="0" />
                            </div>
                        </div>
                        <div className="admin-input-group">
                            <label>Categoría</label>
                            <input type="text" placeholder="Ej: Notebooks, Celulares" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} required />
                        </div>
                        <div className="admin-input-group">
                            <label>URL de la Imagen</label>
                            <input type="url" placeholder="https://ejemplo.com/foto.jpg" value={form.imagen} onChange={e => setForm({...form, imagen: e.target.value})} required />
                        </div>
                        <button type="submit" className="admin-submit-btn">Guardar en Base de Datos</button>
                    </form>
                </div>

                {/* Tabla de Inventario (Bajas) */}
                <div className="admin-card">
                    <h3>Inventario Disponible</h3>
                    {loading ? (
                        <p className="admin-loading">Sincronizando con base de datos de Docker...</p>
                    ) : productos.length === 0 ? (
                        <p className="admin-empty">No hay productos registrados en el sistema.</p>
                    ) : (
                        <div className="table-wrapper">
                            <table className="admin-table">
                                <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Precio</th>
                                    <th>Stock</th>
                                    <th>Acciones</th>
                                </tr>
                                </thead>
                                <tbody>
                                {productos.map(p => (
                                    <tr key={p.id}>
                                        <td className="table-name-cell">{p.nombre}</td>
                                        <td>${p.precio}</td>
                                        <td className={p.stock === 0 ? "stock-out" : ""}>{p.stock} u</td>
                                        <td>
                                            <button onClick={() => handleDelete(p.id)} className="admin-delete-btn">
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;