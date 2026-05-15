import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css'; // Usamos el CSS unificado

/**
 * RegisterPage — Página de registro de usuario.
 * Cumple los requisitos del TPO: nombreUsuario, nombre, apellido, email, password, fechaNacimiento, sexo.
 */
const RegisterPage = () => {
    const navigate = useNavigate();

    // Estado del formulario mapeado al DTO RegisterRequest
    const [form, setForm] = useState({
        nombreUsuario:   '',
        nombre:          '',
        apellido:        '',
        email:           '',
        password:        '',
        fechaNacimiento: '',
        sexo:            '',
    });

    const [errores, setErrores]   = useState({});
    const [cargando, setCargando] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errores[name]) {
            setErrores(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validación básica del lado del cliente antes de enviar a Spring Boot
    const validar = () => {
        const err = {};
        if (!form.nombreUsuario.trim()) err.nombreUsuario = 'Obligatorio';
        if (!form.nombre.trim()) err.nombre = 'Obligatorio';
        if (!form.apellido.trim()) err.apellido = 'Obligatorio';
        if (!form.email.trim()) err.email = 'Obligatorio';
        else if (!/\S+@\S+\.\S+/.test(form.email)) err.email = 'Email inválido';
        if (!form.password) err.password = 'Obligatorio';
        else if (form.password.length < 6) err.password = 'Mínimo 6 caracteres';
        if (!form.fechaNacimiento) err.fechaNacimiento = 'Obligatorio';
        if (!form.sexo) err.sexo = 'Seleccioná una opción';
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
        console.log("Registrando usuario:", form);

        // Simulación de éxito de la API
        setTimeout(() => {
            setCargando(false);
            alert(`¡Usuario ${form.nombreUsuario} creado! Procede a loguearte.`);
            navigate('/login');
        }, 800);
    };

    return (
        <div className="auth-page">
            {/* Navegación corregida con useNavigate */}
            <button className="auth-back" onClick={() => navigate('/')}>
                ← Volver al inicio
            </button>

            <div className="auth-card auth-card--wide">
                <div className="auth-header">
                    <h1 className="auth-logo">Grupo 3 <span>— Ecommerce</span></h1>
                    <h2 className="auth-titulo">Crear cuenta</h2>
                    <p className="auth-subtitulo">
                        ¿Ya tenés cuenta?{' '}
                        {/* Navegación corregida con useNavigate */}
                        <button className="auth-link" onClick={() => navigate('/login')}>
                            Iniciá sesión
                        </button>
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    {/* Fila: nombre de usuario */}
                    <div className="form-grupo">
                        <label className="form-label" htmlFor="nombreUsuario">Nombre de usuario</label>
                        <input
                            id="nombreUsuario"
                            name="nombreUsuario"
                            type="text"
                            className={errores.nombreUsuario ? 'form-input--error' : ''}
                            value={form.nombreUsuario}
                            onChange={handleChange}
                            required
                        />
                        {errores.nombreUsuario && <span className="form-error">{errores.nombreUsuario}</span>}
                    </div>

                    {/* Fila: nombre + apellido */}
                    <div className="form-fila">
                        <div className="form-grupo">
                            <label className="form-label" htmlFor="nombre">Nombre</label>
                            <input
                                id="nombre"
                                name="nombre"
                                type="text"
                                className={errores.nombre ? 'form-input--error' : ''}
                                value={form.nombre}
                                onChange={handleChange}
                                required
                            />
                            {errores.nombre && <span className="form-error">{errores.nombre}</span>}
                        </div>
                        <div className="form-grupo">
                            <label className="form-label" htmlFor="apellido">Apellido</label>
                            <input
                                id="apellido"
                                name="apellido"
                                type="text"
                                className={errores.apellido ? 'form-input--error' : ''}
                                value={form.apellido}
                                onChange={handleChange}
                                required
                            />
                            {errores.apellido && <span className="form-error">{errores.apellido}</span>}
                        </div>
                    </div>

                    {/* Fila: Email */}
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

                    {/* Fila: fecha de nacimiento + sexo */}
                    <div className="form-fila">
                        <div className="form-grupo">
                            {/* Label descriptiva mantenida por solicitud del usuario */}
                            <label className="form-label" htmlFor="fechaNacimiento">
                                Fecha de nacimiento (YYYY-MM-DD)
                            </label>
                            <input
                                id="fechaNacimiento"
                                name="fechaNacimiento"
                                type="date"
                                className={errores.fechaNacimiento ? 'form-input--error' : ''}
                                value={form.fechaNacimiento}
                                onChange={handleChange}
                                required
                            />
                            {errores.fechaNacimiento && <span className="form-error">{errores.fechaNacimiento}</span>}
                        </div>
                        <div className="form-grupo">
                            <label className="form-label" htmlFor="sexo">Sexo</label>
                            {/* Los valores coinciden EXACTAMENTE con el Enum Sexo.java del backend */}
                            <select
                                id="sexo"
                                name="sexo"
                                className={errores.sexo ? 'form-input--error' : ''}
                                value={form.sexo}
                                onChange={handleChange}
                                required
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

                    {/* Botón submit: Centrado y Azul Eléctrico vía CSS */}
                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={cargando}
                    >
                        {cargando ? 'Registrando...' : 'Crear cuenta'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;