import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { FavoriteProvider } from './context/FavoriteContext'
import './index.css'
import App from './App.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <FavoriteProvider>
                    <CartProvider>
                        <App />
                        <ToastContainer position="top-right" autoClose={4000} />
                    </CartProvider>
                </FavoriteProvider>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
)