import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPanel from './pages/AdminPanel';
import ProfilePage from './pages/ProfilePage'; // Nuevo
import OrdersPage from './pages/OrdersPage';   // Nuevo
import CartSidebar from './components/CartSidebar';
import Navbar from './components/Navbar';
import { useState } from 'react';

function App() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="app-root">
            <Navbar onSearch={setSearchQuery} />
            <CartSidebar />
            <Routes>
                <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/perfil" element={<ProfilePage />} /> {/* Nueva ruta perfil */}
                <Route path="/pedidos" element={<OrdersPage />} /> {/* Nueva ruta pedidos */}
                <Route path="*" element={<div style={{padding: '100px', textAlign: 'center'}}>Página no encontrada</div>} />
            </Routes>
        </div>
    );
}

export default App;