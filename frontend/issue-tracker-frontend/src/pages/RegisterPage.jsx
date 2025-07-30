// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box, Alert, CircularProgress, Avatar } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'; // Import icon for consistency
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { styled } from '@mui/system'; // Import styled

// --- Aqua Color Palette Definition (Consistent with LoginPage & Layout) ---
const aquaColors = {
    primary: '#00bcd4', // Cyan/Aqua primary color (Material Cyan 500)
    primaryLight: '#4dd0e1', // Lighter primary
    primaryDark: '#00838f', // Darker primary for hover
    backgroundLight: '#e0f7fa', // Very light aqua background (Material Cyan 50)
    backgroundMedium: '#b2ebf2', // Medium aqua for subtle accents
    textDark: '#263238', // Dark slate for primary text
    textMuted: '#546e7a', // Muted slate for secondary text
    borderLight: '#b2ebf2', // Light aqua border
    borderMuted: '#80deea', // Slightly darker aqua border
    errorRed: '#ef5350', // Standard Material-UI error red
};

// --- Styled Components (Re-used from LoginPage for consistency) ---

const AquaBackgroundBox = styled(Box)({
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)', // Soft aqua gradient background
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
});

const AquaFormContainer = styled(Box)(({ theme }) => ({
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
    padding: theme.spacing(6), // Consistent padding
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '450px', // Consistent max-width
    border: `1px solid ${aquaColors.backgroundMedium}`,
}));

const AquaTextField = styled(TextField)(({ theme }) => ({
    marginBottom: theme.spacing(3), // Consistent vertical margin

    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        '& fieldset': {
            borderColor: aquaColors.borderLight,
        },
        '&:hover fieldset': {
            borderColor: aquaColors.borderMuted,
        },
        '&.Mui-focused fieldset': {
            borderColor: aquaColors.primary,
            borderWidth: '2px',
        },
    },
    '& .MuiInputBase-input': {
        padding: '16px 18px', // Consistent internal padding
        color: aquaColors.textDark,
    },
    '& .MuiInputLabel-root': {
        color: aquaColors.textMuted,
        '&.Mui-focused': {
            color: aquaColors.primary,
        },
    },
    '& .MuiFormHelperText-root': {
        color: aquaColors.errorRed,
        marginTop: theme.spacing(0.5),
        marginBottom: 0,
    }
}));

const AquaButton = styled(Button)(({ theme }) => ({
    backgroundColor: aquaColors.primary,
    color: 'white',
    borderRadius: '8px',
    height: 56,
    fontWeight: 700,
    fontSize: '1.05rem',
    letterSpacing: '0.7px',
    transition: 'background-color 0.2s ease-in-out, transform 0.1s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: aquaColors.primaryDark,
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 20px rgba(0, 188, 212, 0.3)',
    },
    '&:disabled': {
        backgroundColor: aquaColors.backgroundMedium,
        color: '#ffffff',
        boxShadow: 'none',
        transform: 'none',
    },
}));


const RegisterPage = () => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    // Define the Yup validation schema
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

    // Initialize Formik
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
                    console.error("Backend returned HTML error:", serverErrors);
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
        <AquaBackgroundBox>
            <Container maxWidth="xs">
                <AquaFormContainer>
                    <Avatar sx={{ m: 1, bgcolor: aquaColors.primary, width: 64, height: 64 }}>
                        <LockOutlinedIcon sx={{ fontSize: 36 }} />
                    </Avatar>
                    <Typography
                        component="h1"
                        variant="h4"
                        mb={4}
                        sx={{ fontWeight: 700, color: aquaColors.textDark, textAlign: 'center' }}
                    >
                        Create Account
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 3, width: '100%', borderRadius: '6px' }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 3, width: '100%', borderRadius: '6px' }}>{success}</Alert>}

                    <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ width: '100%' }}>
                        <AquaTextField
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

                        <AquaTextField
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

                        <AquaTextField
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

                        <AquaTextField
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

                        <AquaButton
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 2, mb: 3 }} // Adjusted margins for button
                            disabled={loading || !formik.isValid || !formik.dirty}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                        </AquaButton>

                        <Typography variant="body2" align="center" sx={{ color: aquaColors.textMuted, mt: 2 }}>
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                style={{
                                    textDecoration: 'none',
                                    color: aquaColors.primary,
                                    fontWeight: 600,
                                    transition: 'color 0.2s ease-in-out',
                                }}
                                onMouseOver={(e) => e.target.style.color = aquaColors.primaryDark}
                                onMouseOut={(e) => e.target.style.color = aquaColors.primary}
                            >
                                Sign In
                            </Link>
                        </Typography>
                    </Box>
                </AquaFormContainer>
            </Container>
        </AquaBackgroundBox>
    );
};

export default RegisterPage;