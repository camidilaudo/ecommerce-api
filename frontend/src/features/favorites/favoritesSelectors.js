/**
 * favoritesSelectors.js — Selectores reutilizables para el slice de favoritos.
 */

/** Retorna el array de productos favoritos del usuario activo */
export const selectFavoriteItems = (state) => state.favorites.items;

/**
 * Selector de fábrica: retorna true si un producto específico es favorito.
 * Uso: const isFav = useSelector(selectIsFavorite(product.id))
 *
 * @param {number} productId
 * @returns {function} selector
 */
export const selectIsFavorite = (productId) => (state) =>
    state.favorites.items.some((item) => item.id === productId);

/** Retorna la cantidad de productos en favoritos */
export const selectFavoriteCount = (state) => state.favorites.items.length;
