// src/components/InviteTeamMemberModal.js
import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Typography, Alert, CircularProgress,
    Box, // Ensure Box is imported for the form structure
} from '@mui/material';
import api from '../services/api';
import { useFormik } from 'formik';
import * as yup from 'yup';

const InviteTeamMemberModal = ({ open, handleClose }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('info');

    // Define the Yup validation schema for inviting a team member
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
        onSubmit: async (values, { resetForm }) => {
            setLoading(true);
            setMessage('');
            setSeverity('info');

            try {
                // Ensure your Djoser /auth/users/ endpoint expects `re_password`
                await api.post('/auth/users/', {
                    username: values.username,
                    email: values.email,
                    password: values.password,
                    re_password: values.re_password, // Include re_password for Djoser
                });
                setMessage('Team member invited (account created successfully)! They can now login.');
                setSeverity('success');
                resetForm(); // Clear form fields on successful submission
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

    // Custom handleClose to reset form when modal is closed (e.g., by clicking outside)
    const handleCloseModal = () => {
        formik.resetForm(); // Reset Formik state, including touched and errors
        setMessage(''); // Clear any success/error messages
        setSeverity('info'); // Reset severity
        handleClose(); // Call the parent's handleClose prop
    };

    return (
        <Dialog open={open} onClose={handleCloseModal} fullWidth maxWidth="sm">
            <DialogTitle>Invite New Team Member</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    This will create a new user account. Share the credentials securely with the invited team member.
                </Typography>
                {message && <Alert severity={severity} sx={{ mb: 2 }}>{message}</Alert>}

                {/* The form itself */}
                <Box component="form" onSubmit={formik.handleSubmit} noValidate> {/* Hook up Formik's onSubmit here */}
                    {/* Username Field */}
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Username"
                        type="text"
                        fullWidth
                        variant="outlined"
                        name="username" // Crucial: name must match Formik's initialValues key
                        value={formik.values.username}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur} // Important for validation on blur
                        error={formik.touched.username && Boolean(formik.errors.username)}
                        helperText={formik.touched.username && formik.errors.username}
                        required
                        sx={{ mb: 1 }} // Add some bottom margin for spacing
                    />

                    {/* Email Field */}
                    <TextField
                        margin="dense"
                        label="Email"
                        type="email"
                        fullWidth
                        variant="outlined"
                        name="email" // Crucial: name must match Formik's initialValues key
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                        required
                        sx={{ mb: 1 }}
                    />

                    {/* Password Field */}
                    <TextField
                        margin="dense"
                        label="Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        name="password" // Crucial: name must match Formik's initialValues key
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                        required
                        sx={{ mb: 1 }}
                    />

                    {/* Confirm Password Field (This was missing from your original code but is vital for Djoser) */}
                    <TextField
                        margin="dense"
                        label="Confirm Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        name="re_password" // Crucial: name must match Formik's initialValues key and Yup schema
                        value={formik.values.re_password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.re_password && Boolean(formik.errors.re_password)}
                        helperText={formik.touched.re_password && formik.errors.re_password}
                        required
                        sx={{ mb: 2 }} // Extra margin before the buttons
                    />

                    {/* Submit button is now outside the form Box to align with DialogActions */}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseModal} color="secondary" disabled={loading}>
                    Cancel
                </Button>
                {/* Use type="submit" for the button within the form or call formik.handleSubmit directly on onClick */}
                <Button
                    onClick={formik.handleSubmit} // This will trigger Formik's validation and then onSubmit
                    variant="contained"
                    // Disable if loading, client-side validation fails, or no input has been touched/changed
                    disabled={loading || !formik.isValid || !formik.dirty}
                >
                    {loading ? <CircularProgress size={24} /> : 'Create Account'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InviteTeamMemberModal;