import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './LoginPage.css';
import { isValidEmail } from '../utils/validation';
import { toast } from 'react-toastify';
import { loginThunk } from '../features/auth/authSlice';
import { selectLoadingLogin } from '../features/auth/authSelectors';

/**
 * LoginPage — Autenticación de usuarios via Redux Toolkit.
 *
 * El fetch POST /api/auth/login fue migrado a loginThunk (createAsyncThunk).
 * El estado de carga y error viven en Redux (auth.loadingLogin, auth.errorLogin).
 * Tras el login exitoso, redirige al destino original (location.state.from)
 * o al home si no hay destino guardado.
 */
const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    // Destino de redirección post-login (guardado por PrivateRoute / AdminRoute)
    const from = location.state?.from?.pathname || '/';

    // Estado de carga desde Redux — no se usa useState(cargando)
    const loadingLogin = useSelector(selectLoadingLogin);

    const [form, setForm] = useState({ email: '', password: '' });
    const [errores, setErrores] = useState({});

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

        try {
            // loginThunk hace el fetch, setea token/rol/nombre en Redux
            // y store.subscribe() persiste en localStorage automáticamente.
            await dispatch(loginThunk(form)).unwrap();
            toast.success('¡Bienvenido!');
            // Redirigir al destino original o al home
            navigate(from, { replace: true });
        } catch (err) {
            // El mensaje ya viene formateado desde loginThunk.rejected
            toast.error(`Error al iniciar sesión: ${err}`);
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

                    <button type="submit" className="auth-submit" disabled={loadingLogin}>
                        {loadingLogin ? 'Verificando...' : 'Iniciar sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;