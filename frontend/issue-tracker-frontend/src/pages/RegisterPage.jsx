// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box, Alert } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await register(username, email, password);
            setSuccess('Registration successful! You can now login.');
            setTimeout(() => navigate('/login'), 2000); // Redirect after 2 seconds
        } catch (err) {
            console.error("Registration failed:", err.response?.data || err.message, err);

            const serverErrors = err.response?.data;
            let errorMessage = 'An unexpected error occurred during registration.';

            if (typeof serverErrors === 'object' && serverErrors !== null) {
                const messages = Object.keys(serverErrors)
                    .map(key => {
                        const errorValue = serverErrors[key];
                        if (Array.isArray(errorValue)) {
                            return `${key}: ${errorValue.join(', ')}`;
                        } else {
                            return `${key}: ${errorValue}`;
                        }
                    })
                    .join('\n');
                errorMessage = `Failed to register:\n${messages}`;
            } else if (typeof serverErrors === 'string') {
                errorMessage = 'An unexpected server error occurred. Please check the backend console.';
                console.error("Backend returned HTML error:", serverErrors);
            } else {
                errorMessage = err.response?.data?.detail || err.message || errorMessage;
            }
            setError(errorMessage);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    padding: 4,
                    borderRadius: 2,
                    boxShadow: 3,
                }}
            >
                <Typography component="h1" variant="h5" mb={3}>
                    Register New Account
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2, width: '100%' }}>{success}</Alert>}
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                     <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign Up
                    </Button>
                    <Link to="/login" variant="body2" style={{ textDecoration: 'none' }}>
                        {"Already have an account? Sign In"}
                    </Link>
                </Box>
            </Box>
        </Container>
    );
};

export default RegisterPage;