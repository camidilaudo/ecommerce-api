import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';

/**
 * LoginPage — Componente para la autenticación de usuarios.
 * Conecta con el endpoint POST /api/auth/login de Spring Boot 4.0.5.
 */
const LoginPage = () => {
    const navigate = useNavigate();

    // Estado del formulario mapeado al DTO LoginRequest.java
    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    const [errores, setErrores] = useState({});
    const [cargando, setCargando] = useState(false);

    // Manejador dinámico de cambios en los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        // Limpia el error del campo mientras el usuario escribe
        if (errores[name]) {
            setErrores(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validación básica antes de enviar la petición a la red
    const validar = () => {
        const nuevosErrores = {};
        if (!form.email.trim()) {
            nuevosErrores.email = 'El correo es obligatorio';
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            nuevosErrores.email = 'Ingresá un formato de email válido';
        }
        if (!form.password) {
            nuevosErrores.password = 'La contraseña es obligatoria';
        }
        return nuevosErrores;
    };

    // Lógica principal de inicio de sesión (Clase 08: Async/Await)
    const handleSubmit = async (e) => {
        e.preventDefault();

        const erroresValidacion = validar();
        if (Object.keys(erroresValidacion).length > 0) {
            setErrores(erroresValidacion);
            return;
        }

        setCargando(true);

        try {
            // Petición al backend en el puerto 8081
            const response = await fetch('http://localhost:8081/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                // Manejo de credenciales incorrectas o errores de Spring Security
                throw new Error(data.mensaje || 'Credenciales inválidas');
            }

            // --- PASO CLAVE: Persistencia del Token JWT ---
            // Guardamos el token en localStorage para futuras peticiones (Carrito/Admin)
            localStorage.setItem('token', data.token);

            // Opcional: Podés guardar el rol o nombre de usuario si tu API lo devuelve
            if (data.nombre) localStorage.setItem('usuarioNombre', data.nombre);

            alert(`¡Bienvenido de nuevo!`);

            // Redirige a la Home tras el éxito
            navigate('/');

        } catch (err) {
            console.error("Error en el proceso de Login:", err.message);
            alert(`Error al iniciar sesión: ${err.message}`);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Navegación fluida SPA */}
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

                    {/* Campo: Email */}
                    <div className="form-grupo">
                        <label className="form-label" htmlFor="email">Correo electrónico</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className={errores.email ? 'form-input--error' : ''}
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                            required
                        />
                        {errores.email && (
                            <span className="form-error">{errores.email}</span>
                        )}
                    </div>

                    {/* Campo: Password */}
                    <div className="form-grupo">
                        <label className="form-label" htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className={errores.password ? 'form-input--error' : ''}
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            required
                        />
                        {errores.password && (
                            <span className="form-error">{errores.password}</span>
                        )}
                    </div>

                    {/* Botón de acción con estado de carga */}
                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={cargando}
                    >
                        {cargando ? 'Verificando...' : 'Iniciar sesión'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default LoginPage;