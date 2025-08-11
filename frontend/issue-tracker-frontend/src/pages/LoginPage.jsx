import React, { useEffect } from 'react';
import {
    Button,
    Typography,
    Container,
    Box,
    Avatar,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { styled } from '@mui/system';
import GoogleIcon from '@mui/icons-material/Google';

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
    const navigate = useNavigate();
    const { login } = useAuth(); // Assuming useAuth provides a login function

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
                    <Avatar sx={{ m: 1, bgcolor: jiraLoginColors.primaryBlue, width: 48, height: 48 }}>
                        <LockOutlinedIcon sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Typography
                        component="h1"
                        variant="h5"
                        mb={3}
                        sx={{ fontWeight: 600, color: jiraLoginColors.textDark, textAlign: 'center' }}
                    >
                        Sign In
                    </Typography>
                    <JiraButton
                        fullWidth
                        variant="contained"
                        startIcon={<GoogleIcon />}
                        sx={{ mt: 2, mb: 2, backgroundColor: '#fff', color: jiraLoginColors.primaryBlue, border: `1px solid ${jiraLoginColors.primaryBlue}`, '&:hover': { backgroundColor: jiraLoginColors.backgroundLight } }}
                        onClick={() => {
                            window.location.href = '/accounts/google/login/';
                        }}
                    >
                        Sign in with Google
                    </JiraButton>
                    <Typography variant="body2" align="center" sx={{ color: jiraLoginColors.textMuted, mt: 1 }}>
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            style={{
                                textDecoration: 'none',
                                color: jiraLoginColors.primaryBlue,
                                fontWeight: 600,
                                transition: 'color 0.2s ease-in-out',
                            }}
                            onMouseOver={e => e.target.style.color = jiraLoginColors.primaryBlueDark}
                            onMouseOut={e => e.target.style.color = jiraLoginColors.primaryBlue}
                        >
                            Sign Up
                        </Link>
                    </Typography>
                </JiraFormContainer>
            </Container>
        </JiraBackgroundBox>
    );
};

export default LoginPage;
