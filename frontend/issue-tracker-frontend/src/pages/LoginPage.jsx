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

// --- Styled Components for Simple & Attractive Styling ---

const SimpleBackgroundBox = styled(Box)({
    minHeight: '100vh',
    background: '#f8f9fa', // Very light grey background
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 2,
});

const SimpleFormContainer = styled(Box)(({ theme }) => ({
    backgroundColor: '#ffffff', // Clean white background for the form
    borderRadius: '8px', // Slightly rounded corners
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)', // Very soft, subtle shadow
    p: 4, // Ample padding inside the form
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '380px', // Standard width for a login form
    border: '1px solid #e9ecef', // Very light border
}));

const SimpleTextField = styled(TextField)(({ theme }) => ({
    // Ensure consistent vertical spacing between text fields
    marginBottom: theme.spacing(2.5), // Increased spacing for better separation

    '& .MuiOutlinedInput-root': {
        borderRadius: '6px', // Slightly less rounded than before for a crisp look
        '& fieldset': {
            borderColor: '#ced4da', // Light grey border
        },
        '&:hover fieldset': {
            borderColor: '#adb5bd', // Slightly darker grey on hover
        },
        '&.Mui-focused fieldset': {
            borderColor: '#007bff', // Primary blue on focus
            borderWidth: '2px', // Thicker border on focus for clear feedback
        },
    },
    '& .MuiInputBase-input': {
        padding: '12px 14px', // Standard padding
        color: '#343a40', // Darker text for readability
    },
    '& .MuiInputLabel-root': {
        color: '#6c757d', // Muted grey for labels
        '&.Mui-focused': {
            color: '#007bff', // Primary blue for focused label
        },
    }
}));

const SimpleButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#007bff', // Primary blue button
    color: 'white',
    borderRadius: '6px', // Matches input field rounding
    height: 48, // Consistent height
    fontWeight: 600, // Slightly bolder text
    letterSpacing: '0.5px',
    transition: 'background-color 0.2s ease-in-out, transform 0.1s ease-in-out',
    '&:hover': {
        backgroundColor: '#0056b3', // Darker blue on hover
        transform: 'translateY(-1px)', // Slight lift effect
    },
    '&:disabled': {
        backgroundColor: '#e9ecef',
        color: '#adb5bd',
        boxShadow: 'none',
        transform: 'none',
    },
}));

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
                // Simulate API call - Replace with your actual login logic
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
        <SimpleBackgroundBox>
            <Container maxWidth="xs">
                <SimpleFormContainer>
                    <Avatar sx={{ m: 1, bgcolor: '#007bff', width: 56, height: 56 }}> {/* Primary blue avatar */}
                        <LockOutlinedIcon fontSize="large" />
                    </Avatar>
                    <Typography component="h1" variant="h5" mb={3} sx={{ fontWeight: 700, color: '#343a40' }}>
                        Welcome!
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2, width: '100%', borderRadius: '6px' }}>{error}</Alert>}

                    <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
                        <SimpleTextField
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

                        <SimpleTextField
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

                        <SimpleButton
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 1.5, mb: 2.5 }} {/* Adjusted spacing relative to SimpleTextField's marginBottom */}
                            disabled={loading || !formik.isValid || !formik.dirty}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
                        </SimpleButton>

                        <Typography variant="body2" align="center" sx={{ color: '#6c757d' }}>
                            Don’t have an account?{' '}
                            <Link
                                to="/register"
                                style={{
                                    textDecoration: 'none',
                                    color: '#007bff', // Primary blue for link
                                    fontWeight: 600,
                                    transition: 'color 0.2s ease-in-out',
                                }}
                                onMouseOver={(e) => e.target.style.color = '#0056b3'}
                                onMouseOut={(e) => e.target.style.color = '#007bff'}
                            >
                                Sign Up
                            </Link>
                        </Typography>
                    </Box>
                </SimpleFormContainer>
            </Container>
        </SimpleBackgroundBox>
    );
};

export default LoginPage;