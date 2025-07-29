// src/pages/LoginPage.js
import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box, Alert, CircularProgress } from '@mui/material'; // Import CircularProgress
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFormik } from 'formik'; // Import useFormik
import * as yup from 'yup'; // Import yup for validation schema

const LoginPage = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Add loading state
    const { login } = useAuth();

    // Define the Yup validation schema for login
    const validationSchema = yup.object({
        username: yup
            .string()
            .trim() // Trim whitespace from username
            .required('Username is required'),
        password: yup
            .string()
            .required('Password is required'),
    });

    // Initialize Formik
    const formik = useFormik({
        initialValues: {
            username: '',
            password: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setLoading(true); // Start loading
            setError(''); // Clear previous errors
            try {
                // Pass values from Formik directly
                const success = await login(values.username, values.password);
                if (!success) {
                    setError('Invalid username or password. Please try again.');
                }
                // Navigation on success is handled by AuthContext.js
            } catch (err) {
                // This catch block is mostly for unexpected network errors or issues not caught by AuthContext's login
                console.error("Login attempt failed:", err.response?.data || err.message, err);
                setError('An unexpected error occurred during login. Please try again later.');
            } finally {
                setLoading(false); // End loading
            }
        },
    });

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
                    Login
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
                <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                    {/* Username Field */}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username" // Name attribute MUST match Formik's initialValues key
                        autoComplete="username"
                        autoFocus
                        value={formik.values.username}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur} // Important for validation on blur
                        error={formik.touched.username && Boolean(formik.errors.username)}
                        helperText={formik.touched.username && formik.errors.username}
                    />

                    {/* Password Field */}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password" // Name attribute MUST match Formik's initialValues key
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur} // Important for validation on blur
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading || !formik.isValid || !formik.dirty} // Disable if loading, form is invalid, or no changes
                    >
                        {loading ? <CircularProgress size={24} /> : 'Sign In'}
                    </Button>
                    <Link to="/register" variant="body2" style={{ textDecoration: 'none' }}>
                        {"Don't have an account? Sign Up"}
                    </Link>
                </Box>
            </Box>
        </Container>
    );
};

export default LoginPage;