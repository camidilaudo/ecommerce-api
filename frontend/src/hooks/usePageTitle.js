import { useEffect } from 'react';

const APP_NAME = 'E-Commerce';

/**
 * usePageTitle — Hook para establecer el título dinámico de cada página.
 *
 * Centraliza la lógica de `document.title` en un único lugar.
 * Al desmontar el componente, restaura el título por defecto del sitio
 * para evitar que el título de una página quede visible en otra.
 *
 * Uso:
 *   usePageTitle('Mi Perfil');
 *   // → document.title = "Mi Perfil | Antigravity"
 *
 * Con título vacío (para usar solo el nombre del sitio):
 *   usePageTitle('');
 *   // → document.title = "Antigravity"
 *
 * @param {string} pageTitle — Título de la página actual
 */
const usePageTitle = (pageTitle) => {
    useEffect(() => {
        document.title = pageTitle
            ? `${pageTitle} | ${APP_NAME}`
            : APP_NAME;

        // Restaurar el título por defecto al desmontar
        return () => {
            document.title = APP_NAME;
        };
    }, [pageTitle]);
};

export default usePageTitle;
