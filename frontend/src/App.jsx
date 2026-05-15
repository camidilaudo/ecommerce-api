import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartSidebar from './components/CartSidebar';
import Navbar from './components/Navbar';
import { useState } from 'react';

/**
 * Componente principal.
 * Mantiene el estado de búsqueda global para la HomePage.
 */
function App() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="app-root">
            {/* Navbar y Sidebar globales */}
            <Navbar onSearch={setSearchQuery} />
            <CartSidebar />

            <Routes>
                {/* HomePage recibe la búsqueda de la Navbar */}
                <Route path="/" element={<HomePage searchQuery={searchQuery} />} />

                {/* Rutas de autenticación */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route path="*" element={<div style={{padding: '100px', textAlign: 'center'}}>Página no encontrada</div>} />
            </Routes>
        </div>
    );
}

export default App;