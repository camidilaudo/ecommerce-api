/**
 * ordersSelectors.js — Selectores reutilizables para el slice de pedidos.
 */

/** Retorna el array de pedidos del usuario (ordenados por id desc) */
export const selectOrders = (state) => state.orders.items;

/** Retorna true mientras fetchOrders está en curso */
export const selectOrdersLoading = (state) => state.orders.loading;

/** Retorna el mensaje del último error de carga (null si no hay) */
export const selectOrdersError = (state) => state.orders.error;
