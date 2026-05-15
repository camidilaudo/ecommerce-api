import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Reutiliza el diseño y estructura premium de los formularios

/**
 * ProfilePage - Interfaz para visualizar la información de cuenta del usuario logueado.
 * Conecta con el endpoint protegido GET /api/usuarios/me inyectando el token Bearer JWT.
 */
const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');

        // Redirección de seguridad: si el usuario no tiene token, se lo manda a loguearse
        if (!token) {
            navigate('/login');
            return;
        }

        /**
         * Petición asíncrona (Clase 08) para recuperar los datos reales del usuario.
         */
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch('http://localhost:8081/api/usuarios/me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('El servidor rechazó la solicitud o el endpoint no está implementado');
                }

                const data = await response.json();
                setUser(data); // Mapea los campos reales de la base de datos de MySQL

            } catch (err) {
                console.error("Error al consultar /api/usuarios/me:", err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    // Estado visual de carga intermedia
    if (loading) {
        return (
            <div style={{ padding: '100px', textAlign: 'center', color: '#86868b', fontSize: '16px' }}>
                Cargando información de perfil...
            </div>
        );
    }

    // Si ocurre un error de red o de endpoint, se le notifica limpiamente al alumno
    if (error) {
        return (
            <div className="auth-page">
                <div className="auth-card">
                    <div className="auth-header">
                        <h2 className="auth-titulo">Error de Integración</h2>
                        <p style={{ color: '#ff3b30', marginTop: '12px', fontSize: '14px' }}>{error}</p>
                        <p style={{ fontSize: '13px', color: '#86868b', marginTop: '15px', lineHeight: '1.4' }}>
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

    return (
        <div className="auth-page">
            <div className="auth-card auth-card--wide">

                <div className="auth-header">
                    <h2 className="auth-titulo">Mi Perfil</h2>
                    <p>Información verificada de tu cuenta de usuario</p>
                </div>

                <div className="auth-form">

                    {/* Campo: Nombre de Usuario */}
                    <div className="form-grupo">
                        <label className="form-label">Nombre de Usuario</label>
                        <input
                            type="text"
                            value={user?.nombreUsuario || user?.username || ''}
                            readOnly
                        />
                    </div>

                    {/* Fila: Nombre + Apellido */}
                    <div className="form-fila">
                        <div className="form-grupo">
                            <label className="form-label">Nombre</label>
                            <input
                                type="text"
                                value={user?.nombre || ''}
                                readOnly
                            />
                        </div>
                        <div className="form-grupo">
                            <label className="form-label">Apellido</label>
                            <input
                                type="text"
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
                            value={user?.email || ''}
                            readOnly
                        />
                    </div>

                    {/* Campos opcionales: se muestran solo si el DTO del Backend los incluye */}
                    {user?.fechaNacimiento && (
                        <div className="form-grupo">
                            <label className="form-label">Fecha de Nacimiento</label>
                            <input type="text" value={user.fechaNacimiento} readOnly />
                        </div>
                    )}

                    {user?.sexo && (
                        <div className="form-grupo">
                            <label className="form-label">Sexo</label>
                            <input type="text" value={user.sexo} readOnly />
                        </div>
                    )}

                    {/* NOTA: El campo de "Rol Asignado" ha sido removido completamente de la UI */}

                    {/* Botón de retorno centralizado */}
                    <button
                        className="auth-submit"
                        onClick={() => navigate('/')}
                        style={{ background: '#000000', marginTop: '20px' }}
                    >
                        Volver a la Tienda
                    </button>

                </div>
            </div>
        </div>
    );
};

export default ProfilePage;