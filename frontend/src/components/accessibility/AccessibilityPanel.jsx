import React, { useRef, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import './AccessibilityPanel.css';

/**
 * AccessibilityPanel — Panel flotante de preferencias de accesibilidad.
 *
 * Se abre desde el botón ⚙ de la Navbar.
 * Gestiona: tema, tamaño de fuente, alto contraste y reducción de animaciones.
 *
 * Estado gestionado por AccessibilityContext (Context API).
 * Redux NO interviene aquí — son preferencias de UI, no estado de negocio.
 *
 * Accesibilidad:
 * - role="dialog" + aria-modal + aria-label
 * - Foco atrapado dentro del panel mientras está abierto
 * - Cierre con Escape
 * - Todos los controles tienen label visible y aria-label descriptivo
 */
const AccessibilityPanel = ({ isOpen, onClose }) => {
    const {
        theme, toggleTheme,
        fontSize, setFontSize,
        highContrast, toggleHighContrast,
        reduceMotion, toggleReduceMotion,
    } = useAccessibility();

    const panelRef = useRef(null);
    const closeButtonRef = useRef(null);

    // ── Cerrar con Escape ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleKeyDown);
        // Enfocar el botón de cierre al abrir (WCAG 2.1 — 2.4.3 Focus Order)
        closeButtonRef.current?.focus();

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // ── Cerrar al hacer click fuera ───────────────────────────────────────────
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                // No cerrar si el click es en el botón trigger del Navbar
                if (!e.target.closest('#accessibility-trigger')) {
                    onClose();
                }
            }
        };

        // Delay mínimo para evitar que el mismo click que abre, cierre
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 10);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={panelRef}
            className="a11y-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Panel de accesibilidad y preferencias visuales"
        >
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="a11y-panel__header">
                <div className="a11y-panel__title-group">
                    <span className="a11y-panel__icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                        </svg>
                    </span>
                    <h2 className="a11y-panel__title">Accesibilidad</h2>
                </div>
                <button
                    ref={closeButtonRef}
                    className="a11y-panel__close"
                    onClick={onClose}
                    aria-label="Cerrar panel de accesibilidad"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="a11y-panel__body">

                {/* ── Tema ────────────────────────────────────────────────── */}
                <section className="a11y-section" aria-label="Tema de color">
                    <h3 className="a11y-section__label">Tema</h3>
                    <div className="a11y-toggle-row">
                        <button
                            className={`a11y-theme-btn ${theme === 'light' ? 'a11y-theme-btn--active' : ''}`}
                            onClick={() => theme !== 'light' && toggleTheme()}
                            aria-pressed={theme === 'light'}
                            aria-label="Activar modo claro"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <circle cx="12" cy="12" r="5" />
                                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                            </svg>
                            Claro
                        </button>
                        <button
                            className={`a11y-theme-btn ${theme === 'dark' ? 'a11y-theme-btn--active' : ''}`}
                            onClick={() => theme !== 'dark' && toggleTheme()}
                            aria-pressed={theme === 'dark'}
                            aria-label="Activar modo oscuro"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                            Oscuro
                        </button>
                    </div>
                </section>

                {/* ── Tamaño de fuente ─────────────────────────────────── */}
                <section className="a11y-section" aria-label="Tamaño de texto">
                    <h3 className="a11y-section__label">Tamaño de texto</h3>
                    <div className="a11y-font-size-group" role="group" aria-label="Seleccionar tamaño de texto">
                        {[
                            { value: 'small', label: 'Pequeño', size: '12px' },
                            { value: 'normal', label: 'Normal', size: '12px' },
                            { value: 'large', label: 'Grande', size: '12px' },
                            { value: 'extra-large', label: 'Extra Grande', size: '12px' },
                        ].map(({ value, label, size }) => (
                            <button
                                key={value}
                                className={`a11y-font-btn ${fontSize === value ? 'a11y-font-btn--active' : ''}`}
                                onClick={() => setFontSize(value)}
                                aria-pressed={fontSize === value}
                                aria-label={`Tamaño de texto: ${label}`}
                                style={{ fontSize: size }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </section>

                {/* ── Alto Contraste ───────────────────────────────────── */}
                <section className="a11y-section" aria-label="Alto contraste">
                    <div className="a11y-toggle-switch-row">
                        <div className="a11y-toggle-info">
                            <h3 className="a11y-section__label">Alto contraste</h3>
                            <p className="a11y-section__desc">Mejora la legibilidad para usuarios con dificultades visuales</p>
                        </div>
                        <button
                            role="switch"
                            aria-checked={highContrast}
                            className={`a11y-switch ${highContrast ? 'a11y-switch--on' : ''}`}
                            onClick={toggleHighContrast}
                            aria-label={`Alto contraste: ${highContrast ? 'activado' : 'desactivado'}`}
                        >
                            <span className="a11y-switch__thumb" aria-hidden="true" />
                        </button>
                    </div>
                </section>

                {/* ── Reducir Movimiento ───────────────────────────────── */}
                <section className="a11y-section" aria-label="Reducción de movimiento">
                    <div className="a11y-toggle-switch-row">
                        <div className="a11y-toggle-info">
                            <h3 className="a11y-section__label">Reducir movimiento</h3>
                            <p className="a11y-section__desc">Minimiza transiciones y animaciones</p>
                        </div>
                        <button
                            role="switch"
                            aria-checked={reduceMotion}
                            className={`a11y-switch ${reduceMotion ? 'a11y-switch--on' : ''}`}
                            onClick={toggleReduceMotion}
                            aria-label={`Reducir movimiento: ${reduceMotion ? 'activado' : 'desactivado'}`}
                        >
                            <span className="a11y-switch__thumb" aria-hidden="true" />
                        </button>
                    </div>
                </section>
            </div>

            {/* ── Footer ──────────────────────────────────────────────────── */}
            <div className="a11y-panel__footer">
                <p className="a11y-panel__footer-text">
                    Las preferencias se guardan automáticamente
                </p>
            </div>
        </div>
    );
};

export default AccessibilityPanel;
