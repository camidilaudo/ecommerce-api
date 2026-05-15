import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = ({ onSearch }) => {
    const { cartCount, toggleCart } = useCart();
    const navigate = useNavigate();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // useRef guarda el timer entre renders sin causar re-renders
    const debounceTimer = useRef(null);

    // Debounce: espera 300ms después de que el usuario deja de escribir
    // Evita un re-render por cada letra cuando conectemos la API real
    const handleSearch = (e) => {
        const value = e.target.value;
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            onSearch(value);
        }, 300);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container container">
                {/* Logo Principal */}
                <Link to="/" className="nav-brand">
                    GRUPO 3 <span className="brand-sub">— ECOMMERCE</span>
                </Link>

                {/* Barra de Búsqueda Centrada e Integrada */}
                <div className="nav-search-wrapper">
                    <div className="search-input-container">
                        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        {/* onChange reemplazado por handleSearch con debounce */}
                        <input
                            type="text"
                            className="nav-search-input"
                            placeholder="Buscar en el catálogo..."
                            onChange={handleSearch}
                        />
                    </div>
                </div>

                <div className="nav-actions">
                    {/* Botón Carrito */}
                    <button className="nav-btn" onClick={toggleCart} aria-label="Abrir Carrito">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                        </svg>
                        {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
                    </button>

                    {/* Menú Usuario */}
                    <div className="user-menu-wrapper">
                        <button className="nav-btn" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                        {isUserMenuOpen && (
                            <div className="user-dropdown">
                                <Link to="/login" onClick={() => setIsUserMenuOpen(false)}>Iniciar Sesión</Link>
                                <Link to="/register" onClick={() => setIsUserMenuOpen(false)}>Registrarse</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;