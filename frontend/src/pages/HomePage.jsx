import React, { useState, useEffect } from 'react';
import Categorias from '../components/Categorias';
import ProductList from '../components/ProductList';
import SkeletonCard from '../components/SkeletonCard';
import '../components/ProductList.css'; // Importamos el CSS donde ahora vive .home-hero

/**
 * HomePage - Punto de entrada del catálogo.
 * Utiliza useEffect para consumir el endpoint GET /api/productos de Spring Boot.
 */
const HomePage = ({ searchQuery }) => {
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState('Todos');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filtros de precio
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // useEffect: Vigilante de carga inicial (Clase 08)
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                // Llamada a la API real
                const response = await fetch('http://localhost:8081/api/productos');

                if (!response.ok) {
                    throw new Error('Error de comunicación con el servidor');
                }

                const data = await response.json();
                setProducts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                // Suavizamos la transición del Skeleton
                setTimeout(() => setLoading(false), 800);
            }
        };

        fetchProducts();
    }, []);

    // Lógica de filtrado (Categoría + Búsqueda Navbar + Rango de Precios)
    const filtered = products.filter(p => {
        const matchCat = category === 'Todos' || (p.categoriaNombres && p.categoriaNombres.includes(category));
        const matchSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
        
        const price = p.precio;
        const matchMin = minPrice === '' || price >= parseFloat(minPrice);
        const matchMax = maxPrice === '' || price <= parseFloat(maxPrice);
        
        return matchCat && matchSearch && matchMin && matchMax;
    });

    // Manejo de Error sin CSS en línea
    if (error) return (
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
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.03)',
                    flexWrap: 'wrap'
                }}>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: '#1d1d1f' }}>Filtrar por Precio:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '12px', color: '#86868b' }}>Mínimo ($)</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                style={{
                                    width: '100px',
                                    padding: '8px 12px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(0, 0, 0, 0.1)',
                                    background: 'rgba(250, 250, 250, 0.8)',
                                    fontSize: '13px',
                                    outline: 'none',
                                    transition: 'border 0.2s'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '12px', color: '#86868b' }}>Máximo ($)</label>
                            <input
                                type="number"
                                placeholder="Sin límite"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                style={{
                                    width: '120px',
                                    padding: '8px 12px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(0, 0, 0, 0.1)',
                                    background: 'rgba(250, 250, 250, 0.8)',
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
                                    color: '#0071e3',
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
                {loading ? (
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