// src/api.js
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'https://issue-tracker-q9v4.onrender.com/api/'; 

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach JWT Access Token to Authorization Header
api.interceptors.request.use(
    config => {
        const accessToken = Cookies.get('access_token');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401 Unauthorized errors (token expired) by attempting to refresh
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // Check if the error is 401 Unauthorized AND it's not a retry AND it's not the login or refresh endpoint itself
        if (error.response.status === 401 && !originalRequest._retry &&
            !(originalRequest.url.includes('/auth/jwt/create/') || originalRequest.url.includes('/auth/jwt/refresh/'))) {

            originalRequest._retry = true; // Mark the request as retried to prevent infinite loops

            const refreshToken = Cookies.get('refresh_token');

            if (refreshToken) {
                try {
                    // Attempt to get a new access token using Djoser's JWT refresh endpoint
                    const response = await axios.post(`${API_BASE_URL}/auth/jwt/refresh/`, {
                        refresh: refreshToken
                    });

                    const newAccessToken = response.data.access;
                    // Store the new access token in cookies (expires in 1 hour)
                    Cookies.set('access_token', newAccessToken, { expires: 1/24, secure: process.env.NODE_ENV === 'production' });

                    // If your backend configured SIMPLE_JWT to rotate refresh tokens, you might also get a new refresh token here.
                    // If so: Cookies.set('refresh_token', response.data.refresh, { expires: 7, secure: process.env.NODE_ENV === 'production' });

                    // Update the Authorization header for the original failed request
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    // Retry the original request with the new access token
                    return api(originalRequest);

                } catch (refreshError) {
                    console.error("Token refresh failed:", refreshError.response?.data || refreshError.message);
                    // If refresh fails, clear all tokens and redirect to login
                    Cookies.remove('access_token');
                    Cookies.remove('refresh_token');
                    window.location.href = '/login'; // Full page reload redirect
                    return Promise.reject(refreshError);
                }
            } else {
                console.warn("No refresh token found. Redirecting to login.");
                // No refresh token available, so just clear access token and redirect
                Cookies.remove('access_token');
                window.location.href = '/login';
            }
        }
        // For any other error (e.g., 403 Forbidden, 404 Not Found), just reject the promise
        return Promise.reject(error);
    }
);

export default api;