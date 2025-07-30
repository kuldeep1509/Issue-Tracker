// src/App.js

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
// Assuming you have a Layout component that contains the AppBar/Toolbar
// If not, you might need to integrate the AppBar directly into Dashboard or create a simple layout.
import Layout from './components/Layout'; // This was in your previous App.js
import ProtectedRoute from './components/ProtectedRoute'; // Your protected route component
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import { CssBaseline } from '@mui/material'; // Material-UI's CSS reset
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

function App() {
    return (
        <Router>
            <CssBaseline /> {/* Material-UI's CSS reset */}
            <AuthProvider>
                {/* Provides authentication context to all child components */}
                {/* Layout component for consistent header/footer/etc. */}
                {/* If you don't have a specific Layout component, you might wrap Routes directly */}
                <Layout>
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
            {/* ToastContainer for displaying notifications */}
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </Router>
    );
}

export default App;