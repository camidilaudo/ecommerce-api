import React, { useState, useEffect } from 'react';
import Categorias from '../components/Categorias';
import ProductList from '../components/ProductList';
import SkeletonCard from '../components/SkeletonCard';
import productsData from '../data/products.json';

const HomePage = ({ searchQuery }) => {
    const [category, setCategory] = useState('Todos');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    // Filtramos usando la búsqueda que viene de la Navbar (searchQuery)
    const filtered = productsData.filter(p => {
        const matchCat = category === 'Todos' || p.categoria === category;
        const matchSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
    });

    return (
        <div className="page">
            <header style={{ padding: '60px 0', textAlign: 'center', background: '#f5f5f7' }}>
                <h1 style={{ fontSize: '42px', fontWeight: '700' }}>Tecnología de vanguardia.</h1>
                <p style={{ color: '#86868b', fontSize: '20px' }}>Catálogo exclusivo del Grupo 3.</p>
            </header>

            {/* Pasamos el estado de categorías al componente Pills mejorado */}
            <Categorias activeCategory={category} onCategoryChange={setCategory} />

            <main className="container" style={{ padding: '40px 20px' }}>
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