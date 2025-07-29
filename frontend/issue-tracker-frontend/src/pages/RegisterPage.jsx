// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box, Alert, CircularProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFormik } from 'formik'; // Import useFormik
import * as yup from 'yup'; // Import yup for validation schema

const RegisterPage = () => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false); // Add loading state
    const { register } = useAuth();
    const navigate = useNavigate();

    // Define the Yup validation schema
    const validationSchema = yup.object({
        username: yup
            .string()
            .trim() // Trim whitespace from username
            .min(3, 'Username must be at least 3 characters')
            .max(50, 'Username must not exceed 50 characters')
            .required('Username is required'),
        email: yup
            .string()
            .trim() // Trim whitespace from email
            .email('Enter a valid email')
            .required('Email is required'),
        password: yup
            .string()
            .min(8, 'Password must be at least 8 characters')
            // You can add more complex regex for password strength if needed
            // .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
            // .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
            // .matches(/[0-9]/, 'Password must contain at least one number')
            // .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
            .required('Password is required'),
        re_password: yup
            .string()
            .oneOf([yup.ref('password'), null], 'Passwords must match') // Validate against password field
            .required('Confirm Password is required'),
    });

    // Initialize Formik
    const formik = useFormik({
        initialValues: {
            username: '',
            email: '',
            password: '',
            re_password: '', // Field for password confirmation
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setLoading(true); // Start loading
            setError('');
            setSuccess('');
            try {
                // Pass values from Formik directly
                await register(values.username, values.email, values.password);
                setSuccess('Registration successful! You can now login.');
                setTimeout(() => {
                    navigate('/login');
                }, 2000); // Redirect after 2 seconds
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
                    Register New Account
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2, width: '100%' }}>{success}</Alert>}
                <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                    {/* Username Field */}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={formik.values.username}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur} // Important for validation on blur
                        error={formik.touched.username && Boolean(formik.errors.username)}
                        helperText={formik.touched.username && formik.errors.username}
                    />

                    {/* Email Field */}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur} // Important for validation on blur
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                    />

                    {/* Password Field */}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur} // Important for validation on blur
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                    />

                    {/* Confirm Password Field */}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="re_password" // Name must match yup schema field
                        label="Confirm Password"
                        type="password"
                        id="re_password"
                        autoComplete="new-password"
                        value={formik.values.re_password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur} // Important for validation on blur
                        error={formik.touched.re_password && Boolean(formik.errors.re_password)}
                        helperText={formik.touched.re_password && formik.errors.re_password}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading || !formik.isValid || !formik.dirty} // Disable if loading, form is invalid, or no changes
                    >
                        {loading ? <CircularProgress size={24} /> : 'Sign Up'}
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