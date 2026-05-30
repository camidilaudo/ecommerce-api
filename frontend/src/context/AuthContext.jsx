import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

/**
 * AuthProvider - Contexto global reactivo de autenticación.
 * Gestiona el JWT, rol y nombre de usuario sin recargas forzadas de página.
 */
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);
    const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || 'USER');
    const [usuarioNombre, setUsuarioNombre] = useState(() => localStorage.getItem('usuarioNombre') || '');

    const isAuthenticated = !!token;

    // Sincronizar el estado en tiempo real al mutar el localStorage
    const login = (newToken, newRole, newNombre) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('userRole', newRole || 'USER');
        if (newNombre) {
            localStorage.setItem('usuarioNombre', newNombre);
        } else {
            localStorage.removeItem('usuarioNombre');
        }

        setToken(newToken);
        setUserRole(newRole || 'USER');
        setUsuarioNombre(newNombre || '');
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('usuarioNombre');

        setToken(null);
        setUserRole('USER');
        setUsuarioNombre('');
    };

    return (
        <AuthContext.Provider value={{
            token,
            userRole,
            usuarioNombre,
            isAuthenticated,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
