/**
 * categoriesSelectors.js — Selectores reutilizables para el slice de categorías.
 */

/** Retorna el array de objetos { id, nombre } de categorías */
export const selectCategories = (state) => state.categories.items;

/**
 * Retorna las categorías como array de nombres para los filtros de HomePage.
 * Incluye "Todos" al inicio (equivalente al comportamiento anterior de Categorias.jsx).
 */
export const selectCategoryNames = (state) =>
    ['Todos', ...state.categories.items.map((cat) => cat.nombre)];

/** Retorna true mientras fetchCategories / createCategory / deleteCategory está en curso */
export const selectCategoriesLoading = (state) => state.categories.loading;

/** Retorna el mensaje del último error (null si no hay) */
export const selectCategoriesError = (state) => state.categories.error;
