import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { handleApiResponse } from '../utils/apiHelpers';

/**
 * CategoryManager - Componente para crear y listar categorías.
 * Solo disponible para usuarios con rol ADMIN.
 */
const CategoryManager = ({ token }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Cargar categorías al montar el componente
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8081/api/categorias');
            const data = await handleApiResponse(response);
            setCategories(data || []);
        } catch (err) {
            console.error('Error fetching categories:', err.message);
            toast.error(`No se pudo cargar las categorías: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();

        // Validación
        if (!newCategoryName.trim()) {
            toast.error('Ingresa un nombre de categoría');
            return;
        }

        try {
            setIsCreating(true);
            const response = await fetch('http://localhost:8081/api/categorias', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ nombre: newCategoryName.trim() })
            });

            await handleApiResponse(response);
            toast.success('Categoría creada exitosamente');
            setNewCategoryName('');
            fetchCategories(); // Recargar lista
        } catch (err) {
            console.error('Error creating category:', err.message);
            toast.error(`No se pudo crear la categoría: ${err.message}`);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteCategory = async (id, nombre) => {
        if (!window.confirm(`¿Eliminar categoría "${nombre}"?`)) return;

        try {
            const response = await fetch(`http://localhost:8081/api/categorias/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            await handleApiResponse(response);
            toast.success('Categoría eliminada');
            fetchCategories(); // Recargar lista
        } catch (err) {
            console.error('Error deleting category:', err.message);
            toast.error(`No se pudo eliminar la categoría: ${err.message}`);
        }
    };

    return (
        <div className="admin-card">
            <h3>Gestión de Categorías</h3>

            {/* Formulario para crear categoría */}
            <form onSubmit={handleCreateCategory} className="admin-form">
                <div className="admin-input-group">
                    <label>Nombre de Categoría</label>
                    <input
                        type="text"
                        placeholder="Ej: Notebooks, Celulares, Accesorios"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        disabled={isCreating}
                    />
                </div>
                <button type="submit" className="admin-submit-btn" disabled={isCreating}>
                    {isCreating ? 'Creando...' : 'Crear Categoría'}
                </button>
            </form>

            {/* Lista de categorías */}
            <div className="categories-list">
                <h4>Categorías Disponibles</h4>
                {loading ? (
                    <p className="admin-loading">Cargando categorías...</p>
                ) : categories.length === 0 ? (
                    <p className="admin-empty">No hay categorías registradas aún.</p>
                ) : (
                    <ul className="categories-ul">
                        {categories.map((cat) => (
                            <li key={cat.id} className="category-item">
                                <span>{cat.nombre}</span>
                                <button
                                    type="button"
                                    className="admin-delete-btn"
                                    onClick={() => handleDeleteCategory(cat.id, cat.nombre)}
                                >
                                    Eliminar
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default CategoryManager;

