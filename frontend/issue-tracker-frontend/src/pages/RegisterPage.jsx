import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box, Alert, CircularProgress, Avatar } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'; // Keeping this for now, but Jira's login is simpler
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { styled } from '@mui/system'; // Import styled

// --- Jira-like Color Palette Definition (Consistent with LoginPage) ---
const jiraLoginColors = {
    primaryBlue: '#0052cc', // Jira's main blue for buttons, links, focus
    primaryBlueDark: '#0065ff', // Darker blue for hover
    backgroundLight: '#f4f5f7', // Light grey background, similar to Jira's board
    backgroundMedium: '#dfe1e6', // Slightly darker grey for borders/subtle elements
    textDark: '#172b4d', // Dark text for headings and primary content
    textMuted: '#5e6c84', // Muted grey for secondary text
    white: '#ffffff',
    shadow: 'rgba(0, 0, 0, 0.1)', // Subtle shadow
    errorRed: '#de350b', // Jira's error red
};

// --- Styled Components (Re-used from LoginPage for consistency) ---

const JiraBackgroundBox = styled(Box)({
    minHeight: '100vh',
    backgroundColor: jiraLoginColors.backgroundLight, // Solid light grey background
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px', // General padding around the container
});

const JiraFormContainer = styled(Box)(({ theme }) => ({
    backgroundColor: jiraLoginColors.white,
    borderRadius: '3px', // Jira typically uses slightly rounded corners, not very rounded
    boxShadow: `0 4px 8px ${jiraLoginColors.shadow}`, // Subtle shadow
    padding: theme.spacing(4), // Standard padding
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '400px', // Jira's login forms are typically narrower
    border: `1px solid ${jiraLoginColors.backgroundMedium}`, // Light border
}));

const JiraTextField = styled(TextField)(({ theme }) => ({
    marginBottom: theme.spacing(2), // Consistent vertical margin
    '& .MuiOutlinedInput-root': {
        borderRadius: '3px', // Match Jira's input field corners
        '& fieldset': {
            borderColor: jiraLoginColors.backgroundMedium,
        },
        '&:hover fieldset': {
            borderColor: jiraLoginColors.textMuted,
        },
        '&.Mui-focused fieldset': {
            borderColor: jiraLoginColors.primaryBlue,
            borderWidth: '2px',
        },
    },
    '& .MuiInputBase-input': {
        padding: '12px 14px', // Standard input padding
        color: jiraLoginColors.textDark,
    },
    '& .MuiInputLabel-root': {
        color: jiraLoginColors.textMuted,
        '&.Mui-focused': {
            color: jiraLoginColors.primaryBlue,
        },
    },
    '& .MuiFormHelperText-root': {
        color: jiraLoginColors.errorRed,
        marginTop: theme.spacing(0.5),
        marginBottom: 0,
    }
}));

const JiraButton = styled(Button)(({ theme }) => ({
    backgroundColor: jiraLoginColors.primaryBlue,
    color: jiraLoginColors.white,
    borderRadius: '3px',
    height: 40, // Standard button height
    fontWeight: 600, // Bolder text
    fontSize: '0.95rem',
    textTransform: 'none', // Jira buttons are not all caps
    transition: 'background-color 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: jiraLoginColors.primaryBlueDark,
    },
    '&:disabled': {
        backgroundColor: jiraLoginColors.backgroundMedium,
        color: jiraLoginColors.textMuted,
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
        <JiraBackgroundBox>
            <Container maxWidth="xs">
                <JiraFormContainer>
                    <Avatar sx={{ m: 1, bgcolor: jiraLoginColors.primaryBlue, width: 48, height: 48 }}>
                        <LockOutlinedIcon sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Typography
                        component="h1"
                        variant="h5" // Smaller heading than before, more in line with Jira
                        mb={3}
                        sx={{ fontWeight: 600, color: jiraLoginColors.textDark, textAlign: 'center' }}
                    >
                        Create Account
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2, width: '100%', borderRadius: '3px', fontSize: '0.875rem' }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2, width: '100%', borderRadius: '3px', fontSize: '0.875rem' }}>{success}</Alert>}

                    <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ width: '100%' }}>
                        <JiraTextField
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

                        <JiraTextField
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

                        <JiraTextField
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

                        <JiraTextField
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

                        <JiraButton
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 2, mb: 2 }} // Adjusted margins for button
                            disabled={loading || !formik.isValid || !formik.dirty}
                        >
                            {loading ? <CircularProgress size={20} color="inherit" /> : 'Sign Up'}
                        </JiraButton>

                        <Typography variant="body2" align="center" sx={{ color: jiraLoginColors.textMuted, mt: 1 }}>
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                style={{
                                    textDecoration: 'none',
                                    color: jiraLoginColors.primaryBlue,
                                    fontWeight: 600,
                                    transition: 'color 0.2s ease-in-out',
                                }}
                                onMouseOver={(e) => e.target.style.color = jiraLoginColors.primaryBlueDark}
                                onMouseOut={(e) => e.target.style.color = jiraLoginColors.primaryBlue}
                            >
                                Sign In
                            </Link>
                        </Typography>
                    </Box>
                </JiraFormContainer>
            </Container>
        </JiraBackgroundBox>
    );
};

export default RegisterPage;