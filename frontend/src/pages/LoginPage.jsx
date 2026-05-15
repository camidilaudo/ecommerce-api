import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

/**
 * LoginPage — Componente para la autenticación de usuarios.
 * Conecta con el endpoint POST /api/auth/login de Spring Boot 4.0.5.
 */
const LoginPage = () => {
    const navigate = useNavigate();

    // Estado del formulario mapeado al DTO LoginRequest.java
    const [form, setForm] = useState({ email: '', password: '' });
    const [errores, setErrores] = useState({});
    const [cargando, setCargando] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errores[name]) {
            setErrores(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validar = () => {
        const nuevosErrores = {};
        if (!form.email.trim()) nuevosErrores.email = 'El correo es obligatorio';
        if (!form.password) nuevosErrores.password = 'La contraseña es obligatoria';
        return nuevosErrores;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const erroresValidacion = validar();
        if (Object.keys(erroresValidacion).length > 0) {
            setErrores(erroresValidacion);
            return;
        }

        setCargando(true);

        try {
            const response = await fetch('http://localhost:8081/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.mensaje || 'Credenciales inválidas');
            }

            // Guardamos la información de la sesión de forma persistente
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.role || 'USER'); // Rol devuelto por el backend (USER o ADMIN)
            if (data.nombre) localStorage.setItem('usuarioNombre', data.nombre);

            alert('¡Bienvenido de nuevo!');
            navigate('/'); // Redirige a la página principal
            window.location.reload(); // Fuerza la actualización para que la Navbar lea el nuevo estado

        } catch (err) {
            console.error("Error en Login:", err.message);
            alert(`Error al iniciar sesión: ${err.message}`);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="auth-page">
            <button className="auth-back" onClick={() => navigate('/')}>
                ← Volver al inicio
            </button>

            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-logo">Grupo 3 <span>— Ecommerce</span></h1>
                    <h2 className="auth-titulo">Iniciá sesión</h2>
                    <p className="auth-subtitulo">
                        ¿No tenés cuenta?{' '}
                        <button className="auth-link" onClick={() => navigate('/register')}>
                            Registrate
                        </button>
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="form-grupo">
                        <label className="form-label" htmlFor="email">Correo electrónico</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className={errores.email ? 'form-input--error' : ''}
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                        {errores.email && <span className="form-error">{errores.email}</span>}
                    </div>

                    <div className="form-grupo">
                        <label className="form-label" htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className={errores.password ? 'form-input--error' : ''}
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                        {errores.password && <span className="form-error">{errores.password}</span>}
                    </div>

                    <button type="submit" className="auth-submit" disabled={cargando}>
                        {cargando ? 'Verificando...' : 'Iniciar sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;