import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Usamos el CSS unificado

/**
 * LoginPage — Página de inicio de sesión.
 * Corresponde al endpoint POST /api/auth/login.
 */
const LoginPage = () => {
    const navigate = useNavigate();

    // Estado del formulario mapeado al DTO LoginRequest
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
        const err = {};
        if (!form.email.trim()) err.email = 'Obligatorio';
        else if (!/\S+@\S+\.\S+/.test(form.email)) err.email = 'Email inválido';
        if (!form.password) err.password = 'Obligatorio';
        return err;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const erroresValidacion = validar();
        if (Object.keys(erroresValidacion).length > 0) {
            setErrores(erroresValidacion);
            return;
        }

        setCargando(true);
        console.log("Logueando usuario en Spring Boot 4.0.5:", form);

        // Simulación de éxito de la API
        setTimeout(() => {
            setCargando(false);
            alert(`¡Bienvenido!`);
            navigate('/'); // Redirige a HomePage tras el login
        }, 800);
    };

    return (
        <div className="auth-page">
            {/* Navegación corregida con useNavigate */}
            <button className="auth-back" onClick={() => navigate('/')}>
                ← Volver al inicio
            </button>

            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-logo">Grupo 3 <span>— Ecommerce</span></h1>
                    <h2 className="auth-titulo">Iniciá sesión</h2>
                    <p className="auth-subtitulo">
                        ¿No tenés cuenta?{' '}
                        {/* Navegación corregida con useNavigate */}
                        <button className="auth-link" onClick={() => navigate('/register')}>
                            Registrate
                        </button>
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    {/* Fila: Email */}
                    <div className="form-grupo">
                        <label className="form-label" htmlFor="email">Correo electrónico</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className={errores.email ? 'form-input--error' : ''}
                            // Placeholder eliminado para diseño minimalista
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                        {errores.email && <span className="form-error">{errores.email}</span>}
                    </div>

                    {/* Fila: Contraseña */}
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

                    {/* Botón submit: Centrado y Azul Eléctrico vía CSS */}
                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={cargando}
                    >
                        {cargando ? 'Ingresando...' : 'Iniciar sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;