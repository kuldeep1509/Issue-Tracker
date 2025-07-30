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
import { styled } from '@mui/system';

// --- Styled Components for Enhanced Aesthetics and Alignment ---

const ModernBackgroundBox = styled(Box)({
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0f2f5 0%, #e0e5ec 100%)', // Light, subtle gradient
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 2,
});

const LoginFormContainer = styled(Box)(({ theme }) => ({
    backgroundColor: '#ffffff', // Crisp white background
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)', // Soft, layered shadow
    p: 5, // Increased padding for more breathing room
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '420px', // Slightly wider form for better input scaling
    border: '1px solid #e0e0e0', // Subtle border
}));

const StyledInput = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px', // Slightly rounded corners for inputs
        backgroundColor: '#f9f9f9', // Very light background for inputs
        '& fieldset': {
            borderColor: '#e0e0e0', // Light grey border
            transition: 'border-color 0.2s ease-in-out',
        },
        '&:hover fieldset': {
            borderColor: '#bdbdbd', // Darker grey on hover
        },
        '&.Mui-focused fieldset': {
            borderColor: '#6200ea', // Primary purple on focus
            borderWidth: '2px', // Thicker border on focus
        },
    },
    '& .MuiInputBase-input': {
        padding: '12px 14px', // Adjust padding for a consistent height
        color: '#333',
    },
    '& .MuiInputLabel-root': {
        color: '#666',
        '&.Mui-focused': {
            color: '#6200ea', // Primary purple for focused label
        },
    },
    // Add margin bottom for better vertical spacing between inputs
    marginBottom: theme.spacing(2),
});

const StyledLoginButton = styled(Button)({
    background: 'linear-gradient(45deg, #6200ea 30%, #bb86fc 90%)', // Purple gradient
    borderRadius: '8px',
    color: 'white',
    height: 50, // Taller button
    boxShadow: '0 4px 15px rgba(98, 0, 234, .3)', // Purple shadow
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(98, 0, 234, .4)',
        background: 'linear-gradient(45deg, #bb86fc 30%, #6200ea 90%)', // Reverse gradient on hover
    },
    '&:disabled': {
        background: '#e0e0e0',
        color: '#a0a0a0',
        boxShadow: 'none',
        transform: 'none',
    },
    fontWeight: 600,
});

const LoginPage = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth(); // Assuming useAuth provides a login function

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
                // Simulate API call
                const success = await login(values.username, values.password);
                if (!success) {
                    setError('Invalid username or password. Please try again.');
                }
            } catch (err) {
                console.error('Login error:', err);
                setError('Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <ModernBackgroundBox>
            <Container maxWidth="xs">
                <LoginFormContainer>
                    <Avatar sx={{ m: 1, bgcolor: '#6200ea', width: 56, height: 56 }}> {/* Larger Avatar with primary purple */}
                        <LockOutlinedIcon fontSize="large" />
                    </Avatar>
                    <Typography component="h1" variant="h4" mb={3} sx={{ fontWeight: 700, color: '#333', letterSpacing: '0.5px' }}>
                        Sign In
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2, width: '100%', borderRadius: '8px' }}>{error}</Alert>}

                    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
                        <StyledInput
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
                        />

                        <StyledInput
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
                        />

                        <StyledLoginButton
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 2, mb: 2 }} {/* Reduced margin-top for button as input has margin-bottom */}
                            disabled={loading || !formik.isValid || !formik.dirty}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                        </StyledLoginButton>

                        <Typography variant="body2" align="center" sx={{ color: '#666', mt: 1 }}>
                            Don’t have an account?{' '}
                            <Link
                                to="/register"
                                style={{
                                    textDecoration: 'none',
                                    color: '#6200ea', // Primary purple for link
                                    fontWeight: 600,
                                    transition: 'color 0.2s ease-in-out',
                                }}
                                onMouseOver={(e) => e.target.style.color = '#3700b3'} // Darker purple on hover
                                onMouseOut={(e) => e.target.style.color = '#6200ea'}
                            >
                                Sign Up
                            </Link>
                        </Typography>
                    </Box>
                </LoginFormContainer>
            </Container>
        </ModernBackgroundBox>
    );
};

export default LoginPage;