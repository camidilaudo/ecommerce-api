import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectFavoriteItems } from '../features/favorites/favoritesSelectors';
import { selectProducts } from '../features/products/productsSelectors';
import { fetchProducts } from '../features/products/productsSlice';
import CardProductos from '../components/CardProductos';
import './Favorite.css';

/**
 * Favorite - Página de Favoritos (Trabajo Práctico Grupal TPG).
 * Permite visualizar de manera persistente los productos favoritos del usuario.
 *
 * El stock/precio real se obtiene cruzando favoritos con el catálogo de
 * productsSlice (antes hacía su propio fetch a /api/productos con useState).
 */
const Favorite = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // Favoritos desde Redux — unica fuente de verdad
    const favoriteItems = useSelector(selectFavoriteItems);
    const products = useSelector(selectProducts);

    // Refresca el catálogo al entrar para mostrar stock/precios reales
    React.useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    // Cruzar IDs para inyectar stock, precios y datos reales en caliente,
    // filtrando los productos que ya no existen en el catálogo activo.
    // Mientras el catálogo no cargó, se muestran los favoritos locales (evita CLS).
    const realtimeFavorites = React.useMemo(() => {
        if (products.length === 0) return favoriteItems;

        return favoriteItems
            .map(favItem => {
                const fresh = products.find(p => p.id === favItem.id);
                if (fresh) {
                    return {
                        ...favItem,
                        stock: fresh.stock,
                        precio: fresh.precio,
                        nombre: fresh.nombre,
                        imagen: fresh.imagen,
                        descripcion: fresh.descripcion,
                        categoria: fresh.categoria,
                        rating: fresh.rating
                    };
                }
                return null;
            })
            .filter(item => item !== null);
    }, [favoriteItems, products]);

    return (
        <div className="favorite-page page container">
            {/* Botón de retroceso */}
            <button className="btn-back" onClick={() => navigate('/')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Volver al catálogo
            </button>

            <header className="favorite-header">
                <h1 className="favorite-title">Mis Favoritos</h1>
                <p className="favorite-subtitle">
                    {favoriteItems.length === 0 
                        ? 'Guarda los artículos que te encantan' 
                        : `Tienes ${favoriteItems.length} artículo${favoriteItems.length !== 1 ? 's' : ''} en tu lista`
                    }
                </p>
            </header>

            {favoriteItems.length === 0 ? (
                <div className="favorite-empty-state">
                    <div className="favorite-empty-icon-wrapper">
                        <svg 
                            width="48" 
                            height="48" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="#86868b" 
                            strokeWidth="1.5"
                            className="heart-empty-icon"
                        >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                    </div>
                    <h2>Tu lista está vacía</h2>
                    <p>
                        Navega por nuestra colección de productos tecnológicos y presiona el corazón para guardar tus artículos favoritos aquí de forma segura.
                    </p>
                    <button className="btn-explore-catalog" onClick={() => navigate('/')}>
                        Descubrir Productos
                    </button>
                </div>
            ) : (
                <div className="products-grid favorite-grid">
                    {realtimeFavorites.map((product, idx) => (
                        <CardProductos 
                            key={product.id} 
                            product={product} 
                            index={idx} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Favorite;
