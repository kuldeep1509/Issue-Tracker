// src/services/api.js
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

        if (error.response.status === 401 && !originalRequest._retry &&
            !(originalRequest.url.includes('/auth/jwt/create/') || originalRequest.url.includes('/auth/jwt/refresh/'))) {

            originalRequest._retry = true;

            const refreshToken = Cookies.get('refresh_token');

            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}auth/jwt/refresh/`, {
                        refresh: refreshToken
                    });

                    const newAccessToken = response.data.access;
                    Cookies.set('access_token', newAccessToken, { expires: 1/24, secure: process.env.NODE_ENV === 'production' });

                    if (response.data.refresh) { // If backend rotates refresh tokens
                         Cookies.set('refresh_token', response.data.refresh, { expires: 7, secure: process.env.NODE_ENV === 'production' });
                    }

                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);

                } catch (refreshError) {
                    console.error("Token refresh failed:", refreshError.response?.data || refreshError.message);
                    Cookies.remove('access_token');
                    Cookies.remove('refresh_token');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            } else {
                console.warn("No refresh token found. Redirecting to login.");
                Cookies.remove('access_token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// --- Auth related calls ---
export const login = (username, password) => api.post('/auth/jwt/create/', { username, password });
export const register = (username, email, password) => api.post('/auth/users/', { username, email, password });
export const logout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
};

// --- User related calls ---
export const getUsers = () => api.get('/auth/users/'); // Djoser's default user list (permissions depend on Djoser settings)
export const getAllUsers = () => api.get('/teams/all_users/'); // Your custom admin-only endpoint for all users
export const getMe = () => api.get('/auth/users/me/'); // NEW: Endpoint to get current authenticated user's details

// --- Issue related calls ---
export const getIssues = () => api.get('/issues/');
export const getIssueDetail = (id) => api.get(`/issues/${id}/`);
export const createIssue = (issueData) => api.post('/issues/', issueData);
export const updateIssue = (id, issueData) => api.put(`/issues/${id}/`, issueData);
export const deleteIssue = (id) => api.delete(`/issues/${id}/`);

// --- Team related calls ---
export const getTeams = () => api.get('/teams/');
export const getTeamDetail = (id) => api.get(`/teams/${id}/`);
export const createTeam = (teamData) => api.post('/teams/', teamData);
export const updateTeam = (id, teamData) => api.put(`/teams/${id}/`, teamData);
export const deleteTeam = (id) => api.delete(`/teams/${id}/`);
export const addTeamMember = (teamId, userId) => api.post(`/teams/${teamId}/add_member/`, { user_id: userId });
export const removeTeamMember = (teamId, userId) => api.post(`/teams/${teamId}/remove_member/`, { user_id: userId });

export default api;