/**
 * authSelectors.js — Selectores reutilizables para el slice de autenticación.
 *
 * Ventajas de usar selectores en lugar de acceder al estado directamente:
 * 1. Punto único de verdad: si el shape del estado cambia, solo se actualiza aquí.
 * 2. Composición: los selectores pueden combinarse para crear selectores derivados.
 * 3. Rendimiento: al usarse con useSelector(), React-Redux aplica igualdad referencial
 *    por defecto, evitando re-renders innecesarios.
 * 4. Testabilidad: los selectores son funciones puras fácilmente testeables.
 */

// ── Sesión activa ─────────────────────────────────────────────────────────────

/** Retorna el JWT token actual (null si no autenticado) */
export const selectToken = (state) => state.auth.token;

/** Retorna el rol del usuario ('USER' | 'ADMIN') */
export const selectUserRole = (state) => state.auth.userRole;

/** Retorna el nombre de usuario para saludos en la UI */
export const selectUsuarioNombre = (state) => state.auth.usuarioNombre;

/** Retorna el nombre del archivo de avatar (ej: "avatar3.webp") o null */
export const selectUserAvatar = (state) => state.auth.userAvatar;

/** Retorna true si el usuario tiene una sesión activa */
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

/** Selector derivado: true si el usuario autenticado tiene rol ADMIN */
export const selectIsAdmin = (state) => state.auth.userRole === 'ADMIN';

// ── loginThunk ────────────────────────────────────────────────────────────────

/** Retorna true mientras loginThunk está en curso */
export const selectLoadingLogin = (state) => state.auth.loadingLogin;

/** Retorna el mensaje de error del último intento de login (null si no hay) */
export const selectErrorLogin = (state) => state.auth.errorLogin;

// ── registerThunk ─────────────────────────────────────────────────────────────

/** Retorna true mientras registerThunk está en curso */
export const selectLoadingRegister = (state) => state.auth.loadingRegister;

/** Retorna el mensaje de error del último intento de registro (null si no hay) */
export const selectErrorRegister = (state) => state.auth.errorRegister;

// ── fetchProfileThunk ─────────────────────────────────────────────────────────

/** Retorna el objeto de perfil completo del usuario (null si no se cargó aún) */
export const selectProfile = (state) => state.auth.profile;

/** Retorna true mientras fetchProfileThunk está en curso */
export const selectLoadingProfile = (state) => state.auth.loadingProfile;

/** Retorna el mensaje de error del último intento de cargar el perfil */
export const selectErrorProfile = (state) => state.auth.errorProfile;
