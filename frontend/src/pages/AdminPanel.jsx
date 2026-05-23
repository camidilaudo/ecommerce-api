import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';
import { toast } from 'react-toastify';
import { handleApiResponse } from '../utils/apiHelpers';

/**
 * AdminPanel - Panel de Gestión de Productos (CRUD).
 * Incluye: Alta, Baja, Edición (PUT).
 */

const EditProductForm = ({ product, onCancel, onSave, saving }) => {
    const [form, setForm] = useState({ ...product });

    useEffect(() => setForm({ ...product }), [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    };

    const submit = (e) => {
        e.preventDefault();
        // Validaciones simples
        if (!form.nombre || Number(form.precio) <= 0) {
            return toast.error('Nombre y precio válidos son requeridos');
        }
        onSave({
            ...form,
            precio: Number(form.precio),
            stock: Number(form.stock),
            id: product.id
        });
    };

    return (
        <form onSubmit={submit} className="admin-edit-form">
            <div className="admin-input-group">
                <label>Nombre</label>
                <input name="nombre" value={form.nombre} onChange={handleChange} required />
            </div>
            <div className="admin-input-group">
                <label>Descripción</label>
                <input name="descripcion" value={form.descripcion} onChange={handleChange} required />
            </div>
            <div className="admin-row">
                <div className="admin-input-group">
                    <label>Precio ($)</label>
                    <input name="precio" type="number" value={form.precio} onChange={handleChange} required min="0.01" step="0.01" />
                </div>
                <div className="admin-input-group">
                    <label>Stock</label>
                    <input name="stock" type="number" value={form.stock} onChange={handleChange} required min="0" />
                </div>
            </div>
            <div className="admin-input-group">
                <label>Categoría</label>
                <input name="categoria" value={form.categoria} onChange={handleChange} />
            </div>
            <div className="admin-input-group">
                <label>URL de la Imagen</label>
                <input name="imagen" value={form.imagen} onChange={handleChange} type="url" />
            </div>

            <div className="edit-actions">
                <button type="button" onClick={onCancel}>Cancelar</button>
                <button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
            </div>
        </form>
    );
};

const AdminPanel = () => {
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        categoria: '',
        imagen: ''
    });

    const [editingProduct, setEditingProduct] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchProducts();
    }, [token, navigate]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8081/api/productos');
            const data = await handleApiResponse(response);
            setProductos(data || []);
        } catch (err) {
            console.error('Error Admin:', err.message);
            toast.error(`No se pudo sincronizar catálogo: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                precio: Number(form.precio),
                stock: Number(form.stock)
            };

            const res = await fetch('http://localhost:8081/api/productos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            await handleApiResponse(res);
            toast.success('Producto publicado con éxito');
            setForm({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '', imagen: '' });
            fetchProducts();
        } catch (err) {
            console.error(err);
            toast.error(`No se pudo dar de alta el producto: ${err.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este producto del catálogo?')) return;
        try {
            const res = await fetch(`http://localhost:8081/api/productos/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            await handleApiResponse(res);
            toast.success('Producto eliminado');
            fetchProducts();
        } catch (err) {
            console.error(err);
            toast.error(`No se pudo eliminar el artículo: ${err.message}`);
        }
    };

    const openEdit = (product) => setEditingProduct(product);
    const closeEdit = () => setEditingProduct(null);

    const handleSaveEdit = async (updated) => {
        setIsSaving(true);
        try {
            const res = await fetch(`http://localhost:8081/api/productos/${updated.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(updated)
            });
            await handleApiResponse(res);
            toast.success('Producto actualizado correctamente');
            fetchProducts();
            closeEdit();
        } catch (err) {
            console.error(err);
            toast.error(`No se pudo actualizar: ${err.message}`);
        } finally {
            setIsSaving(false);
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
                <div className="admin-card">
                    <h3>Publicar Nuevo Artículo</h3>
                    <form onSubmit={handleCreate} className="admin-form">
                        <div className="admin-input-group">
                            <label>Nombre del Producto</label>
                            <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
                        </div>
                        <div className="admin-input-group">
                            <label>Descripción Corta</label>
                            <input type="text" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} required />
                        </div>
                        <div className="admin-row">
                            <div className="admin-input-group">
                                <label>Precio ($)</label>
                                <input type="number" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} required min="1" />
                            </div>
                            <div className="admin-input-group">
                                <label>Stock Inicial</label>
                                <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required min="0" />
                            </div>
                        </div>
                        <div className="admin-input-group">
                            <label>Categoría</label>
                            <input type="text" placeholder="Ej: Notebooks, Celulares" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} required />
                        </div>
                        <div className="admin-input-group">
                            <label>URL de la Imagen</label>
                            <input type="url" placeholder="https://ejemplo.com/foto.jpg" value={form.imagen} onChange={e => setForm({ ...form, imagen: e.target.value })} required />
                        </div>
                        <button type="submit" className="admin-submit-btn">Guardar en Base de Datos</button>
                    </form>
                </div>

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
                                        <td className="actions-cell">
                                            <button onClick={() => openEdit(p)} className="admin-edit-btn-test">Editar</button>
                                            <button onClick={() => handleDelete(p.id)} className="admin-delete-btn">Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {editingProduct && (
                <div className="modal-overlay" onClick={closeEdit}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <h3>Editar Producto</h3>
                        <EditProductForm product={editingProduct} onCancel={closeEdit} onSave={handleSaveEdit} saving={isSaving} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;