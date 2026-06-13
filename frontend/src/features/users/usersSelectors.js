/**
 * usersSelectors.js — Selectores reutilizables para el slice de usuarios.
 */

// ── Lista de usuarios ─────────────────────────────────────────────────────────

/** Retorna el array de usuarios registrados */
export const selectUsers = (state) => state.users.items;

/** Retorna true mientras fetchUsers está en curso */
export const selectUsersLoading = (state) => state.users.loading;

/** Retorna el mensaje del último error de carga (null si no hay) */
export const selectUsersError = (state) => state.users.error;

/** Retorna el ID del usuario actualmente siendo procesado por toggleUserActive */
export const selectActionLoadingId = (state) => state.users.actionLoadingId;

// ── Estadísticas admin ────────────────────────────────────────────────────────

/** Retorna el objeto de estadísticas globales (null si no cargaron aún) */
export const selectAdminStats = (state) => state.users.stats;

/** Retorna true mientras fetchAdminStats está en curso */
export const selectLoadingStats = (state) => state.users.loadingStats;
