import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './context/CartContext' // Asegurate de que esta línea esté presente
import './index.css'
import App from './App.jsx'

/**
 * Inicialización de la aplicación.
 * Se envuelve en CartProvider para habilitar la funcionalidad del carrito global.
 */
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            {/* El CartProvider permite que la lógica del carrito viva en todo el sitio */}
            <CartProvider>
                <App />
            </CartProvider>
        </BrowserRouter>
    </StrictMode>,
)