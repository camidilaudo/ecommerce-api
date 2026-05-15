import React from 'react';
import { useCart } from '../context/CartContext'; // Importamos el contexto
import './CardProductos.css';

/**
 * Componente Tarjeta de Producto.
 * Utiliza el context para agregar productos al carrito.
 */
const CardProductos = ({ product }) => {
  const { addToCart } = useCart(); // Accedemos a la función global

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
            {/* Al hacer click, llamamos a la función del context */}
            <button
                className="btn-agregar"
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
            >
              {product.stock > 0 ? 'Agregar' : 'Sin Stock'}
            </button>
          </div>
        </div>
      </div>
  );
};

export default CardProductos;