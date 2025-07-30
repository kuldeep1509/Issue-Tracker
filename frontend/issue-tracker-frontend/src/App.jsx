// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import { CssBaseline } from '@mui/material'; // Material-UI's CSS reset


function App() {
    return (
        <Router>
            
            <CssBaseline /> 
            <AuthProvider> {/* Provides authentication context to all child components */}
                <Layout> {/* Global layout component for consistent header */}
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        {/* Protected Routes - require authentication */}
                        {/* The <Outlet /> in ProtectedRoute will render the nested routes */}
                        <Route element={<ProtectedRoute />}>
                            <Route index element={<Dashboard />} /> {/* Default route for authenticated users */}
                            <Route path="dashboard" element={<Dashboard />} /> {/* Explicit dashboard route */}
                            {/* Add more protected routes here as your app grows */}
                        </Route>

                        {/* Catch-all route: Redirects unauthenticated users to login or shows 404 */}
                        {/* This route should ideally be last */}
                        <Route path="*" element={<LoginPage />} />
                    </Routes>
                </Layout>
            </AuthProvider>
        
        </Router>
    );
}

export default App;