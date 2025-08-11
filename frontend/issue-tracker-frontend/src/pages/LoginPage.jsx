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

// --- Jira-like Color Palette Definition ---
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

// --- Styled Components with Jira-like Palette & Spacing ---

const JiraBackgroundBox = styled(Box)({
    height: '100vh', // Set height to 100% of viewport height
    width: '100vw',  // Set width to 100% of viewport width
    backgroundColor: jiraLoginColors.backgroundLight, // Solid light grey background
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px', // General padding around the container
    overflow: 'hidden', // Prevent scrolling on this container
    boxSizing: 'border-box', // Include padding in the element's total width and height
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

    // Effect to control body overflow
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = ''; // Reset on unmount
        };
    }, []);

    return (
        <JiraBackgroundBox>
            <Container maxWidth="xs">
                <JiraFormContainer>
                    {/* Jira typically uses a logo here, or just text. Keeping a small icon for visual cue. */}
                    <Avatar sx={{ m: 1, bgcolor: jiraLoginColors.primaryBlue, width: 48, height: 48 }}>
                        <LockOutlinedIcon sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Typography
                        component="h1"
                        variant="h5" // Smaller heading than before, more in line with Jira
                        mb={3} // Consistent margin below heading
                        sx={{ fontWeight: 600, color: jiraLoginColors.textDark, textAlign: 'center' }}
                    >
                        Log in to your account
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2, width: '100%', borderRadius: '3px', fontSize: '0.875rem' }}>{error}</Alert>}

                    <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
                        <JiraTextField
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

                        <JiraTextField
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

                        <JiraButton
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 2, mb: 2 }} // Adjusted margins for button
                            disabled={loading || !formik.isValid || !formik.dirty}
                        >
                            {loading ? <CircularProgress size={20} color="inherit" /> : 'Log In'}
                        </JiraButton>

                        <Typography variant="body2" align="center" sx={{ color: jiraLoginColors.textMuted, mt: 1 }}>
                            Don’t have an account?{' '}
                            <Link
                                to="/register"
                                style={{
                                    textDecoration: 'none',
                                    color: jiraLoginColors.primaryBlue,
                                    fontWeight: 600,
                                    transition: 'color 0.2s ease-in-out',
                                }}
                                onMouseOver={(e) => e.target.style.color = jiraLoginColors.primaryBlueDark}
                                onMouseOut={(e) => e.target.style.color = jiraLoginColors.primaryBlue}
                            >
                                Sign Up
                            </Link>
                        </Typography>
                    </Box>
                </JiraFormContainer>
            </Container>
        </JiraBackgroundBox>
    );
};

export default LoginPage;
