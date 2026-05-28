import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import './ProductDetailPage.css';

/**
 * ProductDetailPage - Vista de Detalle del Producto.
 * Permite ver fotos ampliadas, descripción, stock real y agregar cantidades seleccionadas al carrito.
 */
const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    // Productos recomendados
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loadingRelated, setLoadingRelated] = useState(false);

    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:8081/api/productos/${id}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('El artículo solicitado no existe.');
                    }
                    throw new Error('Error al conectar con el servidor.');
                }
                const data = await response.json();
                setProduct(data);
                
                // Inicializar imagen seleccionada
                if (data.imagenes && data.imagenes.length > 0) {
                    setSelectedImage(data.imagenes[0]);
                } else if (data.imagen) {
                    setSelectedImage(data.imagen);
                } else {
                    setSelectedImage('https://via.placeholder.com/600x600?text=Sin+Imagen');
                }
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetail();
    }, [id]);

    // Fetch de productos recomendados de la misma categoría
    useEffect(() => {
        if (!product || !product.categoriaIds || product.categoriaIds.length === 0) return;
        
        const fetchRelated = async () => {
            try {
                setLoadingRelated(true);
                const response = await fetch(`http://localhost:8081/api/productos/categoria/${product.categoriaIds[0]}`);
                if (response.ok) {
                    const data = await response.json();
                    // Filtrar el propio producto y limitar a 4 sugerencias
                    const filtered = data.filter(p => p.id !== product.id).slice(0, 4);
                    setRelatedProducts(filtered);
                }
            } catch (err) {
                console.error("Error fetching related products:", err);
            } finally {
                setLoadingRelated(false);
            }
        };

        fetchRelated();
    }, [product?.id]);

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
            await addToCart(product, quantity, false);
            toast.success(`¡Agregamos ${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} al carrito! 🛒`);
        } catch (err) {
            console.error(err);
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

    if (error) {
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
                        <img src={selectedImage} alt={product.nombre} className="main-product-image" />
                    </div>
                    {imagesList.length > 1 && (
                        <div className="thumbnails-container">
                            {imagesList.map((img, idx) => (
                                <button
                                    key={idx}
                                    className={`thumb-btn ${selectedImage === img ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(img)}
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
                    <h1 className="detail-title">{product.nombre}</h1>
                    
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
                    color: '#1d1d1f',
                    marginBottom: '20px',
                    letterSpacing: '-0.5px'
                }}>
                    Productos Recomendados
                </h2>
                
                {loadingRelated ? (
                    <div style={{ display: 'flex', gap: '16px' }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ flex: 1, height: '240px', background: '#f5f5f7', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
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
                                        navigate(`/producto/${item.id}`);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.7)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
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
                                        background: '#f5f5f7',
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
                                    <span style={{ fontSize: '11px', color: '#86868b', textTransform: 'uppercase', fontWeight: '600' }}>
                                        {item.categoria}
                                    </span>
                                    <h3 style={{
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        color: '#1d1d1f',
                                        margin: '4px 0 8px 0',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {item.nombre}
                                    </h3>
                                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#1d1d1f' }}>
                                        ${item.precio.toFixed(2)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p style={{ color: '#86868b', fontSize: '14px' }}>No hay otros productos recomendados en esta categoría.</p>
                )}
            </div>
        </div>
    );
};

export default ProductDetailPage;
