/**
 * Validaciones simples para frontend
 */

export const isValidEmail = (email) => {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return re.test(String(email).toLowerCase());
};

/**
 * isValidDate - acepta strings que Date puede parsear y evita fechas válidas futuras
 * Formato recomendado en inputs: YYYY-MM-DD (HTML date input)
 */
export const isValidDate = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return false;
    // No permitir fechas en el futuro
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d <= today;
};