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
import { styled } from '@mui/system'; // Import styled for custom components

// --- Styled Components for Enhanced Aesthetics ---

const GlassmorphicBox = styled(Box)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.15)', // Semi-transparent white
    backdropFilter: 'blur(10px)', // Apply blur for glass effect
    borderRadius: '16px',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.20)', // Softer, more pronounced shadow
    border: '1px solid rgba(255, 255, 255, 0.18)', // Subtle border
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '400px', // Constrain width for better appearance
}));

const StyledTextField = styled(TextField)({
    '& label.Mui-focused': {
        color: '#81c784', // A more vibrant green for focus
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: '#e0e0e0', // Light grey border
            borderRadius: '8px', // Slightly more rounded corners
        },
        '&:hover fieldset': {
            borderColor: '#a5d6a7', // Lighter green on hover
        },
        '&.Mui-focused fieldset': {
            borderColor: '#81c784', // Green on focus
            borderWidth: '2px', // Thicker border on focus
        },
    },
    '& .MuiInputBase-input': {
        color: '#333', // Darker text for better contrast
    },
    '& .MuiInputLabel-root': {
        color: '#666', // Slightly darker label
    }
});

const StyledButton = styled(Button)({
    background: 'linear-gradient(45deg, #81c784 30%, #4caf50 90%)', // Green gradient
    borderRadius: '8px',
    border: 0,
    color: 'white',
    height: 48,
    padding: '0 30px',
    boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)', // Green shadow
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)', // Lift effect on hover
        boxShadow: '0 6px 10px 3px rgba(76, 175, 80, .4)',
        background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)', // Reverse gradient on hover
    },
    '&:disabled': {
        background: '#e0e0e0',
        color: '#a0a0a0',
        boxShadow: 'none',
        transform: 'none',
    },
});

const GradientBackgroundBox = styled(Box)({
    minHeight: '100vh',
    // More vibrant, modern gradient
    background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 2,
    overflow: 'hidden', // Hide overflow from pseudo-elements
    position: 'relative', // For pseudo-elements positioning
    '&::before': { // Adding subtle overlay pattern
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0 20v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 46v-4h-2v4H0v2h2v4h4v-2h-4v-4h-2zM36 0v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 12v-4h-2v4H0v2h2v4h4v-2h-4v-4h-2zm30 0v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4h-2v4H0v2h2v4h4v-2h-4v-4h-2zm0-22L-2 6l8-6-6 8z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        opacity: 0.1,
        zIndex: 0,
    },
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
        <GradientBackgroundBox>
            <Container maxWidth="xs" sx={{ zIndex: 1 }}> {/* Ensure content is above background pattern */}
                <GlassmorphicBox>
                    <Avatar sx={{ m: 1, bgcolor: '#4caf50' }}> {/* Green Avatar */}
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5" mb={2} sx={{ fontWeight: 700, color: '#333', letterSpacing: '0.5px' }}>
                        Welcome Back!
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2, width: '100%', borderRadius: '8px' }}>{error}</Alert>}

                    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
                        <StyledTextField
                            fullWidth
                            margin="normal"
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

                        <StyledTextField
                            fullWidth
                            margin="normal"
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

                        <StyledButton
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading || !formik.isValid || !formik.dirty}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </StyledButton>

                        <Typography variant="body2" align="center" sx={{ color: '#666' }}>
                            Don’t have an account?{' '}
                            <Link
                                to="/register"
                                style={{
                                    textDecoration: 'none', // Remove underline
                                    color: '#4caf50', // Green link
                                    fontWeight: 600,
                                    transition: 'color 0.2s ease-in-out',
                                }}
                                onMouseOver={(e) => e.target.style.color = '#388e3c'} // Darker green on hover
                                onMouseOut={(e) => e.target.style.color = '#4caf50'}
                            >
                                Sign Up
                            </Link>
                        </Typography>
                    </Box>
                </GlassmorphicBox>
            </Container>
        </GradientBackgroundBox>
    );
};

export default LoginPage;