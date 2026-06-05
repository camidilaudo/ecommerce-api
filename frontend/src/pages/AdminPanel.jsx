import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './AdminPanel.css';
import { toast } from 'react-toastify';
import { handleApiResponse } from '../utils/apiHelpers';
import CategoryManager from '../components/CategoryManager';
import { selectToken, selectUserRole } from '../features/auth/authSelectors';

/**
 * EditProductForm - Formulario de edición con soporte para múltiples fotos dinámicas.
 */
const EditProductForm = ({ product, onCancel, onSave, saving, categories }) => {
    // Inicializar lista de imágenes basada en el producto existente
    const initialImages = product.imagenes && product.imagenes.length > 0
        ? [...product.imagenes]
        : (product.imagen ? [product.imagen] : ['']);

    const [form, setForm] = useState({
        ...product,
        imagenes: initialImages
    });

    useEffect(() => {
        const imgs = product.imagenes && product.imagenes.length > 0
            ? [...product.imagenes]
            : (product.imagen ? [product.imagen] : ['']);
        setForm({ ...product, imagenes: imgs });
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    };

    const handleCategoryChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
        setForm((p) => ({ ...p, categoriaIds: selectedOptions }));
    };

    // Funciones dinámicas para imágenes
    const handleImageChange = (index, value) => {
        const newImages = [...form.imagenes];
        newImages[index] = value;
        setForm((p) => ({ ...p, imagenes: newImages }));
    };

    const addImageField = () => {
        setForm((p) => ({ ...p, imagenes: [...p.imagenes, ''] }));
    };

    const removeImageField = (index) => {
        if (form.imagenes.length <= 1) return;
        const newImages = form.imagenes.filter((_, idx) => idx !== index);
        setForm((p) => ({ ...p, imagenes: newImages }));
    };

    const submit = (e) => {
        e.preventDefault();
        if (!form.nombre || Number(form.precio) <= 0) {
            return toast.error('Nombre y precio válidos son requeridos');
        }
        if (!form.categoriaIds || form.categoriaIds.length === 0) {
            return toast.error('Selecciona al menos una categoría');
        }

        const validImages = form.imagenes.filter(img => img.trim() !== '');
        if (validImages.length === 0) {
            return toast.error('Por favor, ingresá al menos una URL de imagen válida');
        }

        onSave({
            ...form,
            precio: Number(form.precio),
            stock: Number(form.stock),
            imagenes: validImages,
            imagen: validImages[0], // fallback primer elemento
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
                <label>Categorías</label>
                <select multiple value={form.categoriaIds || []} onChange={handleCategoryChange}>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.nombre}
                        </option>
                    ))}
                </select>
            </div>

            {/* Listado dinámico de imágenes */}
            <div className="admin-input-group">
                <label>Imágenes del Producto (URLs)</label>
                {form.imagenes.map((img, index) => (
                    <div key={index} className="admin-image-input-row" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                            type="url"
                            placeholder="https://ejemplo.com/foto.jpg"
                            value={img}
                            onChange={(e) => handleImageChange(index, e.target.value)}
                            required={index === 0}
                            style={{ flexGrow: 1 }}
                        />
                        {form.imagenes.length > 1 && (
                            <button
                                type="button"
                                className="admin-remove-image-btn"
                                onClick={() => removeImageField(index)}
                                style={{ background: '#ff3b30', color: 'white', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    className="admin-add-image-btn"
                    onClick={addImageField}
                    style={{ background: '#0071e3', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px', marginTop: '4px' }}
                >
                    + Agregar otra foto
                </button>
            </div>

            <div className="edit-actions">
                <button type="button" className="admin-edit-cancel-btn" onClick={onCancel}>
                    Cancelar
                </button>
                <button type="submit" className="admin-edit-submit-btn" disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
            </div>
        </form>
    );
};

/**
 * AdminPanel - Panel Principal de Gestión de Productos.
 */
const AdminPanel = () => {
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        categoriaIds: [],
        imagenes: ['']
    });

    const [editingProduct, setEditingProduct] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    const [stats, setStats] = useState({
        totalSales: 0.0,
        totalUsers: 0,
        totalProducts: 0,
        totalStock: 0
    });

    // Token y rol desde Redux — NO más localStorage.getItem()
    const token = useSelector(selectToken);
    const storedRole = useSelector(selectUserRole);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        const role = storedRole;
        if (role !== 'ADMIN') {
            navigate('/');
            return;
        }
        fetchProducts();
        fetchCategories();
    }, [token, navigate]);

    const fetchStats = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/admin/stats', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (err) {
            console.error('Error fetching admin stats:', err.message);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8081/api/productos');
            const data = await handleApiResponse(response);
            setProductos(data || []);
            setCurrentPage(1);
            fetchStats();
        } catch (err) {
            console.error('Error Admin:', err.message);
            toast.error(`No se pudo sincronizar catálogo: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/categorias');
            const data = await handleApiResponse(response);
            setCategories(data || []);
        } catch (err) {
            console.error('Error fetching categories:', err.message);
        }
    };

    // Funciones dinámicas para imágenes en el alta
    const handleImageChange = (index, value) => {
        const newImages = [...form.imagenes];
        newImages[index] = value;
        setForm({ ...form, imagenes: newImages });
    };

    const addImageField = () => {
        setForm({ ...form, imagenes: [...form.imagenes, ''] });
    };

    const removeImageField = (index) => {
        if (form.imagenes.length <= 1) return;
        const newImages = form.imagenes.filter((_, idx) => idx !== index);
        setForm({ ...form, imagenes: newImages });
    };

    const handleCreate = async (e) => {
        e.preventDefault();

        // Validar que al menos una categoría esté seleccionada
        if (!form.categoriaIds || form.categoriaIds.length === 0) {
            toast.error('Selecciona al menos una categoría');
            return;
        }

        const validImages = form.imagenes.filter(img => img.trim() !== '');
        if (validImages.length === 0) {
            toast.error('Por favor, ingresá al menos una URL de imagen válida');
            return;
        }

        try {
            const payload = {
                ...form,
                precio: Number(form.precio),
                stock: Number(form.stock),
                imagenes: validImages,
                imagen: validImages[0]
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
            setForm({ nombre: '', descripcion: '', precio: '', stock: '', categoriaIds: [], imagenes: [''] });
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

    const getPaginatedProducts = () => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return productos.slice(startIndex, endIndex);
    };

    const getTotalPages = () => {
        return Math.ceil(productos.length / ITEMS_PER_PAGE);
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

            {/* Dashboard de Estadísticas y KPIs */}
            <div className="admin-kpi-grid">
                <div className="admin-kpi-card">
                    <div className="kpi-icon">💰</div>
                    <div className="kpi-content">
                        <span className="kpi-label">Facturación Total</span>
                        <h3 className="kpi-value">${stats.totalSales.toFixed(2)}</h3>
                    </div>
                </div>
                <div className="admin-kpi-card">
                    <div className="kpi-icon">👥</div>
                    <div className="kpi-content">
                        <span className="kpi-label">Clientes Registrados</span>
                        <h3 className="kpi-value">{stats.totalUsers}</h3>
                    </div>
                </div>
                <div className="admin-kpi-card">
                    <div className="kpi-icon">🛍️</div>
                    <div className="kpi-content">
                        <span className="kpi-label">Publicaciones</span>
                        <h3 className="kpi-value">{stats.totalProducts}</h3>
                    </div>
                </div>
                <div className="admin-kpi-card">
                    <div className="kpi-icon">📦</div>
                    <div className="kpi-content">
                        <span className="kpi-label">Stock General</span>
                        <h3 className="kpi-value">{stats.totalStock} u</h3>
                    </div>
                </div>
            </div>

            <div className="admin-grid">
                <div>
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
                                    <input type="number" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} required min="1" step="0.01" />
                                </div>
                                <div className="admin-input-group">
                                    <label>Stock Inicial</label>
                                    <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required min="0" />
                                </div>
                            </div>
                            <div className="admin-input-group">
                                <label>Categorías (Ctrl+click para múltiples)</label>
                                <select
                                    multiple
                                    value={form.categoriaIds}
                                    onChange={e => {
                                        const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
                                        setForm({ ...form, categoriaIds: selectedOptions });
                                    }}
                                    required
                                >
                                    <option value="" disabled>Selecciona categorías</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Listado dinámico de imágenes */}
                            <div className="admin-input-group">
                                <label>Imágenes del Producto (URLs)</label>
                                {form.imagenes.map((img, index) => (
                                    <div key={index} className="admin-image-input-row" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                        <input
                                            type="url"
                                            placeholder="https://ejemplo.com/foto.jpg"
                                            value={img}
                                            onChange={(e) => handleImageChange(index, e.target.value)}
                                            required={index === 0}
                                            style={{ flexGrow: 1 }}
                                        />
                                        {form.imagenes.length > 1 && (
                                            <button
                                                type="button"
                                                className="admin-remove-image-btn"
                                                onClick={() => removeImageField(index)}
                                                style={{ background: '#ff3b30', color: 'white', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer' }}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="admin-add-image-btn"
                                    onClick={addImageField}
                                    style={{ background: '#0071e3', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px', marginTop: '4px' }}
                                >
                                    + Agregar otra foto
                                </button>
                            </div>

                            <button type="submit" className="admin-submit-btn">Guardar producto</button>
                        </form>
                    </div>

                    <CategoryManager token={token} />
                </div>

                <div className="admin-card">
                    <h3>Inventario Disponible</h3>
                    {loading ? (
                        <p className="admin-loading">Sincronizando con base de datos de Docker...</p>
                    ) : productos.length === 0 ? (
                        <p className="admin-empty">No hay productos registrados en el sistema.</p>
                    ) : (
                        <>
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
                                    {getPaginatedProducts().map(p => (
                                        <tr key={p.id}>
                                            <td className="table-name-cell">{p.nombre}</td>
                                            <td>${p.precio}</td>
                                            <td className={p.stock === 0 ? "stock-out" : ""}>{p.stock} u</td>
                                            <td className="actions-cell">
                                                <button onClick={() => openEdit(p)} className="admin-edit-btn">Editar</button>
                                                <button onClick={() => handleDelete(p.id)} className="admin-delete-btn">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                             </div>
                            {getTotalPages() > 1 && (
                                <div className="pagination-controls">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="pagination-btn"
                                    >
                                        Anterior
                                    </button>
                                    <span className="pagination-info">
                                        Página {currentPage} de {getTotalPages()}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, getTotalPages()))}
                                        disabled={currentPage === getTotalPages()}
                                        className="pagination-btn"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {editingProduct && (
                <div className="modal-overlay" onClick={closeEdit}>
                    <div className="admin-card" onClick={(e) => e.stopPropagation()}>
                        <h3>Editar Producto</h3>
                        <EditProductForm product={editingProduct} onCancel={closeEdit} onSave={handleSaveEdit} saving={isSaving} categories={categories} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;