import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createCategory, deleteCategory } from '../features/categories/categoriesSlice';
import {
    selectCategories,
    selectCategoriesLoading,
} from '../features/categories/categoriesSelectors';

/**
 * CategoryManager — Gestión de categorías en el AdminPanel.
 *
 * Migración: fetch local (GET, POST, DELETE) → categoriesSlice Redux.
 * - La lista de categorías ya está en Redux (cargada por AdminPanel al montar).
 * - createCategory y deleteCategory actualizan el store localmente sin re-fetch.
 * - Elimina la prop `token` (authFetch la lee del store internamente).
 */
const CategoryManager = () => {
    const dispatch = useDispatch();

    // categorías y estado de carga desde Redux
    const categories = useSelector(selectCategories);
    const loading = useSelector(selectCategoriesLoading);

    const [newCategoryName, setNewCategoryName] = useState('');

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) {
            toast.error('Ingresa un nombre de categoría');
            return;
        }
        try {
            await dispatch(createCategory(newCategoryName.trim())).unwrap();
            toast.success('Categoría creada exitosamente');
            setNewCategoryName('');
        } catch (err) {
            toast.error(`No se pudo crear la categoría: ${err}`);
        }
    };

    const handleDeleteCategory = async (id, nombre) => {
        if (!window.confirm(`¿Eliminar categoría "${nombre}"?`)) return;
        try {
            await dispatch(deleteCategory(id)).unwrap();
            toast.success('Categoría eliminada');
        } catch (err) {
            toast.error(`No se pudo eliminar la categoría: ${err}`);
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
                        disabled={loading}
                    />
                </div>
                <button type="submit" className="admin-submit-btn" disabled={loading}>
                    {loading ? 'Creando...' : 'Crear Categoría'}
                </button>
            </form>

            {/* Lista de categorías */}
            <div className="categories-list">
                <h4>Categorías Disponibles</h4>
                {loading && categories.length === 0 ? (
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
                                    disabled={loading}
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
