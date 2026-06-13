import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './LoginPage.css';
import './ProfilePage.css';
import { fetchProfileThunk, updateAvatarThunk } from '../features/auth/authSlice';
import {
    selectProfile,
    selectLoadingProfile,
    selectErrorProfile,
} from '../features/auth/authSelectors';
import AvatarPicker from '../components/AvatarPicker';
import { toast } from 'react-toastify';

/**
 * ProfilePage — Perfil del usuario autenticado via Redux Toolkit.
 *
 * Migración de fetch directo a thunks:
 * - GET /api/usuarios/me   → fetchProfileThunk  → auth.profile en Redux
 * - PATCH /api/usuarios/me/avatar → updateAvatarThunk → auth.userAvatar + auth.profile.avatar
 *
 * El acceso a esta ruta está protegido por PrivateRoute (requiere token).
 * Si el token expira durante la sesión, authFetch detecta el 401,
 * hace logout y redirige a /login automáticamente.
 */
const ProfilePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Perfil y estados de carga/error desde Redux
    const user = useSelector(selectProfile);
    const loading = useSelector(selectLoadingProfile);
    const error = useSelector(selectErrorProfile);

    // Estado local de UI — el avatar seleccionado puede diferir del guardado
    const [avatarSeleccionado, setAvatarSeleccionado] = useState('avatar1.webp');
    const [guardandoAvatar, setGuardandoAvatar] = useState(false);

    // Carga el perfil al montar — PrivateRoute garantiza que hay token
    useEffect(() => {
        dispatch(fetchProfileThunk());
    }, [dispatch]);

    // Sincroniza el selector visual con el avatar real del usuario
    // cuando el perfil llega desde el backend
    useEffect(() => {
        if (user?.avatar) {
            setAvatarSeleccionado(user.avatar);
        }
    }, [user?.avatar]);

    /**
     * Guarda el avatar seleccionado en el backend vía updateAvatarThunk.
     * El thunk actualiza auth.userAvatar y auth.profile.avatar en Redux.
     * store.subscribe() en store.js persiste auth.userAvatar en localStorage.
     */
    const handleGuardarAvatar = async () => {
        if (avatarSeleccionado === user?.avatar) {
            toast.info('El avatar ya está guardado.');
            return;
        }

        setGuardandoAvatar(true);
        try {
            await dispatch(updateAvatarThunk(avatarSeleccionado)).unwrap();
            toast.success('¡Avatar actualizado correctamente!');
        } catch (err) {
            toast.error(`No se pudo guardar el avatar: ${err}`);
        } finally {
            setGuardandoAvatar(false);
        }
    };

    // ── Estado de carga ────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="auth-page">
                <div className="auth-card auth-card--wide profile-skeleton">
                    <div className="profile-skeleton__avatar" />
                    <div className="profile-skeleton__line profile-skeleton__line--wide" />
                    <div className="profile-skeleton__line" />
                    <div className="profile-skeleton__line" />
                    <div className="profile-skeleton__line profile-skeleton__line--narrow" />
                </div>
            </div>
        );
    }

    // ── Estado de error ────────────────────────────────────────────────────────
    if (error && !user) {
        return (
            <div className="auth-page">
                <div className="auth-card">
                    <div className="auth-header">
                        <h2 className="auth-titulo">Error de Integración</h2>
                        <p style={{ color: 'var(--color-error)', marginTop: '12px', fontSize: '14px' }}>{error}</p>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '15px', lineHeight: '1.4' }}>
                            Asegurate de que tu controlador en Spring Boot responda correctamente en la ruta
                            <code> GET /api/usuarios/me</code> procesando el token enviado en la cabecera.
                        </p>
                    </div>
                    <button className="auth-submit" onClick={() => navigate('/')}>
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    const avatarActual = user?.avatar || 'avatar1.webp';
    const avatarCambio = avatarSeleccionado !== avatarActual;

    return (
        <div className="auth-page">
            <div className="auth-card auth-card--wide">

                {/* Header con avatar actual */}
                <div className="auth-header">
                    <div className="profile-avatar-preview">
                        <img
                            src={`/avatares/${avatarActual}`}
                            alt="Tu avatar actual"
                            className="profile-avatar-preview__img"
                        />
                        <div className="profile-avatar-preview__badge">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="9 11 12 14 22 4" strokeWidth="2.5" stroke="white" fill="none" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="auth-titulo" style={{ marginTop: '16px' }}>Mi Perfil</h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>
                        {user?.nombreUsuario && <strong>@{user.nombreUsuario}</strong>}
                    </p>
                </div>

                <div className="auth-form">

                    {/* Campo: Nombre de Usuario */}
                    <div className="form-grupo">
                        <label className="form-label">Nombre de Usuario</label>
                        <input
                            type="text"
                            className="form-input"
                            value={user?.nombreUsuario || ''}
                            readOnly
                        />
                    </div>

                    {/* Fila: Nombre + Apellido */}
                    <div className="form-fila">
                        <div className="form-grupo">
                            <label className="form-label">Nombre</label>
                            <input
                                type="text"
                                className="form-input"
                                value={user?.nombre || ''}
                                readOnly
                            />
                        </div>
                        <div className="form-grupo">
                            <label className="form-label">Apellido</label>
                            <input
                                type="text"
                                className="form-input"
                                value={user?.apellido || ''}
                                readOnly
                            />
                        </div>
                    </div>

                    {/* Campo: Correo Electrónico */}
                    <div className="form-grupo">
                        <label className="form-label">Email de Operación</label>
                        <input
                            type="email"
                            className="form-input"
                            value={user?.email || ''}
                            readOnly
                        />
                    </div>

                    {/* Campos opcionales: se muestran solo si el DTO del Backend los incluye */}
                    {user?.fechaNacimiento && (
                        <div className="form-grupo">
                            <label className="form-label">Fecha de Nacimiento</label>
                            <input type="text" className="form-input" value={user.fechaNacimiento} readOnly />
                        </div>
                    )}

                    {user?.sexo && (
                        <div className="form-grupo">
                            <label className="form-label">Sexo</label>
                            <input type="text" className="form-input" value={user.sexo} readOnly />
                        </div>
                    )}

                    {/* ── Sección de Cambio de Avatar ── */}
                    <div className="profile-divider" />

                    <AvatarPicker
                        selectedAvatar={avatarSeleccionado}
                        onSelect={setAvatarSeleccionado}
                        label="Cambiar avatar"
                    />

                    {/* Botón Guardar Avatar — solo activo si hubo cambio */}
                    <button
                        type="button"
                        className="auth-submit"
                        onClick={handleGuardarAvatar}
                        disabled={guardandoAvatar || !avatarCambio}
                        style={{
                            opacity: avatarCambio ? 1 : 0.5,
                            cursor: avatarCambio ? 'pointer' : 'default',
                        }}
                    >
                        {guardandoAvatar ? 'Guardando...' : avatarCambio ? '💾 Guardar Avatar' : 'Avatar guardado'}
                    </button>

                    <div className="profile-divider" />

                    {/* Botón de retorno centralizado */}
                    <button
                        className="auth-submit"
                        onClick={() => navigate('/')}
                        style={{ background: 'var(--color-text)', color: 'var(--color-bg)', marginTop: '0' }}
                    >
                        Volver a la Tienda
                    </button>

                </div>
            </div>
        </div>
    );
};

export default ProfilePage;