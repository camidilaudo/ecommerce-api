import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Usamos el CSS unificado
import { isValidEmail, isValidDate } from '../utils/validation';
import { handleApiResponse } from '../utils/apiHelpers';
import { toast } from 'react-toastify';

/**
 * RegisterPage — Página de registro de usuario.
 * Cumple los requisitos del TPO: nombreUsuario, nombre, apellido, email, password, fechaNacimiento, sexo.
 */
const RegisterPage = () => {
    const navigate = useNavigate();

    // Estado del formulario mapeado al DTO RegisterRequest
    const [form, setForm] = useState({
        nombreUsuario: '',
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        fechaNacimiento: '',
        sexo: '',
    });

    const [errores, setErrores] = useState({});
    const [cargando, setCargando] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errores[name]) {
            setErrores((prev) => ({ ...prev, [name]: '' }));
        }
    };

    // Validación básica del lado del cliente antes de enviar a Spring Boot
    const validar = () => {
        const err = {};
        if (!form.nombreUsuario.trim()) err.nombreUsuario = 'Obligatorio';
        if (!form.nombre.trim()) err.nombre = 'Obligatorio';
        if (!form.apellido.trim()) err.apellido = 'Obligatorio';

        if (!form.email.trim()) err.email = 'Obligatorio';
        else if (!isValidEmail(form.email)) err.email = 'Email inválido';

        if (!form.password) err.password = 'Obligatorio';
        else {
            const hasUpper = /[A-Z]/.test(form.password);
            const hasNum = /\d/.test(form.password);
            if (form.password.length < 6) {
                err.password = 'Mínimo 6 caracteres';
            } else if (!hasUpper || !hasNum) {
                err.password = 'Debe incluir al menos una mayúscula y un número';
            }
        }

        if (!form.fechaNacimiento) err.fechaNacimiento = 'Obligatorio';
        else if (!isValidDate(form.fechaNacimiento)) err.fechaNacimiento = 'Fecha inválida o futura';

        if (!form.sexo) err.sexo = 'Seleccioná una opción';
        return err;
    };

    // Controlador del envío que consume la API mediante async/await
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Validar campos en el cliente
        const erroresValidacion = validar();
        if (Object.keys(erroresValidacion).length > 0) {
            setErrores(erroresValidacion);
            // Mostrar resumen breve
            toast.error('Por favor corregí los campos marcados');
            return;
        }

        setCargando(true);

        try {
            const response = await fetch('http://localhost:8081/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            await handleApiResponse(response);

            toast.success(`Usuario ${form.nombreUsuario} creado correctamente`);
            navigate('/login');
        } catch (err) {
            console.error('Error crítico de integración de Auth:', err.message);
            toast.error(`Error al registrar usuario: ${err.message}`);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="auth-page">
            <button className="auth-back" onClick={() => navigate('/')}>
                ← Volver al inicio
            </button>

            <div className="auth-card auth-card--wide">
                <div className="auth-header">
                    <h1 className="auth-logo">Grupo 3 <span>— Ecommerce</span></h1>
                    <h2 className="auth-titulo">Crear cuenta</h2>
                    <p className="auth-subtitulo">
                        ¿Ya tenés cuenta?{' '}
                        <button className="auth-link" onClick={() => navigate('/login')}>
                            Iniciá sesión
                        </button>
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="form-grupo">
                        <label className="form-label" htmlFor="nombreUsuario">Nombre de usuario</label>
                        <input
                            id="nombreUsuario"
                            name="nombreUsuario"
                            type="text"
                            className={`form-input ${errores.nombreUsuario ? 'form-input--error' : ''}`}
                            value={form.nombreUsuario}
                            onChange={handleChange}
                            autoComplete="username"
                        />
                        {errores.nombreUsuario && <span className="form-error">{errores.nombreUsuario}</span>}
                    </div>

                    <div className="form-fila">
                        <div className="form-grupo">
                            <label className="form-label" htmlFor="nombre">Nombre</label>
                            <input
                                id="nombre"
                                name="nombre"
                                type="text"
                                className={`form-input ${errores.nombre ? 'form-input--error' : ''}`}
                                value={form.nombre}
                                onChange={handleChange}
                                autoComplete="given-name"
                            />
                            {errores.nombre && <span className="form-error">{errores.nombre}</span>}
                        </div>

                        <div className="form-grupo">
                            <label className="form-label" htmlFor="apellido">Apellido</label>
                            <input
                                id="apellido"
                                name="apellido"
                                type="text"
                                className={`form-input ${errores.apellido ? 'form-input--error' : ''}`}
                                value={form.apellido}
                                onChange={handleChange}
                                autoComplete="family-name"
                            />
                            {errores.apellido && <span className="form-error">{errores.apellido}</span>}
                        </div>
                    </div>

                    <div className="form-grupo">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className={`form-input ${errores.email ? 'form-input--error' : ''}`}
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
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
                            autoComplete="new-password"
                        />
                        <span style={{ fontSize: '11px', color: '#8e8e93', marginTop: '4px', display: 'block' }}>
                            Mínimo de 6 caracteres con al menos una mayúscula y un número.
                        </span>
                        {errores.password && <span className="form-error">{errores.password}</span>}
                    </div>

                    <div className="form-fila">
                        <div className="form-grupo">
                            <label className="form-label" htmlFor="fechaNacimiento">Fecha de nacimiento (YYYY-MM-DD)</label>
                            <input
                                id="fechaNacimiento"
                                name="fechaNacimiento"
                                type="date"
                                className={`form-input ${errores.fechaNacimiento ? 'form-input--error' : ''}`}
                                value={form.fechaNacimiento}
                                onChange={handleChange}
                            />
                            {errores.fechaNacimiento && <span className="form-error">{errores.fechaNacimiento}</span>}
                        </div>

                        <div className="form-grupo">
                            <label className="form-label" htmlFor="sexo">Sexo</label>
                            <select
                                id="sexo"
                                name="sexo"
                                className={`form-input form-select ${errores.sexo ? 'form-input--error' : ''}`}
                                value={form.sexo}
                                onChange={handleChange}
                            >
                                <option value="">Seleccionar...</option>
                                <option value="MASCULINO">Masculino</option>
                                <option value="FEMENINO">Femenino</option>
                                <option value="OTRO">Otro</option>
                                <option value="PREFIERO_NO_DECIR">Prefiero no decir</option>
                            </select>
                            {errores.sexo && <span className="form-error">{errores.sexo}</span>}
                        </div>
                    </div>

                    <button type="submit" className="auth-submit" disabled={cargando}>
                        {cargando ? 'Registrando...' : 'Crear cuenta'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;