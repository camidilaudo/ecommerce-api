import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../features/categories/categoriesSlice';
import {
    selectCategoryNames,
    selectCategoriesLoading,
} from '../features/categories/categoriesSelectors';
import './Categorias.css';

/**
 * Categorias — Pills de filtro de categorías en la HomePage.
 *
 * Migración: fetch local → categoriesSlice (Redux).
 * Evita un fetch duplicado cuando AdminPanel o CategoryManager
 * ya cargaron las categorías en el mismo ciclo de vida de la app.
 *
 * El selector selectCategoryNames incluye 'Todos' al inicio,
 * replicando el comportamiento anterior de ['Todos', ...data.map(cat => cat.nombre)].
 */
const Categorias = ({ activeCategory, onCategoryChange }) => {
    const dispatch = useDispatch();

    // categorías (con 'Todos' prepended) y estado de carga desde Redux
    const categories = useSelector(selectCategoryNames);
    const loading = useSelector(selectCategoriesLoading);

    useEffect(() => {
        // Solo fetch si el catálogo no está en cache (solo está 'Todos')
        if (categories.length <= 1) {
            dispatch(fetchCategories());
        }
    }, [dispatch, categories.length]);

    if (loading && categories.length <= 1) {
        return (
            <div className="categories-pills container">
                <p style={{ color: '#86868b', fontSize: '14px' }}>Cargando categorías...</p>
            </div>
        );
    }

    return (
        <div className="categories-pills container">
            {categories.map(cat => (
                <button
                    key={cat}
                    className={`pill ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => onCategoryChange(cat)}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
};

export default Categorias;