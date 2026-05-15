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

    // Lógica de filtrado (Categoría + Búsqueda Navbar)
    const filtered = products.filter(p => {
        const matchCat = category === 'Todos' || p.categoria === category;
        const matchSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
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