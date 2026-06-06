import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// Selectores — Redux como única fuente de verdad
import { selectIsAuthenticated, selectUsuarioNombre, selectUserRole, selectUserAvatar } from '../features/auth/authSelectors';
import { selectCartCount } from '../features/cart/cartSelectors';
import { selectFavoriteCount } from '../features/favorites/favoritesSelectors';

// Acciones Redux
import { logout } from '../features/auth/authSlice';
import { toggleCart, clearCartLocal } from '../features/cart/cartSlice';
import { clearFavorites } from '../features/favorites/favoritesSlice';

// Accesibilidad (Context API — preferencias de UI, independiente de Redux)
import AccessibilityPanel from './accessibility/AccessibilityPanel';

import './Navbar.css';
import useDebounce from '../hooks/useDebounce';
import { toast } from 'react-toastify';

/**
 * Navbar — Barra de navegación principal.
 *
 * Estado de negocio (auth, cart, favorites) → Redux (useSelector / useDispatch)
 * Preferencias de UI (accesibilidad)        → AccessibilityContext (panel local)
 */
const Navbar = ({ onSearch }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Estado desde Redux
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const usuarioNombre   = useSelector(selectUsuarioNombre);
    const userRole        = useSelector(selectUserRole);
    const userAvatar      = useSelector(selectUserAvatar);
    const cartCount       = useSelector(selectCartCount);
    const favoriteCount   = useSelector(selectFavoriteCount);

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isA11yOpen, setIsA11yOpen] = useState(false);
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 400);

    useEffect(() => {
        if (typeof onSearch === 'function') {
            onSearch(debouncedQuery);
        } else if (debouncedQuery.trim().length > 0) {
            navigate(`/search?q=${encodeURIComponent(debouncedQuery)}`);
        }
    }, [debouncedQuery, onSearch, navigate]);

    // Cerrar el dropdown de usuario si se abre el de accesibilidad y viceversa
    const handleToggleA11y = () => {
        setIsA11yOpen((prev) => !prev);
        setIsUserMenuOpen(false);
    };

    const handleToggleUserMenu = () => {
        setIsUserMenuOpen((prev) => !prev);
        setIsA11yOpen(false);
    };

    const handleLogout = () => {
        dispatch(clearCartLocal());
        dispatch(clearFavorites());
        dispatch(logout());
        setIsUserMenuOpen(false);
        toast.success('Sesión cerrada correctamente');
        navigate('/');
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-container container">
                    <Link to="/" className="nav-brand">
                        GRUPO 3 <span className="brand-sub">— ECOMMERCE</span>
                    </Link>

                    <div className="nav-search-wrapper">
                        <div className="search-input-container">
                            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                className="nav-search-input"
                                placeholder="Buscar productos..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                aria-label="Buscar productos"
                            />
                        </div>
                    </div>

                    <div className="nav-actions">
                        {/* ── Botón Accesibilidad ⚙ ──────────────────────── */}
                        <button
                            id="accessibility-trigger"
                            className={`nav-btn nav-a11y-btn ${isA11yOpen ? 'nav-a11y-btn--active' : ''}`}
                            onClick={handleToggleA11y}
                            aria-label="Abrir panel de accesibilidad"
                            aria-expanded={isA11yOpen}
                            aria-haspopup="dialog"
                            title="Accesibilidad"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                            </svg>
                        </button>

                        {/* ── Favoritos ───────────────────────────────────── */}
                        <Link
                            to="/favoritos"
                            className="nav-btn nav-favorites-btn"
                            aria-label={`Ver favoritos${favoriteCount > 0 ? `, ${favoriteCount} items` : ''}`}
                            style={{ position: 'relative' }}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                            {favoriteCount > 0 && (
                                <span className="nav-badge" style={{ backgroundColor: '#ff3b30' }} aria-hidden="true">
                                    {favoriteCount}
                                </span>
                            )}
                        </Link>

                        {/* ── Carrito ─────────────────────────────────────── */}
                        <button
                            className="nav-btn"
                            onClick={() => dispatch(toggleCart())}
                            aria-label={`Abrir carrito${cartCount > 0 ? `, ${cartCount} productos` : ''}`}
                            style={{ position: 'relative' }}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                            </svg>
                            {cartCount > 0 && (
                                <span className="nav-badge" aria-hidden="true">{cartCount}</span>
                            )}
                        </button>

                        {/* ── Usuario ─────────────────────────────────────── */}
                        <div className="user-menu-wrapper">
                            <button
                                className="nav-btn"
                                onClick={handleToggleUserMenu}
                                aria-label="Menú de usuario"
                                aria-expanded={isUserMenuOpen}
                                aria-haspopup="menu"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                {isAuthenticated && (
                                    <span className="user-greeting-navbar" style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text)' }}>
                                        ¡Hola, {usuarioNombre}!
                                    </span>
                                )}
                                {isAuthenticated && userAvatar ? (
                                    <img
                                        src={`/avatares/${userAvatar}`}
                                        alt={`Avatar de ${usuarioNombre}`}
                                        style={{
                                            width: '30px',
                                            height: '30px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: '2px solid var(--color-accent)',
                                            boxShadow: '0 0 0 2px var(--color-accent-light)',
                                            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'scale(1.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                    />
                                ) : (
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>

                            {isUserMenuOpen && (
                                <div className="user-dropdown" role="menu">
                                    {isAuthenticated ? (
                                        <>
                                            <Link to="/perfil" onClick={() => setIsUserMenuOpen(false)} role="menuitem">Mi Perfil</Link>
                                            <Link to="/pedidos" onClick={() => setIsUserMenuOpen(false)} role="menuitem">Mis Pedidos</Link>
                                            {userRole === 'ADMIN' && (
                                                <Link
                                                    to="/admin"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    role="menuitem"
                                                    style={{ color: 'var(--color-accent)', fontWeight: '600' }}
                                                >
                                                    Panel Admin
                                                </Link>
                                            )}
                                            <hr style={{ border: '0', borderTop: '1px solid var(--color-border-light)', margin: '4px 0' }} />
                                            <button
                                                onClick={handleLogout}
                                                role="menuitem"
                                                style={{ color: '#ff3b30', textAlign: 'left', width: '100%', background: 'none', border: 'none', padding: '12px 16px', cursor: 'pointer', fontSize: '14px' }}
                                            >
                                                Cerrar Sesión
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link to="/login" onClick={() => setIsUserMenuOpen(false)} role="menuitem">Iniciar Sesión</Link>
                                            <Link to="/register" onClick={() => setIsUserMenuOpen(false)} role="menuitem">Registrarse</Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Panel de accesibilidad — fuera del nav para posicionamiento correcto */}
            <AccessibilityPanel
                isOpen={isA11yOpen}
                onClose={() => setIsA11yOpen(false)}
            />
        </>
    );
};

export default Navbar;