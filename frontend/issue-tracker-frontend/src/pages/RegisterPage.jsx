import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box, Alert, CircularProgress, Avatar } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'; // Keeping this for now, but Jira's login is simpler
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { styled } from '@mui/system'; // Import styled
import GoogleIcon from '@mui/icons-material/Google';

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
    const navigate = useNavigate();

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
                        Create Account
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
                        Sign up with Google
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
                            onMouseOver={e => e.target.style.color = jiraLoginColors.primaryBlueDark}
                            onMouseOut={e => e.target.style.color = jiraLoginColors.primaryBlue}
                        >
                            Sign In
                        </Link>
                    </Typography>
                </JiraFormContainer>
            </Container>
        </JiraBackgroundBox>
    );
};

export default RegisterPage;
