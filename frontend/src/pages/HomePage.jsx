import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Categorias from '../components/Categorias';
import ProductList from '../components/ProductList';
import SkeletonCard from '../components/SkeletonCard';
import { fetchProducts } from '../features/products/productsSlice';
import {
    selectProducts,
    selectProductsLoading,
    selectProductsError,
} from '../features/products/productsSelectors';
import '../components/ProductList.css'; // Importamos el CSS donde ahora vive .home-hero

/**
 * HomePage - Punto de entrada del catálogo.
 * El catálogo vive en productsSlice (Redux); acá solo quedan los
 * filtros de UI (categoría, búsqueda, rango de precios).
 */
const HomePage = ({ searchQuery }) => {
    const dispatch = useDispatch();

    // Catálogo desde Redux — única fuente de verdad
    const products = useSelector(selectProducts);
    const loading = useSelector(selectProductsLoading);
    const error = useSelector(selectProductsError);

    const [category, setCategory] = useState('Todos');

    // Filtros de precio
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Carga inicial: solo si el catálogo no está cacheado en el store
    useEffect(() => {
        if (products.length === 0) {
            dispatch(fetchProducts());
        }
    }, [dispatch, products.length]);

    // Lógica de filtrado (Categoría + Búsqueda Navbar + Rango de Precios)
    const filtered = products.filter(p => {
        const matchCat = category === 'Todos' || (p.categoriaNombres && p.categoriaNombres.includes(category));
        const matchSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
        
        const price = p.precio;
        const matchMin = minPrice === '' || price >= parseFloat(minPrice);
        const matchMax = maxPrice === '' || price <= parseFloat(maxPrice);
        
        return matchCat && matchSearch && matchMin && matchMax;
    });

    // Manejo de Error sin CSS en línea.
    // Solo bloquea la vista si el catálogo no llegó a cargarse:
    // el error del slice es global y pudo originarse en otra operación.
    if (error && products.length === 0) return (
        <div className="status-container">
            <h2>Error de conexión</h2>
            <p>{error}</p>
            <button className="btn-retry" onClick={() => window.location.reload()}>
                Reintentar
            </button>
        </div>
    );

    return (
        <div className="page">
            {/* Hero Section - Ahora usa clases CSS del archivo dedicado */}
            <header className="home-hero">
                <div className="container">
                    <h1>Tecnología de vanguardia.</h1>
                    <p>Catálogo oficial Grupo 3 — Spring Boot 4.0.5</p>
                </div>
            </header>

            <Categorias activeCategory={category} onCategoryChange={setCategory} />

            {/* Panel de Filtro de Rango de Precios Premium */}
            <div className="container" style={{ margin: '20px auto 10px auto' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    padding: '16px 24px',
                    borderRadius: '16px',
                    background: 'var(--color-bg-secondary)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-sm)',
                    flexWrap: 'wrap'
                }}>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-text)' }}>Filtrar por Precio:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Mínimo ($)</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                style={{
                                    width: '100px',
                                    padding: '8px 12px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-bg)',
                                    color: 'var(--color-text)',
                                    fontSize: '13px',
                                    outline: 'none',
                                    transition: 'border 0.2s'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Máximo ($)</label>
                            <input
                                type="number"
                                placeholder="Sin límite"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                style={{
                                    width: '120px',
                                    padding: '8px 12px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-bg)',
                                    color: 'var(--color-text)',
                                    fontSize: '13px',
                                    outline: 'none',
                                    transition: 'border 0.2s'
                                }}
                            />
                        </div>
                        {(minPrice !== '' || maxPrice !== '') && (
                            <button
                                onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-accent)',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    padding: '4px 8px'
                                }}
                            >
                                Limpiar rango
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <main className="container">
                {/* Skeleton también en el primer render, antes de que dispare el dispatch */}
                {loading || (products.length === 0 && !error) ? (
                    <div className="products-grid">
                        {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                    </div>
                ) : (
                    <ProductList products={filtered} activeCategory={category} />
                )}
            </main>
        </div>
    );
};

export default HomePage;