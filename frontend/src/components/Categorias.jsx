import React, { useState, useEffect } from 'react';
import './Categorias.css';

const Categorias = ({ activeCategory, onCategoryChange }) => {
    const [categories, setCategories] = useState(['Todos']);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:8081/api/categorias');
                if (!response.ok) {
                    throw new Error('Error fetching categories');
                }
                const data = await response.json();
                // Agregar 'Todos' al inicio de la lista
                setCategories(['Todos', ...data.map(cat => cat.nombre)]);
            } catch (err) {
                console.error('Error fetching categories:', err);
                // Fallback a categorías vacías
                setCategories(['Todos']);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
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