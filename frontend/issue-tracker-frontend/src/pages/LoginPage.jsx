import React, { useState } from 'react';
import {
    TextField,
    Button,
    Typography,
    Container,
    Box,
    Alert,
    CircularProgress,
    Avatar,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFormik } from 'formik';
import * as yup from 'yup';

const LoginPage = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const validationSchema = yup.object({
        username: yup.string().trim().required('Username is required'),
        password: yup.string().required('Password is required'),
    });

    const formik = useFormik({
        initialValues: { username: '', password: '' },
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            setError('');
            try {
                const success = await login(values.username, values.password);
                if (!success) setError('Invalid username or password. Please try again.');
            } catch (err) {
                console.error('Login error:', err);
                setError('Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(to right, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
            }}
        >
            <Container maxWidth="xs">
                <Box
                    sx={{
                        backdropFilter: 'blur(10px)',
                        backgroundColor: 'rgba(255,255,255,0.85)',
                        borderRadius: 4,
                        boxShadow: 5,
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5" mb={2}>
                        Welcome Back
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}

                    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            fullWidth
                            margin="normal"
                            id="username"
                            name="username"
                            label="Username"
                            value={formik.values.username}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.username && Boolean(formik.errors.username)}
                            helperText={formik.touched.username && formik.errors.username}
                        />

                        <TextField
                            fullWidth
                            margin="normal"
                            id="password"
                            name="password"
                            label="Password"
                            type="password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: 3,
                                mb: 2,
                                transition: 'transform 0.2s ease-in-out',
                                '&:hover': { transform: 'scale(1.02)' },
                            }}
                            disabled={loading || !formik.isValid || !formik.dirty}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>

                        <Typography variant="body2" align="center">
                            Don't have an account?{' '}
                            <Link to="/register" style={{ textDecoration: 'none', color: '#1976d2' }}>
                                Sign Up
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default LoginPage;
