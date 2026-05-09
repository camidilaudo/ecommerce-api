import React from 'react';
import products from '../data/products.json';
import CardProductos from './CardProductos';
import './ProductList.css';

const ProductList = () => {
  return (
    <div className="product-list-container">
      <h2 className="product-list-title">Nuestros Productos</h2>
      <div className="products-grid">
        {products.map((product) => (
          
          <CardProductos key={product.id} product={product} >
            <p>{product.gratis ? 'Gratis' : ''}</p>
            <p>{product.internacional ? 'Envio Internacional' : ''}</p>
          </CardProductos>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
