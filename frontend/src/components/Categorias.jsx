import React from 'react';
import productsData from '../data/products.json';
import './Categorias.css';

const Categorias = ({ activeCategory, onCategoryChange }) => {
    const categories = ['Todos', ...new Set(productsData.map(p => p.categoria))];

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