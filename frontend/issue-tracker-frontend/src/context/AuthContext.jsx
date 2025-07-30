// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import Cookies from 'js-cookie';
// Import the specific authentication functions from your new api.js
import { login as apiLogin, register as apiRegister, logout as apiLogout, getUsers } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // Initial loading state for auth check
    const navigate = useNavigate();

    // Function to load user details after successful login or on app load
    const loadUser = useCallback(async () => {
        const accessToken = Cookies.get('access_token');
        if (accessToken) {
            try {
                // Verify the token validity with the backend using a simple endpoint that requires auth
                // If getUsers() is protected and accessible to authenticated users, it serves as a good check
                // Otherwise, you might need a dedicated endpoint like /auth/users/me/ or /auth/jwt/verify/
                // Based on your api.js, /auth/users/me/ is a good option.
                const res = await getUsers(); // Or api.get('/auth/users/me/') if getUsers is not suitable
                setUser(res.data);
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Failed to load user or token invalid:", error.response?.data || error.message);
                logout(); // Clear invalid tokens and state
            }
        }
        setLoading(false); // Set loading to false once auth check is complete
    }, []);

    // Effect to check authentication status on component mount
    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = async (username, password) => {
        try {
            // Use the imported apiLogin function
            const res = await apiLogin(username, password);

            // Tokens are already handled by api.js interceptors and stored in cookies there.
            // No need to manually set cookies here.

            await loadUser(); // Fetch user details and update auth state
            navigate('/dashboard'); // Redirect to dashboard after successful login
            return true;
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
            setIsAuthenticated(false);
            return false;
        }
    };

    const register = async (username, email, password) => {
        try {
            // Use the imported apiRegister function
            const res = await apiRegister(username, email, password);
            return res.data; // Return new user data if needed (e.g., for success message)
        } catch (error) {
            console.error("Registration failed in AuthContext:", error.response?.data || error.message);
            throw error; // Re-throw to allow component to catch and display specific errors
        }
    };

    const logout = () => {
        // Use the imported apiLogout function, which clears cookies
        apiLogout();
        // Clear user state
        setUser(null);
        setIsAuthenticated(false);
        navigate('/login'); // Redirect to login page on logout
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);