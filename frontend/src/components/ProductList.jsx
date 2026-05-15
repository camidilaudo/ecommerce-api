import React from 'react';
import CardProductos from './CardProductos';
import './ProductList.css';

/**
 * ProductList - Lista dinámica de productos.
 * Consume datos normalizados y aplica clases de ProductList.css.
 * * @param {Array} products - Lista de productos filtrados.
 * @param {string} activeCategory - Categoría actual para el título.
 */
const ProductList = ({ products, activeCategory }) => {

    // Normalización de datos (Lógica del profesor para evitar errores de API)
    const items = Array.isArray(products)
        ? products
        : products?.productos || products?.data || products?.items || [];

    return (
        <section className="product-list-container" id="productos">

            {/* Encabezado con título dinámico y contador real */}
            <div className="product-list-header">
                <h2 className="product-list-title">
                    {activeCategory === 'Todos' ? 'Todos los productos' : activeCategory}
                </h2>
                <span className="product-list-count">
                    {items.length} producto{items.length !== 1 ? 's' : ''} encontrados
                </span>
            </div>

            {/* Renderizado de la grilla o mensaje de estado vacío */}
            {items.length === 0 ? (
                <div className="product-list-empty">
                    <p>No se encontraron productos que coincidan con la selección.</p>
                </div>
            ) : (
                <div className="products-grid">
                    {items.map((product) => {
                        // Aseguramos ID único para cada tarjeta
                        const id = product.id ?? product._id ?? product.codigo;

                        return (
                            <CardProductos
                                key={id || Math.random()}
                                product={product}
                            />
                        );
                    })}
                </div>
            )}

        </section>
    );
};

export default ProductList;