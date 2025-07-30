// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import Cookies from 'js-cookie';
// Import the specific authentication functions from your new api.js, including getMe
import { login as apiLogin, register as apiRegister, logout as apiLogout, getMe } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Ensure toast is imported

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
                // Use the getMe endpoint to fetch current user details
                const res = await getMe();
                setUser(res.data);
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Failed to load user or token invalid:", error.response?.data || error.message);
                // If fetching user details fails, it likely means the token is invalid or expired
                // or the user doesn't have permission to access /me/. Log out.
                logout();
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
            const res = await apiLogin(username, password);
            // Tokens are already handled by api.js interceptors and stored in cookies there.
            // No need to manually set cookies here.
            toast.success('Logged in successfully!'); // Add toast notification
            await loadUser(); // Fetch user details and update auth state
            navigate('/dashboard'); // Redirect to dashboard after successful login
            return true;
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
            setIsAuthenticated(false);
            const errorMsg = error.response?.data?.detail || Object.values(error.response?.data || {})[0]?.toString() || 'Invalid credentials';
            toast.error(`Login failed: ${errorMsg}`); // Add toast notification
            return false;
        }
    };

    const register = async (username, email, password) => {
        try {
            const res = await apiRegister(username, email, password);
            toast.success('Registration successful! Please log in.'); // Add toast notification
            navigate('/login'); // Redirect to login page after successful registration
            return res.data;
        } catch (error) {
            console.error("Registration failed in AuthContext:", error.response?.data || error.message);
            const errorData = error.response?.data;
            let errorMsg = 'Registration failed.';
            if (errorData) {
                errorMsg = Object.values(errorData).flat().join(', ');
            }
            toast.error(`Registration failed: ${errorMsg}`); // Add toast notification
            throw error;
        }
    };

    const logout = () => {
        apiLogout(); // Use the imported apiLogout function, which clears cookies
        setUser(null);
        setIsAuthenticated(false);
        toast.info('You have been logged out.'); // Add toast notification
        navigate('/login'); // Redirect to login page on logout
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);
export default useAuth;