import React, { Children } from 'react';
import './CardProductos.css';

const CardProductos = ({ children, product }) => {
  return (
    <div className="card-producto">
      <div className="producto-imagen-container">
        <img 
          src={product.imagen} 
          alt={product.nombre} 
          className="producto-imagen"
        />
        <span className="producto-categoria">{product.categoria}</span>
      </div>
      
      <div className="producto-info">
        <h3 className="producto-nombre">{product.nombre}</h3>
        <p className="producto-descripcion">{product.descripcion}</p>
        
        <div className="producto-rating">
          <span className="stars">⭐ {product.rating}</span>
        </div>
        
        <div className="producto-stock">
          <span className={product.stock > 0 ? 'en-stock' : 'sin-stock'}>
            {product.stock > 0 ? `Stock: ${product.stock}` : 'Agotado'}
          </span>
        </div>
        
        <div className="producto-footer">
          <span className="producto-precio">${product.precio}</span>
          <button className="btn-agregar">Agregar</button>
        </div>

        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default CardProductos;
