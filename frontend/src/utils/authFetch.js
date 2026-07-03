/**
 * authFetch — Wrapper centralizado de fetch con manejo de autenticación.
 *
 * Diseñado para usarse DENTRO de createAsyncThunk payloadCreators.
 * Recibe el objeto thunkAPI para acceder a getState y dispatch.
 *
 * Funcionalidades:
 * 1. Envía `credentials: 'include'` para que el browser adjunte la cookie
 *    HttpOnly `jwt` automáticamente (protección XSS).
 * 2. Detecta respuestas HTTP 401 (token expirado / inválido) y:
 *    - Llama a POST /api/auth/logout para borrar la cookie en el servidor.
 *    - Despacha { type: 'auth/logout' } (tipo string, sin importación circular).
 *    - Redirige a /login con window.location.href (reload completo → estado limpio).
 *    - Lanza un Error para que el catch del thunk retorne rejectWithValue.
 *
 * NO usar en thunks públicos (fetchProducts, fetchProductById, etc.)
 * que no requieren autenticación.
 *
 * @param {string}      url       - Endpoint relativo (ej: '/api/carrito')
 * @param {RequestInit} options   - Opciones fetch: method, headers, body, etc.
 * @param {object}      thunkAPI  - API de RTK: { getState, dispatch }
 * @returns {Promise<Response>}   - Respuesta fetch sin consumir el body
 * @throws {Error}                - Si el servidor responde 401 o hay error de red
 */
export const authFetch = async (url, options = {}, thunkAPI) => {
    const { dispatch } = thunkAPI;

    const config = {
        ...options,
        credentials: 'include', // Envía cookie HttpOnly automáticamente
        headers: {
            ...options.headers,
        },
    };

    const response = await fetch(url, config);

    if (response.status === 401) {
        // Intentar borrar la cookie JWT en el servidor
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch (_) {
            // Falla silenciosamente — la cookie expirará sola
        }

        // Dispatch por tipo string para evitar importación circular con authSlice.
        // El action type 'auth/logout' es el que genera createSlice con:
        //   name: 'auth', reducers: { logout(state) { ... } }
        dispatch({ type: 'auth/logout' });

        // Delay de 100ms para garantizar que redux-persist
        // sincronice el estado limpio en localStorage ANTES del reload.
        setTimeout(() => {
            window.location.href = '/login';
        }, 100);

        throw new Error('Sesión expirada. Por favor, iniciá sesión nuevamente.');
    }

    return response;
};
