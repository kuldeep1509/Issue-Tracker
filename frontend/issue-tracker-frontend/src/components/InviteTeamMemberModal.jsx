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

// --- Aqua Color Palette Definition (Consistent with other components) ---
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
    cancelButton: '#6c757d', // Muted grey for cancel button
    cancelButtonHover: '#495057', // Darker grey for cancel hover
};

// --- Styled Components (Re-used and adapted for Dialog) ---

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
        border: `1px solid ${aquaColors.backgroundMedium}`,
        padding: theme.spacing(2), // Overall padding inside the dialog paper
    },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    textAlign: 'center',
    paddingBottom: theme.spacing(1), // Less padding at bottom for title
    color: aquaColors.textDark,
    fontWeight: 700,
    fontSize: '1.75rem', // Larger title for prominence
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    padding: theme.spacing(3), // Generous padding for content
    paddingTop: theme.spacing(1), // Adjust top padding to bring content closer to title
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1), // Adjust top padding to bring buttons closer
    justifyContent: 'center', // Center the action buttons
    borderTop: `1px solid ${aquaColors.backgroundLight}`, // Subtle separator
    marginTop: theme.spacing(2), // Space above the actions
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

const CancelButton = styled(Button)(({ theme }) => ({
    color: aquaColors.cancelButton,
    borderRadius: '8px',
    height: 56,
    fontWeight: 600,
    fontSize: '1.05rem',
    letterSpacing: '0.7px',
    transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: 'rgba(108, 117, 125, 0.1)', // Light grey transparent hover
        color: aquaColors.cancelButtonHover,
    },
    '&:disabled': {
        color: aquaColors.textMuted,
        opacity: 0.6,
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
                <Avatar sx={{ m: 'auto', mb: 2, bgcolor: aquaColors.primary, width: 64, height: 64 }}>
                    <PersonAddAlt1Icon sx={{ fontSize: 36 }} />
                </Avatar>
                Invite New Team Member
            </StyledDialogTitle>
            <StyledDialogContent>
                <Typography variant="body2" color={aquaColors.textMuted} sx={{ mb: 3, textAlign: 'center' }}>
                    This will create a new user account. Share the credentials securely with the invited team member.
                </Typography>
                {message && <Alert severity={severity} sx={{ mb: 3, borderRadius: '6px' }}>{message}</Alert>}

                <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                    <AquaTextField
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

                    <AquaTextField
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

                    <AquaTextField
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

                    <AquaTextField
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
                <CancelButton onClick={handleCloseModal} disabled={loading}>
                    Cancel
                </CancelButton>
                <AquaButton
                    onClick={formik.handleSubmit}
                    variant="contained"
                    disabled={loading || !formik.isValid || !formik.dirty}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                </AquaButton>
            </StyledDialogActions>
        </StyledDialog>
    );
};

export default InviteTeamMemberModal;