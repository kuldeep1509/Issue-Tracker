// src/components/InviteTeamMemberModal.js
import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Typography, Alert, CircularProgress,
    Box, Avatar,
} from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'; // Icon for inviting a person
import api from '../services/api';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { styled } from '@mui/system';

// --- Jira-like Color Palette Definition (Consistent with Dashboard) ---
const jiraColors = {
    sidebarBg: '#0052cc', // Jira Blue
    sidebarText: '#deebff',
    sidebarHover: '#0065ff',
    headerBg: '#ffffff',
    headerText: '#172b4d',
    boardBg: '#f4f5f7', // Light grey for board background
    columnBg: '#ffffff',
    columnHeader: '#5e6c84', // Muted grey for column headers
    cardBorder: '#dfe1e6', // Light grey for card borders
    buttonPrimary: '#0052cc',
    buttonPrimaryHover: '#0065ff',
    buttonSecondary: '#e0e0e0',
    buttonSecondaryHover: '#c0c0c0',
    textDark: '#172b4d',
    textMuted: '#5e6c84',
    chipBg: '#e9f2ff', // Light blue for chips
    chipText: '#0052cc',
    errorRed: '#de350b', // Jira red for errors
    cancelButton: '#5e6c84', // Muted grey for cancel button
    cancelButtonHover: '#6b778c', // Darker grey for cancel hover
};

// --- Styled Components (Adapted for Jira-like Dialog) ---

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        backgroundColor: jiraColors.boardBg, // Light grey background for the modal
        borderRadius: '3px', // Sharper corners like Jira
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow
        border: `1px solid ${jiraColors.cardBorder}`, // Light border
        padding: theme.spacing(2), // Overall padding inside the dialog paper
    },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    textAlign: 'center',
    paddingBottom: theme.spacing(1),
    color: jiraColors.headerText,
    fontWeight: 700,
    fontSize: '1.5rem', // Slightly smaller title
    borderBottom: `1px solid ${jiraColors.cardBorder}`, // Separator line
    marginBottom: theme.spacing(2),
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    padding: theme.spacing(3),
    paddingTop: theme.spacing(1),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
    justifyContent: 'flex-end', // Align buttons to the right
    borderTop: `1px solid ${jiraColors.cardBorder}`, // Subtle separator
    marginTop: theme.spacing(2),
    gap: theme.spacing(1), // Space between buttons
}));

const JiraTextField = styled(TextField)(({ theme }) => ({
    marginBottom: theme.spacing(2), // Consistent vertical margin

    '& .MuiOutlinedInput-root': {
        borderRadius: '3px', // Sharper corners
        backgroundColor: jiraColors.columnBg, // White background for input
        '& fieldset': {
            borderColor: jiraColors.cardBorder,
        },
        '&:hover fieldset': {
            borderColor: jiraColors.textMuted,
        },
        '&.Mui-focused fieldset': {
            borderColor: jiraColors.buttonPrimary,
            borderWidth: '1px', // Keep border thin
        },
    },
    '& .MuiInputBase-input': {
        padding: '10px 14px', // Smaller padding for inputs
        color: jiraColors.textDark,
    },
    '& .MuiInputLabel-root': {
        color: jiraColors.textMuted,
        '&.Mui-focused': {
            color: jiraColors.buttonPrimary,
        },
    },
    '& .MuiFormHelperText-root': {
        color: jiraColors.errorRed,
        marginTop: theme.spacing(0.5),
        marginBottom: 0,
    }
}));

const JiraButton = styled(Button)(({ theme, variant }) => ({
    borderRadius: '3px',
    textTransform: 'none', // No uppercase
    fontWeight: 600,
    padding: '8px 16px',
    transition: 'background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    ...(variant === 'contained' && {
        backgroundColor: jiraColors.buttonPrimary,
        color: 'white',
        '&:hover': {
            backgroundColor: jiraColors.buttonPrimaryHover,
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
        },
    }),
    ...(variant === 'outlined' && {
        borderColor: jiraColors.buttonSecondary,
        color: jiraColors.headerText,
        '&:hover': {
            backgroundColor: jiraColors.buttonSecondaryHover,
            borderColor: jiraColors.buttonSecondaryHover,
        },
    }),
    '&:disabled': {
        backgroundColor: jiraColors.buttonSecondary,
        color: jiraColors.textMuted,
        opacity: 0.7,
        boxShadow: 'none',
    },
}));

const JiraCancelButton = styled(JiraButton)(({ theme }) => ({
    backgroundColor: 'transparent', // Transparent background
    color: jiraColors.cancelButton,
    '&:hover': {
        backgroundColor: jiraColors.buttonSecondaryHover, // Light grey hover
        color: jiraColors.cancelButtonHover,
    },
    '&:disabled': {
        color: jiraColors.textMuted,
    },
}));


const InviteTeamMemberModal = ({ open, handleClose }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('info');

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
        onSubmit: async (values, { resetForm }) => {
            setLoading(true);
            setMessage('');
            setSeverity('info');

            try {
                await api.post('/auth/users/', {
                    username: values.username,
                    email: values.email,
                    password: values.password,
                    re_password: values.re_password,
                });
                setMessage('Team member invited (account created successfully)! They can now login.');
                setSeverity('success');
                resetForm();
            } catch (error) {
                console.error("Error inviting user:", error.response?.data || error);

                const serverErrors = error.response?.data;
                let errorMessage = 'Failed to invite team member. Please try again.';

                if (typeof serverErrors === 'object' && serverErrors !== null) {
                    const errorMessages = Object.keys(serverErrors)
                        .map(key => {
                            const errorValue = serverErrors[key];
                            if (Array.isArray(errorValue)) {
                                return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${errorValue.join(', ')}`;
                            } else {
                                return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${errorValue}`;
                            }
                        })
                        .join('; ');
                    errorMessage = `Failed to invite team member: ${errorMessages}`;
                } else if (typeof serverErrors === 'string') {
                    errorMessage = 'An unexpected server error occurred. Check backend console.';
                    console.error("Backend returned HTML error:", serverErrors);
                } else {
                    errorMessage = error.response?.data?.detail || error.message || errorMessage;
                }
                setMessage(errorMessage);
                setSeverity('error');
            } finally {
                setLoading(false);
            }
        },
    });

    const handleCloseModal = () => {
        formik.resetForm();
        setMessage('');
        setSeverity('info');
        handleClose();
    };

    return (
        <StyledDialog open={open} onClose={handleCloseModal} fullWidth maxWidth="sm">
            <StyledDialogTitle>
                <Avatar sx={{ m: 'auto', mb: 2, bgcolor: jiraColors.buttonPrimary, width: 56, height: 56 }}>
                    <PersonAddAlt1Icon sx={{ fontSize: 32, color: 'white' }} />
                </Avatar>
                Invite New Team Member
            </StyledDialogTitle>
            <StyledDialogContent>
                <Typography variant="body2" color={jiraColors.textMuted} sx={{ mb: 3, textAlign: 'center' }}>
                    This will create a new user account. Share the credentials securely with the invited team member.
                </Typography>
                {message && <Alert severity={severity} sx={{ mb: 3, borderRadius: '3px', fontSize: '0.875rem' }}>{message}</Alert>}

                <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                    <JiraTextField
                        autoFocus
                        label="Username"
                        type="text"
                        fullWidth
                        variant="outlined"
                        name="username"
                        value={formik.values.username}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.username && Boolean(formik.errors.username)}
                        helperText={formik.touched.username && formik.errors.username}
                    />

                    <JiraTextField
                        label="Email"
                        type="email"
                        fullWidth
                        variant="outlined"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                    />

                    <JiraTextField
                        label="Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        name="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                    />

                    <JiraTextField
                        label="Confirm Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        name="re_password"
                        value={formik.values.re_password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.re_password && Boolean(formik.errors.re_password)}
                        helperText={formik.touched.re_password && formik.errors.re_password}
                    />
                </Box>
            </StyledDialogContent>
            <StyledDialogActions>
                <JiraCancelButton onClick={handleCloseModal} disabled={loading}>
                    Cancel
                </JiraCancelButton>
                <JiraButton
                    onClick={formik.handleSubmit}
                    variant="contained"
                    disabled={loading || !formik.isValid || !formik.dirty}
                >
                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Create Account'}
                </JiraButton>
            </StyledDialogActions>
        </StyledDialog>
    );
};

export default InviteTeamMemberModal;
