import './Hero.css';

// Hero — banner principal, sin sección de estadísticas
function Hero({ navigate }) {
    return (
        <section className="hero" id="inicio">

            <span className="hero-badge">Trabajo Práctico Obligatorio — UADE</span>

            <h1 className="hero-title">
                Tu tienda online,<br />
                <em>simple y rápida</em>
            </h1>

            <p className="hero-subtitle">
                Explorá nuestro catálogo de productos, filtrá por categoría
                y gestioná tus compras en un solo lugar.
            </p>

            <div className="hero-buttons">
                <button
                    className="hero-btn-primary"
                    onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}
                >
                    Ver productos
                </button>
                <button
                    className="hero-btn-ghost"
                    onClick={() => navigate('register')}
                >
                    Crear cuenta
                </button>
            </div>

        </section>
    );
}

export default Hero;