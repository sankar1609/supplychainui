import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './auth/Login';
import SupplyChainPortal from './components/SupplyChainPortal';
import './styles/App.css';
import Register from './auth/Register';
import CreateAdminUser from './auth/createAdminUser';
import AdminLogin from './auth/AdminLogin';
import QueryLogByProduct from './components/QueryLogByProduct';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    // Re-check whenever storage changes (for logout/login from other tabs)
    useEffect(() => {
        const checkAuth = () => {
            setIsAuthenticated(!!localStorage.getItem('token'));
        };

        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Login */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/create-admin" element={<CreateAdminUser />} />
                    <Route path="/admin-login" element={<AdminLogin />} />
                    {/* Protected route */}
                    <Route
                        path="/queryProduct"
                        element={
                            isAuthenticated ? (
                                <SupplyChainPortal />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />

                    {/* Query logs route (protected) */}
                    <Route
                        path="/queryLogs"
                        element={
                            isAuthenticated ? (
                                <QueryLogByProduct />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />

                    {/* Default route */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
