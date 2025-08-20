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
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { styled } from '@mui/system';

const BackgroundBox = styled(Box)({
    minHeight: '100vh',
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
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

const RegisterPage = () => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const validationSchema = yup.object({
        username: yup
            .string()
            .trim()
            .min(3, 'Username must be at least 3 characters')
            .max(50, 'Username must not exceed 50 characters')
            .required('Username is required'),
        email: yup
            .string()
            .trim()
            .email('Enter a valid email')
            .required('Email is required'),
        password: yup
            .string()
            .min(8, 'Password must be at least 8 characters')
            .required('Password is required'),
        re_password: yup
            .string()
            .oneOf([yup.ref('password'), null], 'Passwords must match')
            .required('Confirm Password is required'),
    });

    const formik = useFormik({
        initialValues: {
            username: '',
            email: '',
            password: '',
            re_password: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            setError('');
            setSuccess('');
            try {
                await register(values.username, values.email, values.password);
                setSuccess('Registration successful! You can now login.');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
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
                } else {
                    errorMessage = err.response?.data?.detail || err.message || errorMessage;
                }
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        },
    });

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
                        Create Account
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
                    {success && (
                        <Alert 
                            severity="success" 
                            sx={{ 
                                mb: 2, 
                                width: '100%', 
                                borderRadius: '12px',
                            }}
                        >
                            {success}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ width: '100%' }}>
                        <StyledTextField
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={formik.values.username}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.username && Boolean(formik.errors.username)}
                            helperText={formik.touched.username && formik.errors.username}
                        />

                        <StyledTextField
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                        />

                        <StyledTextField
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                        />

                        <StyledTextField
                            fullWidth
                            name="re_password"
                            label="Confirm Password"
                            type="password"
                            id="re_password"
                            autoComplete="new-password"
                            value={formik.values.re_password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.re_password && Boolean(formik.errors.re_password)}
                            helperText={formik.touched.re_password && formik.errors.re_password}
                        />

                        <StyledButton
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 2, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Create Account'}
                        </StyledButton>

                        <Typography 
                            variant="body2" 
                            align="center" 
                            sx={{ color: '#718096', mt: 1 }}
                        >
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                style={{
                                    textDecoration: 'none',
                                    color: '#667eea',
                                    fontWeight: 600,
                                }}
                            >
                                Sign In
                            </Link>
                        </Typography>
                    </Box>
                </FormContainer>
            </Container>
        </BackgroundBox>
    );
};

export default RegisterPage;
