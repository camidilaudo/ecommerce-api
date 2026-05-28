import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Importamos Link para navegación
import { useCart } from '../context/CartContext'; // Importamos el contexto
import './CardProductos.css';

/**
 * Componente Tarjeta de Producto.
 * Utiliza el context para agregar productos al carrito.
 */
const CardProductos = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const [agregado, setAgregado] = useState(false);

  // Stagger: cada card entra 60ms despues de la anterior (max 12 cards)
  const delay = `${Math.min(index, 12) * 60}ms`;

  const handleAgregar = () => {
    addToCart(product);
    setAgregado(true);
    setTimeout(() => {
      setAgregado(false);
    }, 1500);
  };

  return (
      <div className="card-producto" style={{ animationDelay: delay }}>
        <Link to={`/productos/${product.id}`} className="producto-imagen-link">
          <div className="producto-imagen-container">
            <img
                src={product.imagen}
                alt={product.nombre}
                className="producto-imagen"
            />
            <span className="producto-categoria">{product.categoria}</span>
          </div>
        </Link>

        <div className="producto-info">
          <Link to={`/productos/${product.id}`} className="producto-nombre-link">
            <h3 className="producto-nombre">{product.nombre}</h3>
          </Link>
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
            {/* Al hacer click, llamamos a la función del context con animación */}
            <button
                className={`btn-agregar ${agregado ? 'agregado-exito' : ''}`}
                onClick={handleAgregar}
                disabled={product.stock === 0 || agregado}
            >
              {product.stock === 0 ? 'Sin Stock' : (agregado ? '✓ ¡Agregado!' : 'Agregar')}
            </button>
          </div>
        </div>
      </div>
  );
};

export default CardProductos;