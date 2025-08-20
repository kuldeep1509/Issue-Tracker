import React, { useState, useEffect } from 'react';
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
import { styled } from '@mui/system';

const BackgroundBox = styled(Box)({
    height: '100vh',
    width: '100vw',
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    overflow: 'hidden',
    boxSizing: 'border-box',
});

const FormContainer = styled(Box)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '400px',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        '& fieldset': {
            borderColor: '#e2e8f0',
        },
        '&:hover fieldset': {
            borderColor: '#667eea',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#667eea',
        },
    },
    '& .MuiInputBase-input': {
        padding: '14px 16px',
    },
    '& .MuiInputLabel-root': {
        '&.Mui-focused': {
            color: '#667eea',
        },
    },
}));

const StyledButton = styled(Button)({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    height: '48px',
    fontWeight: 600,
    textTransform: 'none',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    '&:hover': {
        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
    },
});

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
                await login(values.username, values.password);
            } catch (err) {
                console.error('Login error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        },
    });

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    return (
        <BackgroundBox>
            <Container maxWidth="xs">
                <FormContainer>
                    <Avatar sx={{ 
                        m: 1, 
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        width: 56, 
                        height: 56,
                    }}>
                        <LockOutlinedIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Typography
                        component="h1"
                        variant="h4"
                        mb={3}
                        sx={{ 
                            fontWeight: 700, 
                            color: '#2d3748',
                            textAlign: 'center',
                        }}
                    >
                        Welcome Back
                    </Typography>

                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ 
                                mb: 2, 
                                width: '100%', 
                                borderRadius: '12px',
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
                        <StyledTextField
                            fullWidth
                            id="username"
                            name="username"
                            label="Username"
                            variant="outlined"
                            value={formik.values.username}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.username && Boolean(formik.errors.username)}
                            helperText={formik.touched.username && formik.errors.username}
                            required
                        />

                        <StyledTextField
                            fullWidth
                            id="password"
                            name="password"
                            label="Password"
                            type="password"
                            variant="outlined"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                            required
                        />

                        <StyledButton
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 2, mb: 2 }}
                            disabled={loading || !formik.isValid || !formik.dirty}
                        >
                            {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Sign In'}
                        </StyledButton>

                        <Typography 
                            variant="body2" 
                            align="center" 
                            sx={{ color: '#718096', mt: 1 }}
                        >
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                style={{
                                    textDecoration: 'none',
                                    color: '#667eea',
                                    fontWeight: 600,
                                }}
                            >
                                Sign Up
                            </Link>
                        </Typography>
                    </Box>
                </FormContainer>
            </Container>
        </BackgroundBox>
    );
};

export default LoginPage;
