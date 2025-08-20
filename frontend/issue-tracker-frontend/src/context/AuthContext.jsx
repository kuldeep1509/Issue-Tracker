import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import Cookies from 'js-cookie';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // Initial loading state for auth check
    const navigate = useNavigate();

    const logout = useCallback(() => {
        // Clear tokens from cookies
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        // Clear user state
        setUser(null);
        setIsAuthenticated(false);
        navigate('/login'); // Redirect to login page on logout
    }, [navigate]);

    // Function to load user details after successful login or on app load
    const loadUser = useCallback(async () => {
        const accessToken = Cookies.get('access_token');
        if (accessToken) {
            try {
                // Verify the token validity with the backend
                await api.post('/auth/jwt/verify/', { token: accessToken });
                // Fetch user details from the backend
                const res = await api.get('/auth/users/me/');
                setUser(res.data);
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Failed to load user or token invalid:", error.response?.data || error.message);
                logout(); // Clear invalid tokens and state
            }
        }
        setLoading(false); // Set loading to false once auth check is complete
    }, [logout]);

    // Effect to check authentication status on component mount
    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = useCallback(async (username, password) => {
        try {
            // Call Djoser's JWT create endpoint
            const res = await api.post('/auth/jwt/create/', { username, password });
            const { access, refresh } = res.data;
 
            // Store tokens in cookies
            Cookies.set('access_token', access, { expires: 1 / 24, secure: process.env.NODE_ENV === 'production' });
            Cookies.set('refresh_token', refresh, { expires: 7, secure: process.env.NODE_ENV === 'production' });
 
            // Set authenticated state and redirect immediately
            setIsAuthenticated(true);
            navigate('/dashboard');
 
            // Load user data in the background for a faster perceived login
            await loadUser();
 
            return true;
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
            setIsAuthenticated(false);
            
            // Check if it's an authentication error (401) and throw specific error
            if (error.response?.status === 401) {
                throw new Error('Invalid username or password. Please try again.');
            }
            
            // For other errors, throw a generic error
            throw new Error('Something went wrong. Please try again.');
        }
    }, [navigate, loadUser]);

    const register = useCallback(async (username, email, password) => {
        try {
            // Call Djoser's user registration endpoint
            const res = await api.post('/auth/users/', { username, email, password });
            return res.data; // Return new user data if needed (e.g., for success message)
        } catch (error) {
            console.error("Registration failed in AuthContext:", error.response?.data || error.message);
            throw error; // Re-throw to allow component to catch and display specific errors
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
