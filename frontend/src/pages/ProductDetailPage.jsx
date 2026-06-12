import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSelectors';
import { selectFavoriteItems } from '../features/favorites/favoritesSelectors';
import { addToCart } from '../features/cart/cartThunks';
import { toggleFavorite } from '../features/favorites/favoritesSlice';
import {
    fetchProductById,
    fetchProductsByCategory,
    clearSelectedProduct,
} from '../features/products/productsSlice';
import {
    selectSelectedProduct,
    selectRelatedProducts,
    selectProductsLoading,
    selectProductsLoadingRelated,
    selectProductsError,
} from '../features/products/productsSelectors';
import { toast } from 'react-toastify';
import './ProductDetailPage.css';

/**
 * ProductDetailPage - Vista de Detalle del Producto.
 * Permite ver fotos ampliadas, descripción, stock real y agregar cantidades seleccionadas al carrito.
 * Los datos (producto, recomendados, loading, error) viven en productsSlice;
 * acá solo queda estado de UI (imagen seleccionada, cantidad, adding).
 */
const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Estado desde Redux
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const favoriteItems = useSelector(selectFavoriteItems);
    const product = useSelector(selectSelectedProduct);
    const loading = useSelector(selectProductsLoading);
    const error = useSelector(selectProductsError);
    const relatedProducts = useSelector(selectRelatedProducts);
    const loadingRelated = useSelector(selectProductsLoadingRelated);

    // Estado de UI puro — se mantiene local.
    // selectedImage guarda el id del producto para invalidarse sola al navegar
    // a otro detalle (la imagen visible se deriva en render, sin useEffect).
    const [selectedImage, setSelectedImage] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    // Carga del detalle; al desmontar se limpia para evitar el flash
    // del producto anterior cuando se navega a otro detalle.
    useEffect(() => {
        dispatch(fetchProductById(id));
        return () => {
            dispatch(clearSelectedProduct());
        };
    }, [id, dispatch]);

    // Fetch de productos recomendados de la misma categoría.
    // El extraReducer excluye el producto actual y limita a 4 sugerencias.
    useEffect(() => {
        if (!product || !product.categoriaIds || product.categoriaIds.length === 0) return;
        dispatch(fetchProductsByCategory(product.categoriaIds[0]));
    }, [product, dispatch]);

    const handleAddToCart = async () => {
        if (!product) return;
        if (product.stock === 0) {
            toast.error('Lo sentimos, este producto no tiene stock disponible.');
            return;
        }
        if (quantity > product.stock) {
            toast.error(`Solo quedan ${product.stock} unidades en inventario.`);
            return;
        }

        setAdding(true);
        try {
            // .unwrap(): lanza el mensaje de rejectWithValue si la operación falla
            await dispatch(addToCart({ product, quantity })).unwrap();
            toast.success(`¡Agregamos ${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} al carrito! 🛒`);
        } catch (err) {
            console.error(err);
            toast.error(err);
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <div className="product-detail-page page container">
                <div className="skeleton-back-btn"></div>
                <div className="product-detail-grid">
                    <div className="skeleton-image-gallery">
                        <div className="skeleton-main-image"></div>
                        <div className="skeleton-thumbnails">
                            {[1, 2, 3].map(i => <div key={i} className="skeleton-thumb"></div>)}
                        </div>
                    </div>
                    <div className="skeleton-info-panel">
                        <div className="skeleton-title"></div>
                        <div className="skeleton-category"></div>
                        <div className="skeleton-price"></div>
                        <div className="skeleton-desc"></div>
                        <div className="skeleton-desc"></div>
                        <div className="skeleton-desc-short"></div>
                        <div className="skeleton-action-bar"></div>
                    </div>
                </div>
            </div>
        );
    }

    // El error del slice es global: solo aplica acá si el detalle no llegó a cargar
    if (error && !product) {
        return (
            <div className="product-detail-page page container status-container">
                <h2>Error de Carga</h2>
                <p>{error}</p>
                <button className="btn-retry" onClick={() => navigate('/')}>
                    Volver al Catálogo
                </button>
            </div>
        );
    }

    if (!product) return null;

    // Preparar lista de imágenes única (combina imagenes y fallback de imagen)
    const imagesList = product.imagenes && product.imagenes.length > 0
        ? product.imagenes.filter(img => img.trim() !== '')
        : (product.imagen ? [product.imagen] : ['https://via.placeholder.com/600x600?text=Sin+Imagen']);

    // Imagen visible: la elegida por el usuario (si corresponde a este producto)
    // o la primera de la galería como default.
    const mainImage = selectedImage && selectedImage.productId === product.id
        ? selectedImage.url
        : imagesList[0];

    return (
        <div className="product-detail-page page container">
            <button className="btn-back" onClick={() => navigate(-1)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Volver al catálogo
            </button>

            <div className="product-detail-grid">
                {/* Panel Izquierdo: Galería de Fotos */}
                <div className="gallery-section">
                    <div className="main-image-container">
                        <img src={mainImage} alt={product.nombre} className="main-product-image" />
                    </div>
                    {imagesList.length > 1 && (
                        <div className="thumbnails-container">
                            {imagesList.map((img, idx) => (
                                <button
                                    key={idx}
                                    className={`thumb-btn ${mainImage === img ? 'active' : ''}`}
                                    onClick={() => setSelectedImage({ productId: product.id, url: img })}
                                >
                                    <img src={img} alt={`Miniatura ${idx + 1}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Panel Derecho: Información y Acción */}
                <div className="info-section">
                    <span className="detail-category">{product.categoria || 'Sin Categoría'}</span>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '18px' }}>
                        <h1 className="detail-title" style={{ margin: 0 }}>{product.nombre}</h1>
                        <button 
                            className="detail-favorite-btn"
                            onClick={() => {
                                const isFav = favoriteItems.some(item => item.id === product.id);
                                dispatch(toggleFavorite(product));
                                if (isFav) {
                                    toast.info(`"${product.nombre}" eliminado de favoritos 💔`);
                                } else {
                                    toast.success(`"${product.nombre}" agregado a favoritos ❤️`);
                                }
                            }}
                            style={{
                                background: 'rgba(255,255,255,0.85)',
                                border: '1px solid #e5e5e7',
                                borderRadius: '50%',
                                width: '46px',
                                height: '46px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s, background-color 0.2s',
                                outline: 'none',
                                flexShrink: 0,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.08)';
                                e.currentTarget.style.borderColor = '#ff2d55';
                                e.currentTarget.style.backgroundColor = 'rgba(255, 45, 85, 0.04)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.borderColor = '#e5e5e7';
                                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.85)';
                            }}
                        >
                            <svg 
                                width="24" 
                                height="24" 
                                viewBox="0 0 24 24" 
                                fill={favoriteItems.some(item => item.id === product.id) ? '#ff2d55' : 'none'} 
                                stroke={favoriteItems.some(item => item.id === product.id) ? '#ff2d55' : '#1d1d1f'} 
                                strokeWidth="2"
                                style={{ transition: 'fill 0.2s, stroke 0.2s' }}
                            >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="detail-price-row">
                        <span className="detail-price">${product.precio.toFixed(2)}</span>
                        <span className={`detail-stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                            {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
                        </span>
                    </div>

                    <div className="detail-divider"></div>

                    <div className="detail-description-box">
                        <h3>Descripción</h3>
                        <p>{product.descripcion || 'No se proporcionó una descripción para este producto.'}</p>
                    </div>

                    <div className="detail-divider"></div>

                    {/* Fila de Compra */}
                    {product.stock > 0 ? (
                        isAuthenticated ? (
                            <div className="buy-controls-panel">
                                <div className="quantity-selector-wrapper">
                                    <label htmlFor="qty-select">Cantidad:</label>
                                    <div className="qty-controls">
                                        <button 
                                            onClick={() => setQuantity(prev => Math.max(prev - 1, 1))}
                                            disabled={quantity <= 1}
                                            className="qty-btn"
                                        >
                                            −
                                        </button>
                                        <span className="qty-val">{quantity}</span>
                                        <button 
                                            onClick={() => setQuantity(prev => Math.min(prev + 1, product.stock))}
                                            disabled={quantity >= product.stock}
                                            className="qty-btn"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <button 
                                    className="btn-add-to-cart" 
                                    onClick={handleAddToCart}
                                    disabled={adding}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px'}}>
                                        <circle cx="9" cy="21" r="1"></circle>
                                        <circle cx="20" cy="21" r="1"></circle>
                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                    </svg>
                                    {adding ? 'Agregando...' : 'Agregar al carrito'}
                                </button>
                            </div>
                        ) : (
                            <div className="login-required-banner">
                                <div className="login-required-info">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2" style={{flexShrink: 0, marginTop: '2px'}}>
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                    </svg>
                                    <div className="login-required-text">
                                        <span className="login-required-title">Iniciá sesión para comprar</span>
                                        <p className="login-required-desc">Debes tener una cuenta activa para poder comprar este producto. ¡Iniciá sesión o regístrate en segundos!</p>
                                    </div>
                                </div>
                                <button className="btn-login-cta" onClick={() => navigate('/login')}>
                                    Iniciar Sesión
                                </button>
                            </div>
                        )
                    ) : (
                        <div className="out-of-stock-alert">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2" style={{marginRight: '12px'}}>
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <div>
                                <span className="alert-title">Artículo Agotado</span>
                                <p className="alert-desc">Este artículo no cuenta con stock en este momento. Habilitaremos la compra una vez que el vendedor reponga stock.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Productos Recomendados de la misma Categoría */}
            <div className="detail-divider" style={{ margin: '40px 0' }}></div>
            
            <div className="related-products-section" style={{ paddingBottom: '40px' }}>
                <h2 style={{
                    fontSize: '22px',
                    fontWeight: '700',
                    color: 'var(--color-text)',
                    marginBottom: '20px',
                    letterSpacing: '-0.5px'
                }}>
                    Productos Recomendados
                </h2>
                
                {loadingRelated ? (
                    <div style={{ display: 'flex', gap: '16px' }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ flex: 1, height: '240px', background: 'var(--color-skeleton-bg)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
                        ))}
                    </div>
                ) : relatedProducts.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: '24px'
                    }}>
                        {relatedProducts.map(item => {
                            const itemImage = (item.imagenes && item.imagenes.length > 0) ? item.imagenes[0] : (item.imagen || 'https://via.placeholder.com/600x600?text=Sin+Imagen');
                            return (
                                <div 
                                    key={item.id} 
                                    onClick={() => {
                                        navigate(`/productos/${item.id}`);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    style={{
                                        background: 'var(--color-bg-secondary)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '16px',
                                        padding: '16px',
                                        cursor: 'pointer',
                                        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.06)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.02)';
                                    }}
                                >
                                    <div style={{
                                        aspectRatio: '1',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        background: 'var(--color-bg-tertiary)',
                                        marginBottom: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <img 
                                            src={itemImage} 
                                            alt={item.nombre} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                    </div>
                                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                                        {item.categoria}
                                    </span>
                                    <h3 style={{
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        color: 'var(--color-text)',
                                        margin: '4px 0 8px 0',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {item.nombre}
                                    </h3>
                                    <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text)' }}>
                                        ${item.precio.toFixed(2)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>No hay otros productos recomendados en esta categoría.</p>
                )}
            </div>
        </div>
    );
};

export default ProductDetailPage;
