import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './LoginPage.css'; // Usamos el CSS unificado
import { isValidEmail, isValidDate } from '../utils/validation';
import { toast } from 'react-toastify';
import AvatarPicker from '../components/AvatarPicker';
import { registerThunk } from '../features/auth/authSlice';
import { selectLoadingRegister } from '../features/auth/authSelectors';

/**
 * RegisterPage — Registro de usuario via Redux Toolkit.
 *
 * El fetch POST /api/auth/register fue migrado a registerThunk (createAsyncThunk).
 * El estado de carga vive en Redux (auth.loadingRegister).
 * Tras el registro exitoso, redirige a /login.
 */
const RegisterPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Estado de carga desde Redux — no se usa useState(cargando)
    const loadingRegister = useSelector(selectLoadingRegister);

    // Estado del formulario mapeado al DTO RegisterRequest
    const [form, setForm] = useState({
        nombreUsuario: '',
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        fechaNacimiento: '',
        sexo: '',
        avatar: 'avatar1.webp', // avatar por defecto
    });

    const [errores, setErrores] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errores[name]) {
            setErrores((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleAvatarSelect = (filename) => {
        setForm((prev) => ({ ...prev, avatar: filename }));
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
            const hasLower = /[a-z]/.test(form.password);
            const hasNum = /\d/.test(form.password);
            if (form.password.length < 6) {
                err.password = 'Mínimo 6 caracteres';
            } else if (!hasUpper || !hasLower || !hasNum) {
                err.password = 'Debe incluir al menos una mayúscula, una minúscula y un número';
            }
        }

        if (!form.fechaNacimiento) err.fechaNacimiento = 'Obligatorio';
        else if (!isValidDate(form.fechaNacimiento)) err.fechaNacimiento = 'Fecha inválida o futura';

        if (!form.sexo) err.sexo = 'Seleccioná una opción';
        return err;
    };

    // Controlador del envío que despacha registerThunk
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Validar campos en el cliente
        const erroresValidacion = validar();
        if (Object.keys(erroresValidacion).length > 0) {
            setErrores(erroresValidacion);
            toast.error('Por favor corregí los campos marcados');
            return;
        }

        try {
            // registerThunk hace el POST y gestiona loading/error en Redux
            await dispatch(registerThunk(form)).unwrap();
            toast.success(`Usuario ${form.nombreUsuario} creado correctamente`);
            navigate('/login');
        } catch (err) {
            // El mensaje ya viene formateado desde registerThunk.rejected
            toast.error(`Error al registrar usuario: ${err}`);
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
                            Mínimo de 6 caracteres con al menos una mayúscula, una minúscula y un número.
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

                    {/* Selector de avatar predefinido */}
                    <AvatarPicker
                        selectedAvatar={form.avatar}
                        onSelect={handleAvatarSelect}
                        label="Elegí tu avatar"
                    />

                    <button type="submit" className="auth-submit" disabled={loadingRegister}>
                        {loadingRegister ? 'Registrando...' : 'Crear cuenta'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;