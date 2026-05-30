import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const FavoriteContext = createContext();

/**
 * FavoriteProvider - Proveedor global de productos favoritos.
 * Conectado reactivamente al usuario activo del AuthContext para aislamiento.
 */
export const FavoriteProvider = ({ children }) => {
    const { usuarioNombre, isAuthenticated } = useAuth();
    const [favoriteItems, setFavoriteItems] = useState([]);

    // Obtener la clave de LocalStorage específica del usuario actual
    const getStorageKey = () => {
        return isAuthenticated && usuarioNombre ? `favorites_${usuarioNombre}` : 'favorites_guest';
    };

    // Efecto para recargar los favoritos correspondientes cada vez que el usuario cambia de sesión (Login/Logout) y limpiar huérfanos
    useEffect(() => {
        const key = getStorageKey();
        const storedFavorites = localStorage.getItem(key);
        if (storedFavorites) {
            try {
                const parsed = JSON.parse(storedFavorites);
                setFavoriteItems(parsed);

                // Sincronizar en segundo plano para limpiar automáticamente productos eliminados del catálogo
                const syncWithCatalog = async () => {
                    if (parsed.length === 0) return;
                    try {
                        const response = await fetch('http://localhost:8081/api/productos');
                        if (response.ok) {
                            const freshProducts = await response.json();
                            const activeIds = new Set(freshProducts.map(p => p.id));
                            
                            // Filtrar solo los favoritos que aún existen en el catálogo activo del backend
                            const cleaned = parsed.filter(item => activeIds.has(item.id));

                            // Si hubo cambios, actualizamos el estado global y localStorage reactivamente
                            if (cleaned.length !== parsed.length) {
                                setFavoriteItems(cleaned);
                                localStorage.setItem(key, JSON.stringify(cleaned));
                            }
                        }
                    } catch (e) {
                        console.error("Error al sincronizar favoritos huérfanos:", e);
                    }
                };
                
                syncWithCatalog();
            } catch (e) {
                setFavoriteItems([]);
            }
        } else {
            setFavoriteItems([]);
        }
    }, [usuarioNombre, isAuthenticated]);

    // Función para añadir o remover de favoritos (Toggle)
    const addToFavorite = (product) => {
        if (!product || !product.id) return;
        
        const key = getStorageKey();
        let updatedFavorites;

        const isAlreadyFavorite = favoriteItems.some(item => item.id === product.id);

        if (isAlreadyFavorite) {
            // Si ya es favorito, lo removemos
            updatedFavorites = favoriteItems.filter(item => item.id !== product.id);
            toast.info(`"${product.nombre}" eliminado de favoritos 💔`);
        } else {
            // Si no es favorito, lo agregamos
            updatedFavorites = [...favoriteItems, product];
            toast.success(`"${product.nombre}" agregado a favoritos ❤️`);
        }

        setFavoriteItems(updatedFavorites);
        localStorage.setItem(key, JSON.stringify(updatedFavorites));
    };

    return (
        <FavoriteContext.Provider value={{
            favoriteItems,
            addToFavorite
        }}>
            {children}
        </FavoriteContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoriteContext);
