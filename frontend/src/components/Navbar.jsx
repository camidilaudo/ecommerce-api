import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Navbar.css';

/**
 * Navbar - Barra de navegación con control de sesión adaptativo.
 */
const Navbar = ({ onSearch }) => {
    const { cartCount, toggleCart } = useCart();
    const navigate = useNavigate();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Verificamos de forma síncrona si hay una sesión activa en el navegador
    const isAuthenticated = !!localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole') || 'USER';

    /**
     * Cierra la sesión eliminando las credenciales del almacenamiento local.
     */
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('usuarioNombre');
        setIsUserMenuOpen(false);
        alert('Sesión cerrada correctamente');
        navigate('/');
        window.location.reload(); // Sincroniza la UI de inmediato
    };

    return (
        <nav className="navbar">
            <div className="navbar-container container">

                {/* Logo Principal */}
                <Link to="/" className="nav-brand">
                    GRUPO 3 <span className="brand-sub">— ECOMMERCE</span>
                </Link>

                {/* Barra de Búsqueda Redondeada */}
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
                            onChange={(e) => onSearch && onSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="nav-actions">
                    {/* Botón del Carrito */}
                    <button className="nav-btn" onClick={toggleCart} aria-label="Abrir Carrito">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                        </svg>
                        {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
                    </button>

                    {/* Menú de Usuario */}
                    <div className="user-menu-wrapper">
                        <button className="nav-btn" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} aria-label="Menú de usuario">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>

                        {isUserMenuOpen && (
                            <div className="user-dropdown">
                                {isAuthenticated ? (
                                    /* --- VISTA PARA USUARIOS LOGUEADOS --- */
                                    <>
                                        <Link to="/perfil" onClick={() => setIsUserMenuOpen(false)}>Mi Perfil</Link>
                                        <Link to="/pedidos" onClick={() => setIsUserMenuOpen(false)}>Mis Pedidos</Link>

                                        {/* Condicional de Rol: Solo visible si es ADMIN */}
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
                                    /* --- VISTA PARA INVITADOS --- */
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