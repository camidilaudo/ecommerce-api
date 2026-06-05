import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// Selectores — Redux como única fuente de verdad
import { selectIsAuthenticated, selectUsuarioNombre, selectUserRole, selectUserAvatar } from '../features/auth/authSelectors';
import { selectCartCount, selectIsCartOpen } from '../features/cart/cartSelectors';
import { selectFavoriteCount } from '../features/favorites/favoritesSelectors';

// Acciones
import { logout } from '../features/auth/authSlice';
import { toggleCart } from '../features/cart/cartSlice';
import { clearCartLocal } from '../features/cart/cartSlice';
import { clearFavorites } from '../features/favorites/favoritesSlice';

import './Navbar.css';
import useDebounce from '../hooks/useDebounce';
import { toast } from 'react-toastify';

/**
 * Navbar — Barra de navegación principal.
 *
 * MIGRADO: useCart() + useAuth() + useFavorites() → useSelector + useDispatch
 * Redux es la única fuente de verdad. Cero lecturas de localStorage.
 */
const Navbar = ({ onSearch }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Estado de autenticación desde Redux
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const usuarioNombre = useSelector(selectUsuarioNombre);
    const userRole = useSelector(selectUserRole);
    const userAvatar = useSelector(selectUserAvatar);

    // Estado del carrito desde Redux
    const cartCount = useSelector(selectCartCount);

    // Estado de favoritos desde Redux
    const favoriteCount = useSelector(selectFavoriteCount);

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 400);

    useEffect(() => {
        if (typeof onSearch === 'function') {
            onSearch(debouncedQuery);
        } else {
            if (debouncedQuery.trim().length > 0) {
                navigate(`/search?q=${encodeURIComponent(debouncedQuery)}`);
            }
        }
    }, [debouncedQuery, onSearch, navigate]);

    const handleLogout = () => {
        // Limpiar estado de carrito y favoritos antes del logout
        dispatch(clearCartLocal());
        dispatch(clearFavorites());
        // Logout actualiza auth en el store; store.subscribe() limpia localStorage
        dispatch(logout());
        setIsUserMenuOpen(false);
        toast.success('Sesión cerrada correctamente');
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container container">
                <Link to="/" className="nav-brand">
                    GRUPO 3 <span className="brand-sub">— ECOMMERCE</span>
                </Link>

                <div className="nav-search-wrapper">
                    <div className="search-input-container">
                        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            className="nav-search-input"
                            placeholder="Buscar productos..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="nav-actions">
                    {/* Botón de Favoritos */}
                    <Link to="/favoritos" className="nav-btn nav-favorites-btn" aria-label="Ver Favoritos" style={{ position: 'relative' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        {favoriteCount > 0 && <span className="nav-badge" style={{ backgroundColor: '#ff3b30' }}>{favoriteCount}</span>}
                    </Link>

                    <button className="nav-btn" onClick={() => dispatch(toggleCart())} aria-label="Abrir Carrito" style={{ position: 'relative' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                        </svg>
                        {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
                    </button>

                    <div className="user-menu-wrapper">
                        <button className="nav-btn" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} aria-label="Menú de usuario" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isAuthenticated && <span className="user-greeting-navbar" style={{ fontSize: '13px', fontWeight: '500', color: '#1d1d1f' }}>¡Hola, {usuarioNombre}!</span>}
                            {isAuthenticated && userAvatar ? (
                                <img
                                    src={`/avatares/${userAvatar}`}
                                    alt="Tu avatar"
                                    style={{
                                        width: '30px',
                                        height: '30px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '2px solid #0071e3',
                                        boxShadow: '0 0 0 2px rgba(0, 113, 227, 0.2)',
                                        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 113, 227, 0.35)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0, 113, 227, 0.2)';
                                    }}
                                />
                            ) : (
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>

                        {isUserMenuOpen && (
                            <div className="user-dropdown">
                                {isAuthenticated ? (
                                    <>
                                        <Link to="/perfil" onClick={() => setIsUserMenuOpen(false)}>Mi Perfil</Link>
                                        <Link to="/pedidos" onClick={() => setIsUserMenuOpen(false)}>Mis Pedidos</Link>

                                        {userRole === 'ADMIN' && (
                                            <Link to="/admin" onClick={() => setIsUserMenuOpen(false)} style={{ color: '#0071e3', fontWeight: '600' }}>
                                                Panel Admin
                                            </Link>
                                        )}
                                        <hr style={{ border: '0', borderTop: '1px solid #f5f5f7', margin: '4px 0' }} />
                                        <button onClick={handleLogout} className="dropdown-logout-btn" style={{ color: '#ff3b30', textAlign: 'left', width: '100%', background: 'none', border: 'none', padding: '12px 16px', cursor: 'pointer', fontSize: '14px' }}>
                                            Cerrar Sesión
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" onClick={() => setIsUserMenuOpen(false)}>Iniciar Sesión</Link>
                                        <Link to="/register" onClick={() => setIsUserMenuOpen(false)}>Registrarse</Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;