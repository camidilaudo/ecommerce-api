import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { handleApiResponse } from '../utils/apiHelpers';
import './UsersPage.css';
import './AdminPanel.css';

const API_BASE = 'http://localhost:8081';

// ── Utilidades ──────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
        return new Date(dateStr).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch {
        return '—';
    }
};

// ── Skeleton Row ─────────────────────────────────────────────────────────────

const SkeletonRows = ({ count = 6 }) => (
    <>
        {Array.from({ length: count }).map((_, i) => (
            <tr key={i} className="users-skeleton-row">
                <td><div className="skeleton-line skeleton-line--short" /></td>
                <td><div className="skeleton-line skeleton-line--medium" /></td>
                <td><div className="skeleton-line skeleton-line--long" /></td>
                <td><div className="skeleton-line skeleton-line--pill" /></td>
                <td><div className="skeleton-line skeleton-line--pill" /></td>
                <td><div className="skeleton-line skeleton-line--medium" /></td>
                <td><div className="skeleton-line skeleton-line--medium" /></td>
            </tr>
        ))}
    </>
);

// ── KPI Card de Estadísticas (reutiliza estilos de AdminPanel) ───────────────

const StatsKpiCard = ({ icon, label, value, colorClass }) => (
    <div className={`admin-kpi-card ${colorClass || ''}`}>
        <div className="kpi-icon">{icon}</div>
        <div className="kpi-content">
            <span className="kpi-label">{label}</span>
            <h3 className="kpi-value">{value}</h3>
        </div>
    </div>
);

// ── Componente principal ─────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 8;

const UsersPage = () => {
    const navigate = useNavigate();
    const { token, userRole } = useAuth();

    // ── Estado ────────────────────────────────────────────────────────────────
    const [usuarios, setUsuarios] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const [searchValue, setSearchValue] = useState('');
    const [sortKey, setSortKey] = useState('id');
    const [sortDir, setSortDir] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);

    const debounceRef = useRef(null);

    // ── Guardia de rol ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        if (userRole !== 'ADMIN') {
            toast.error('Acceso restringido. Se requiere rol ADMIN.');
            navigate('/');
        }
    }, [token, userRole, navigate]);

    // ── Carga de datos ────────────────────────────────────────────────────────
    const fetchUsuarios = useCallback(async (search = '') => {
        try {
            setLoading(true);
            const url = search.trim()
                ? `${API_BASE}/api/usuarios?search=${encodeURIComponent(search.trim())}`
                : `${API_BASE}/api/usuarios`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await handleApiResponse(res);
            setUsuarios(data || []);
            setCurrentPage(1);
        } catch (err) {
            toast.error(`No se pudo cargar la lista de usuarios: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch {
            // Stats no críticas — falla silenciosamente
        }
    }, [token]);

    useEffect(() => {
        if (userRole === 'ADMIN') {
            fetchUsuarios();
            fetchStats();
        }
    }, [userRole, fetchUsuarios, fetchStats]);

    // ── Búsqueda con debounce ─────────────────────────────────────────────────
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchValue(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchUsuarios(val);
        }, 400);
    };

    const handleClearSearch = () => {
        setSearchValue('');
        fetchUsuarios('');
    };

    // ── Ordenamiento ──────────────────────────────────────────────────────────
    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
        setCurrentPage(1);
    };

    const sortedUsuarios = [...usuarios].sort((a, b) => {
        let aVal = a[sortKey] ?? '';
        let bVal = b[sortKey] ?? '';
        if (sortKey === 'id') {
            return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }
        if (typeof aVal === 'boolean') {
            return sortDir === 'asc' ? (aVal ? -1 : 1) : (aVal ? 1 : -1);
        }
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    // ── Paginación ────────────────────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(sortedUsuarios.length / ITEMS_PER_PAGE));
    const paginatedUsuarios = sortedUsuarios.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // ── Bloquear / Desbloquear ────────────────────────────────────────────────
    const handleToggleActivo = async (usuario) => {
        const accion = usuario.activo ? 'bloquear' : 'desbloquear';
        const confirmMsg = usuario.activo
            ? `¿Bloqueás la cuenta de ${usuario.nombre} ${usuario.apellido}? No podrá iniciar sesión.`
            : `¿Desbloqueás la cuenta de ${usuario.nombre} ${usuario.apellido}?`;

        if (!window.confirm(confirmMsg)) return;

        setActionLoadingId(usuario.id);
        try {
            const res = await fetch(`${API_BASE}/api/usuarios/${usuario.id}/toggle-activo`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ activo: !usuario.activo }),
            });
            await handleApiResponse(res);

            const verb = usuario.activo ? 'bloqueado' : 'desbloqueado';
            toast.success(`Usuario ${usuario.nombre} ${usuario.apellido} ${verb} exitosamente.`);

            // Actualizar estado local sin recargar toda la lista
            setUsuarios((prev) =>
                prev.map((u) =>
                    u.id === usuario.id ? { ...u, activo: !u.activo } : u
                )
            );
            fetchStats();
        } catch (err) {
            toast.error(`No se pudo ${accion} al usuario: ${err.message}`);
        } finally {
            setActionLoadingId(null);
        }
    };

    // ── Icono de sort ─────────────────────────────────────────────────────────
    const SortIcon = ({ col }) => {
        if (sortKey !== col) return <i className="sort-icon">↕</i>;
        return <i className="sort-icon">{sortDir === 'asc' ? '↑' : '↓'}</i>;
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="admin-page container">

            {/* Breadcrumb */}
            <nav className="users-breadcrumb" aria-label="Breadcrumb">
                <button onClick={() => navigate('/admin')}>Dashboard</button>
                <span className="users-breadcrumb-sep">›</span>
                <span className="users-breadcrumb-current">Usuarios</span>
            </nav>

            {/* Header */}
            <header className="users-page-header">
                <div className="users-page-title">
                    <h2>Gestión de Usuarios</h2>
                    <p>Administrá el acceso y el estado de las cuentas registradas</p>
                </div>
                <button className="btn-back-store" onClick={() => navigate('/admin')}>
                    ← Volver al Dashboard
                </button>
            </header>

            {/* KPI Cards de estadísticas (reutiliza admin-kpi-grid) */}
            {stats && (
                <div className="admin-kpi-grid" style={{ marginBottom: '36px' }}>
                    <StatsKpiCard icon="👥" label="Usuarios Totales" value={stats.totalUsers ?? 0} />
                    <StatsKpiCard icon="✅" label="Usuarios Activos" value={stats.totalActivos ?? 0} />
                    <StatsKpiCard icon="🔒" label="Usuarios Bloqueados" value={stats.totalBloqueados ?? 0} />
                    <StatsKpiCard icon="🛡️" label="Administradores" value={stats.totalAdmins ?? 0} />
                    <StatsKpiCard icon="🛒" label="Clientes" value={stats.totalClientes ?? 0} />
                </div>
            )}

            {/* Controles de búsqueda */}
            <div className="users-controls">
                <div className="users-search-wrapper">
                    <span className="users-search-icon">🔍</span>
                    <input
                        id="users-search"
                        type="text"
                        className="users-search-input"
                        placeholder="Buscar por nombre, email o usuario..."
                        value={searchValue}
                        onChange={handleSearchChange}
                        autoComplete="off"
                        aria-label="Buscar usuarios"
                    />
                    {searchValue && (
                        <button
                            className="users-search-clear"
                            onClick={handleClearSearch}
                            aria-label="Limpiar búsqueda"
                        >
                            ×
                        </button>
                    )}
                </div>
                <span className="users-count-badge">
                    {loading ? 'Cargando...' : `${sortedUsuarios.length} usuario${sortedUsuarios.length !== 1 ? 's' : ''}`}
                </span>
            </div>

            {/* Tabla */}
            <div className="users-table-card">
                <div className="users-table-wrapper">
                    <table className="users-table" aria-label="Lista de usuarios">
                        <thead>
                            <tr>
                                <th
                                    className={`sortable${sortKey === 'id' ? ' sort-active' : ''}`}
                                    onClick={() => handleSort('id')}
                                    title="Ordenar por ID"
                                >
                                    ID <SortIcon col="id" />
                                </th>
                                <th
                                    className={`sortable${sortKey === 'nombre' ? ' sort-active' : ''}`}
                                    onClick={() => handleSort('nombre')}
                                    title="Ordenar por nombre"
                                >
                                    Nombre <SortIcon col="nombre" />
                                </th>
                                <th
                                    className={`sortable${sortKey === 'email' ? ' sort-active' : ''}`}
                                    onClick={() => handleSort('email')}
                                    title="Ordenar por email"
                                >
                                    Email <SortIcon col="email" />
                                </th>
                                <th
                                    className={`sortable${sortKey === 'role' ? ' sort-active' : ''}`}
                                    onClick={() => handleSort('role')}
                                    title="Ordenar por rol"
                                >
                                    Rol <SortIcon col="role" />
                                </th>
                                <th
                                    className={`sortable${sortKey === 'activo' ? ' sort-active' : ''}`}
                                    onClick={() => handleSort('activo')}
                                    title="Ordenar por estado"
                                >
                                    Estado <SortIcon col="activo" />
                                </th>
                                <th
                                    className={`sortable${sortKey === 'fechaCreacion' ? ' sort-active' : ''}`}
                                    onClick={() => handleSort('fechaCreacion')}
                                    title="Ordenar por fecha de registro"
                                >
                                    Registrado <SortIcon col="fechaCreacion" />
                                </th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <SkeletonRows count={ITEMS_PER_PAGE} />
                            ) : paginatedUsuarios.length === 0 ? (
                                <tr>
                                    <td colSpan={7}>
                                        <div className="users-empty">
                                            <div className="users-empty-icon">
                                                {searchValue ? '🔍' : '👥'}
                                            </div>
                                            <p>
                                                {searchValue
                                                    ? `Sin resultados para "${searchValue}"`
                                                    : 'No hay usuarios registrados'}
                                            </p>
                                            {searchValue && (
                                                <span>Intentá con otro término de búsqueda</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsuarios.map((u) => (
                                    <tr key={u.id}>
                                        <td className="user-id">#{u.id}</td>
                                        <td>
                                            <div className="user-name">
                                                {u.nombre} {u.apellido}
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                                @{u.nombreUsuario}
                                            </div>
                                        </td>
                                        <td className="user-email">{u.email}</td>
                                        <td>
                                            <span className={`role-badge role-badge--${u.role === 'ADMIN' ? 'admin' : 'user'}`}>
                                                {u.role === 'ADMIN' ? '🛡️ Admin' : '👤 Cliente'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-badge--${u.activo ? 'active' : 'blocked'}`}>
                                                {u.activo ? 'Activo' : 'Bloqueado'}
                                            </span>
                                        </td>
                                        <td className="user-date">{formatDate(u.fechaCreacion)}</td>
                                        <td>
                                            <div className="users-actions-cell">
                                                <button
                                                    id={`btn-toggle-${u.id}`}
                                                    className={`users-action-btn ${u.activo ? 'users-action-btn--block' : 'users-action-btn--unblock'}`}
                                                    onClick={() => handleToggleActivo(u)}
                                                    disabled={actionLoadingId === u.id}
                                                    aria-label={u.activo ? `Bloquear a ${u.nombre}` : `Desbloquear a ${u.nombre}`}
                                                    title={u.activo ? 'Bloquear usuario' : 'Desbloquear usuario'}
                                                >
                                                    {actionLoadingId === u.id
                                                        ? '...'
                                                        : u.activo
                                                            ? '🔒 Bloquear'
                                                            : '🔓 Desbloquear'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación — reutiliza clases de AdminPanel.css */}
                {!loading && totalPages > 1 && (
                    <div className="pagination-controls">
                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            aria-label="Página anterior"
                        >
                            Anterior
                        </button>
                        <span className="pagination-info">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            aria-label="Página siguiente"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsersPage;
