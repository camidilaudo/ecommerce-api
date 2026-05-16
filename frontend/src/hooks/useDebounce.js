import { useEffect, useState } from 'react';

/**
 * useDebounce - devuelve el valor debounced después del delay
 * Uso: const debounced = useDebounce(value, 300);
 */
export default function useDebounce(value, delay = 300) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);

    return debounced;
}