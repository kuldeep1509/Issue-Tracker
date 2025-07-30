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

// --- Aqua Color Palette Definition ---
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

// --- Styled Components with Aqua Palette & Enhanced Spacing ---

const AquaBackgroundBox = styled(Box)({
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)', // Soft aqua gradient background
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2, // General padding around the container
});

const AquaFormContainer = styled(Box)(({ theme }) => ({
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)', // A bit more pronounced shadow for depth
    padding: theme.spacing(6), // **KEY CHANGE: Significantly increased internal padding**
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '450px', // **Slightly increased max-width for more visual space**
    border: `1px solid ${aquaColors.backgroundMedium}`,
}));

const AquaTextField = styled(TextField)(({ theme }) => ({
    // Consistent vertical margin between text fields and other elements
    marginBottom: theme.spacing(3),

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
        padding: '16px 18px', // **Increased internal padding for input text**
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
    height: 56, // **Taller button for more presence**
    fontWeight: 700, // Bolder text for the action button
    fontSize: '1.05rem', // Slightly larger font
    letterSpacing: '0.7px',
    transition: 'background-color 0.2s ease-in-out, transform 0.1s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: aquaColors.primaryDark,
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 20px rgba(0, 188, 212, 0.3)', // Subtle shadow on hover
    },
    '&:disabled': {
        backgroundColor: aquaColors.backgroundMedium,
        color: '#ffffff',
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
        <AquaBackgroundBox>
            <Container maxWidth="xs">
                <AquaFormContainer>
                    <Avatar sx={{ m: 1, bgcolor: aquaColors.primary, width: 64, height: 64 }}> {/* Even larger avatar */}
                        <LockOutlinedIcon sx={{ fontSize: 36 }} /> {/* Larger icon within avatar */}
                    </Avatar>
                    <Typography
                        component="h1"
                        variant="h4"
                        mb={4} // Consistent margin below heading
                        sx={{ fontWeight: 700, color: aquaColors.textDark, textAlign: 'center' }}
                    >
                        Welcome Back!
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 3, width: '100%', borderRadius: '6px' }}>{error}</Alert>}

                    <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
                        <AquaTextField
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

                        <AquaTextField
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

                        <AquaButton
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 2, mb: 3 }} // Adjusted margins for button
                            disabled={loading || !formik.isValid || !formik.dirty}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
                        </AquaButton>

                        <Typography variant="body2" align="center" sx={{ color: aquaColors.textMuted, mt: 2 }}>
                            Don’t have an account?{' '}
                            <Link
                                to="/register"
                                style={{
                                    textDecoration: 'none',
                                    color: aquaColors.primary,
                                    fontWeight: 600,
                                    transition: 'color 0.2s ease-in-out',
                                }}
                                onMouseOver={(e) => e.target.style.color = aquaColors.primaryDark}
                                onMouseOut={(e) => e.target.style.color = aquaColors.primary}
                            >
                                Sign Up
                            </Link>
                        </Typography>
                    </Box>
                </AquaFormContainer>
            </Container>
        </AquaBackgroundBox>
    );
};

export default LoginPage;