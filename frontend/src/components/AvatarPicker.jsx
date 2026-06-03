import React from 'react';
import './AvatarPicker.css';

/**
 * AvatarPicker — Galería de avatares predefinidos.
 *
 * Props:
 *  @param {string}   selectedAvatar - Nombre del archivo actualmente seleccionado (ej: "avatar2.webp")
 *  @param {Function} onSelect       - Callback que recibe el nombre del archivo al seleccionar
 *  @param {string}   [label]        - Etiqueta descriptiva encima de la galería
 */

const AVATARES = [
    'avatar1.webp',
    'avatar2.webp',
    'avatar3.webp',
    'avatar4.webp',
    'avatar5.webp',
    'avatar6.webp',
];

const AvatarPicker = ({ selectedAvatar, onSelect, label = 'Elegí tu avatar' }) => {
    // Fallback: si no hay avatar seleccionado, resalta el primero
    const current = selectedAvatar || 'avatar1.webp';

    return (
        <div className="avatar-picker">
            <p className="avatar-picker__label">{label}</p>
            <div className="avatar-picker__grid">
                {AVATARES.map((filename) => {
                    const isSelected = current === filename;
                    return (
                        <button
                            key={filename}
                            type="button"
                            className={`avatar-picker__item ${isSelected ? 'avatar-picker__item--selected' : ''}`}
                            onClick={() => onSelect(filename)}
                            aria-label={`Seleccionar ${filename}`}
                            aria-pressed={isSelected}
                        >
                            <img
                                src={`/avatares/${filename}`}
                                alt={filename}
                                className="avatar-picker__img"
                                draggable={false}
                            />
                            {isSelected && (
                                <span className="avatar-picker__check" aria-hidden="true">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default AvatarPicker;
