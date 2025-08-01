// src/App.js

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import { CssBaseline } from '@mui/material'; // Material-UI's CSS reset
import TeamForm from './pages/TeamForm';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS
import Layout from './components/Layout';


function App() {
    return (
        <Router>
            <CssBaseline />
            <AuthProvider> {/* Provides authentication context to all child components */}
                 {/* Global layout component for consistent header */}
                 
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        
                        
                        {/* Protected Routes - require authentication */}
                        {/* The <Outlet /> in ProtectedRoute will render the nested routes */}
                        <Route element={<ProtectedRoute />}>
                            <Route index element={<Layout><Dashboard /></Layout>} /> {/* Default route for authenticated users */}
                            <Route path="dashboard" element={<Layout><Dashboard /></Layout>} /> {/* Explicit dashboard route */}
                            <Route path="/teams" element={<TeamForm />} />
                            {/* Add more protected routes here as your app grows */}
                        </Route>
                    

                        {/* Catch-all route: Redirects unauthenticated users to login or shows 404 */}
                       
                        <Route path="*" element={<LoginPage />} />
                    </Routes>
               
                
            </AuthProvider>
            {/* ToastContainer added here, typically at the root of your app */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </Router>
    );
}

export default App;
