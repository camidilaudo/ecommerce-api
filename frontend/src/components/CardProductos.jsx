import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

// Selectores
import { selectFavoriteItems } from '../features/favorites/favoritesSelectors';

// Acciones y thunks
import { addToCart } from '../features/cart/cartThunks';
import { toggleFavorite } from '../features/favorites/favoritesSlice';

import './CardProductos.css';

/**
 * CardProductos — Tarjeta de producto del catálogo.
 *
 * MIGRADO:
 * - useCart() → dispatch(addToCartThunk(...))
 * - useFavorites() → useSelector(selectFavoriteItems) + dispatch(toggleFavorite(...))
 *
 * La notificación de favoritos se mantiene aquí (misma UX que el Context original).
 */
const CardProductos = ({ product, index = 0 }) => {
    const dispatch = useDispatch();
    const favoriteItems = useSelector(selectFavoriteItems);
    const [agregado, setAgregado] = useState(false);

    const isFavorite = favoriteItems.some((item) => item.id === product.id);

    // Stagger: cada card entra 60ms después de la anterior (max 12 cards)
    const delay = `${Math.min(index, 12) * 60}ms`;

    const handleAgregar = () => {
        // El toast es efecto de UI: vive acá, no en el thunk (createAsyncThunk)
        dispatch(addToCart({ product }))
            .unwrap()
            .then(() => toast.success(`¡"${product.nombre}" agregado al carrito! 🛒`))
            .catch((err) => toast.error(err));
        setAgregado(true);
        setTimeout(() => setAgregado(false), 1500);
    };

    const handleToggleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(toggleFavorite(product));

        // Notificación: detectar si era favorito antes del dispatch
        if (isFavorite) {
            toast.info(`"${product.nombre}" eliminado de favoritos 💔`);
        } else {
            toast.success(`"${product.nombre}" agregado a favoritos ❤️`);
        }
    };

    return (
        <div className="card-producto" style={{ animationDelay: delay }}>
            <div className="producto-imagen-link" style={{ position: 'relative' }}>
                <Link to={`/productos/${product.id}`}>
                    <div className="producto-imagen-container">
                        <img
                            src={product.imagen}
                            alt={product.nombre}
                            className="producto-imagen"
                        />
                        <span className="producto-categoria">{product.categoria}</span>
                    </div>
                </Link>

                {/* Botón de Favoritos */}
                <button
                    className="card-favorite-btn"
                    onClick={handleToggleFavorite}
                    style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(4px)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, background 0.2s',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        zIndex: '5',
                        outline: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill={isFavorite ? '#ff2d55' : 'none'}
                        stroke={isFavorite ? '#ff2d55' : '#1d1d1f'}
                        strokeWidth="2"
                        style={{ transition: 'fill 0.2s, stroke 0.2s' }}
                    >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                </button>
            </div>

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