// src/services/api.js (Recommended to name it services/api.js instead of just api.js for clarity)
import axios from 'axios';
import Cookies from 'js-cookie';

// Ensure this matches your Django backend URL.
// Removed VITE_API_BASE_URL as you have a hardcoded URL now.
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
                    const response = await axios.post(`${API_BASE_URL}auth/jwt/refresh/`, { // Corrected URL to use API_BASE_URL
                        refresh: refreshToken
                    });

                    const newAccessToken = response.data.access;
                    // Store the new access token in cookies (expires in 1 hour)
                    // It's good practice to set secure to true in production if using HTTPS
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

// --- Auth related calls (assuming Djoser/Simple JWT and token handling via Cookies) ---
// Note: These do not need interceptors applied by default as they handle tokens themselves
export const login = (username, password) => api.post('/auth/jwt/create/', { username, password });
export const register = (username, email, password) => api.post('/auth/users/', { username, email, password });
// Logout just clears tokens from cookies
export const logout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    // You might also want to hit a Djoser logout endpoint if you're managing blacklisting on backend
    // For now, client-side token removal is sufficient for JWTs
};

// --- User related calls ---
// This endpoint is from Djoser's default user list, accessible by admins by default.
export const getUsers = () => api.get('/auth/users/');

// IMPORTANT: If you implemented the custom `all_users` action on `TeamViewSet`
// and you want non-admin users to fetch a list of *all* users (which is not default Djoser behavior),
// make sure your backend permissions for this endpoint allow it.
// Based on the previous backend code, this endpoint is only accessible by staff users.
export const getAllUsers = () => api.get('/teams/all_users/');

// --- Issue related calls ---
export const getIssues = () => api.get('/issues/');
export const getIssueDetail = (id) => api.get(`/issues/${id}/`);
export const createIssue = (issueData) => api.post('/issues/', issueData);
export const updateIssue = (id, issueData) => api.put(`/issues/${id}/`, issueData);
export const deleteIssue = (id) => api.delete(`/issues/${id}/`);

// --- NEW Team related calls ---
export const getTeams = () => api.get('/teams/');
export const getTeamDetail = (id) => api.get(`/teams/${id}/`);
export const createTeam = (teamData) => api.post('/teams/', teamData);
export const updateTeam = (id, teamData) => api.put(`/teams/${id}/`, teamData);
export const deleteTeam = (id) => api.delete(`/teams/${id}/`);
export const addTeamMember = (teamId, userId) => api.post(`/teams/${teamId}/add_member/`, { user_id: userId });
export const removeTeamMember = (teamId, userId) => api.post(`/teams/${teamId}/remove_member/`, { user_id: userId });

export default api;