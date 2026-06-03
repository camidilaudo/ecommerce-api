import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { isValidEmail } from '../utils/validation';
import { handleApiResponse } from '../utils/apiHelpers';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

/**
 * LoginPage — Componente para la autenticación de usuarios.
 * Conecta con el endpoint POST /api/auth/login de Spring Boot.
 */
const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({ email: '', password: '' });
    const [errores, setErrores] = useState({});
    const [cargando, setCargando] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errores[name]) {
            setErrores((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validar = () => {
        const nuevosErrores = {};
        if (!form.email.trim()) nuevosErrores.email = 'El correo es obligatorio';
        else if (!isValidEmail(form.email)) nuevosErrores.email = 'Email inválido';
        if (!form.password) nuevosErrores.password = 'La contraseña es obligatoria';
        return nuevosErrores;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const erroresValidacion = validar();
        if (Object.keys(erroresValidacion).length > 0) {
            setErrores(erroresValidacion);
            toast.error('Por favor completá los campos requeridos');
            return;
        }

        setCargando(true);

        try {
            const response = await fetch('http://localhost:8081/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await handleApiResponse(response);

            // Guardamos la información de la sesión de forma persistente y reactiva
            login(data.token, data.role || 'USER', data.nombre || '', data.avatar || null);

            toast.success('¡Bienvenido!');
            navigate('/');
        } catch (err) {
            console.error('Error en Login:', err.message);
            toast.error(`Error al iniciar sesión: ${err.message}`);
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
                            className={`form-input ${errores.email ? 'form-input--error' : ''}`}
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
                            className={`form-input ${errores.password ? 'form-input--error' : ''}`}
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