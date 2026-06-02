import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

/**
 * AuthProvider - Contexto global reactivo de autenticación.
 * Gestiona el JWT, rol, nombre y avatar del usuario sin recargas forzadas de página.
 */
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);
    const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || 'USER');
    const [usuarioNombre, setUsuarioNombre] = useState(() => localStorage.getItem('usuarioNombre') || '');
    const [userAvatar, setUserAvatar] = useState(() => localStorage.getItem('userAvatar') || null);

    const isAuthenticated = !!token;

    /**
     * login — Persiste la sesión en localStorage y actualiza el estado reactivo.
     * @param {string} newToken - JWT del servidor
     * @param {string} newRole  - Rol del usuario (USER | ADMIN)
     * @param {string} newNombre - Nombre del usuario para saludo
     * @param {string} newAvatar - Nombre del archivo de avatar (ej: "avatar3.webp")
     */
    const login = (newToken, newRole, newNombre, newAvatar) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('userRole', newRole || 'USER');

        if (newNombre) {
            localStorage.setItem('usuarioNombre', newNombre);
        } else {
            localStorage.removeItem('usuarioNombre');
        }

        if (newAvatar) {
            localStorage.setItem('userAvatar', newAvatar);
        } else {
            localStorage.removeItem('userAvatar');
        }

        setToken(newToken);
        setUserRole(newRole || 'USER');
        setUsuarioNombre(newNombre || '');
        setUserAvatar(newAvatar || null);
    };

    /**
     * updateAvatar — Actualiza solo el avatar en el contexto y localStorage
     * sin necesidad de hacer logout/login. Se llama desde ProfilePage tras guardar.
     */
    const updateAvatar = (newAvatar) => {
        if (newAvatar) {
            localStorage.setItem('userAvatar', newAvatar);
            setUserAvatar(newAvatar);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('usuarioNombre');
        localStorage.removeItem('userAvatar');

        setToken(null);
        setUserRole('USER');
        setUsuarioNombre('');
        setUserAvatar(null);
    };

    return (
        <AuthContext.Provider value={{
            token,
            userRole,
            usuarioNombre,
            userAvatar,
            isAuthenticated,
            login,
            logout,
            updateAvatar,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
