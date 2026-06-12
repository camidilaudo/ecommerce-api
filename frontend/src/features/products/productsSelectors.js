/**
 * productsSelectors.js — Selectores reutilizables para el slice de productos.
 */

/** Retorna el catálogo completo */
export const selectProducts = (state) => state.products.items;

/** Retorna el producto de la vista de detalle (null si no hay) */
export const selectSelectedProduct = (state) => state.products.selectedProduct;

/** Retorna los productos recomendados (misma categoría que el detalle) */
export const selectRelatedProducts = (state) => state.products.relatedProducts;

/** Retorna si hay una operación principal de productos en curso */
export const selectProductsLoading = (state) => state.products.loading;

/** Retorna si la carga de recomendados está en curso */
export const selectProductsLoadingRelated = (state) => state.products.loadingRelated;

/** Retorna el mensaje del último error (null si no hay) */
export const selectProductsError = (state) => state.products.error;

/** Selector parametrizado: busca un producto del catálogo por id */
export const selectProductById = (id) => (state) =>
    state.products.items.find((p) => p.id === id);
