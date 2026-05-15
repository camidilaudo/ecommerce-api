import CardProductos from './CardProductos';
import './ProductList.css';

const ProductList = ({ products, activeCategory }) => {
    return (
        <section className="product-list-container" id="productos">

            {/* Encabezado con título dinámico y contador de resultados */}
            <div className="product-list-header">
                <h2 className="product-list-title">
                    {activeCategory === 'Todos' ? 'Todos los productos' : activeCategory}
                </h2>
                <span className="product-list-count">
                    {products.length} producto{products.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Estado vacío: cuando la búsqueda o el filtro no tienen resultados */}
            {products.length === 0 ? (
                <p className="product-list-empty">
                    No se encontraron productos. 🔍
                </p>
            ) : (
                <div className="products-grid">
                    {products.map((product) => (
                        <CardProductos key={product.id} product={product} />
                    ))}
                </div>
            )}

        </section>
    );
};

export default ProductList;