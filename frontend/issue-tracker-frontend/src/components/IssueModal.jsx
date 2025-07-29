// src/components/IssueModal.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Select, MenuItem, FormControl, InputLabel,
    CircularProgress, Box, Alert
} from '@mui/material';
import api from '../services/api'; // Assuming this path is correct
import { useAuth } from '../context/AuthContext';
import { useFormik } from 'formik'; // Import useFormik
import * as yup from 'yup'; // Import yup for validation schema

const IssueModal = ({ open, handleClose, issue, onSave }) => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Define the Yup validation schema for Issue
    const validationSchema = yup.object({
        title: yup
            .string()
            .trim()
            .required('Title is required')
            .max(200, 'Title cannot exceed 200 characters'),
        description: yup
            .string()
            .trim()
            .nullable() // Allows null or empty string
            .max(1000, 'Description cannot exceed 1000 characters'), // Example max length
        status: yup
            .string()
            .oneOf(['OPEN', 'IN_PROGRESS', 'CLOSED'], 'Invalid status selected')
            .required('Status is required'),
        // assigned_to_id can be 0 for "None" or a number for a user ID
        assigned_to_id: yup
            .number()
            .nullable()
            .transform((value, originalValue) => {
                // Transform "NONE" string or empty string to null/0 for number type
                return originalValue === 'NONE' || originalValue === '' ? null : value;
            })
            .notRequired('Assignment is optional'), // Not strictly required
    });

    // Initialize Formik
    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            status: 'OPEN',
            assigned_to_id: 'NONE', // Use a specific string 'NONE' for the initial "None" option in Select
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            setError('');

            const dataToSend = { ...values };
            // Convert 'NONE' string from Select to null for backend if not assigned
            if (dataToSend.assigned_to_id === 'NONE' || dataToSend.assigned_to_id === '') {
                dataToSend.assigned_to_id = null;
            }

            try {
                if (issue) {
                    // Update existing issue
                    await api.patch(`/issues/${issue.id}/`, dataToSend);
                } else {
                    // Create new issue
                    await api.post('/issues/', dataToSend);
                }
                onSave(); // Callback to refresh issues list on parent
                handleCloseModal(); // Close modal and reset form
            } catch (err) {
                console.error('Error saving issue:', err.response?.data || err);
                const serverErrors = err.response?.data;
                let errorMessage = 'Failed to save issue. Check your input and permissions.';

                if (typeof serverErrors === 'object' && serverErrors !== null) {
                    const errorMessages = Object.keys(serverErrors)
                        .map(key => {
                            const errorValue = serverErrors[key];
                            if (Array.isArray(errorValue)) {
                                return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${errorValue.join(', ')}`;
                            } else if (typeof errorValue === 'string') {
                                return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${errorValue}`;
                            }
                            return ''; // Fallback for unexpected types
                        })
                        .filter(msg => msg !== '') // Remove empty messages
                        .join('; ');
                    errorMessage = `Failed to save issue: ${errorMessages || 'Unknown server error.'}`;
                } else if (typeof serverErrors === 'string') {
                    errorMessage = `An unexpected server error occurred: ${serverErrors}`;
                } else if (err.message) {
                    errorMessage = `Network error: ${err.message}`;
                }
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        },
    });

    // Effect to populate form when an issue is passed (for editing) or reset for new issue
    useEffect(() => {
        if (open) { // Only update formik values when modal becomes open
            if (issue) {
                // Set values for editing an existing issue
                formik.setValues({
                    title: issue.title,
                    description: issue.description || '', // Ensure description is string or empty
                    status: issue.status,
                    // Use 'NONE' for Select if assigned_to is null, otherwise the ID
                    assigned_to_id: issue.assigned_to?.id ? issue.assigned_to.id : 'NONE',
                }, false); // false means don't validate immediately on setValues
            } else {
                // Reset form for creating a new issue
                formik.resetForm();
            }
            setError(''); // Clear any previous API errors
        }
    }, [issue, open]); // Dependencies: issue object and modal open state

    // Fetch users for the "Assigned To" dropdown
    const fetchUsers = useCallback(async () => {
        if (!open) return; // Only fetch if modal is open
        try {
            // This endpoint in Django backend allows admins to see all users.
            // If a regular user can only assign to self or specific team, modify this logic.
            const response = await api.get('/issues/all_users/');
            setUsers(response.data);
        } catch (err) {
            console.error("Failed to fetch users for assignment:", err.response?.data || err.message);
            // Don't set a critical error, as not all users might need to be assignable.
            // The frontend will just show an empty "Assigned To" dropdown if this fails.
        }
    }, [open]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Custom handleClose to reset form when modal is closed (e.g., by clicking outside or cancel button)
    const handleCloseModal = () => {
        formik.resetForm(); // Reset Formik state, including touched and errors
        setError(''); // Clear any API error messages
        handleClose(); // Call the parent's handleClose prop
    };

    // Check if the current user is the owner of the issue being edited or an admin
    // This controls visibility of the "Assigned To" dropdown
    const canAssign = currentUser && (issue?.owner?.id === currentUser.id || currentUser.is_staff);

    return (
        <Dialog open={open} onClose={handleCloseModal} fullWidth maxWidth="sm">
            <DialogTitle>{issue ? 'Edit Issue' : 'Create New Issue'}</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 2 }}>
                    {/* Title Field */}
                    <TextField
                        margin="dense"
                        label="Title"
                        type="text"
                        fullWidth
                        variant="outlined"
                        name="title"
                        value={formik.values.title}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.title && Boolean(formik.errors.title)}
                        helperText={formik.touched.title && formik.errors.title}
                        required
                        sx={{ mb: 2 }}
                    />

                    {/* Description Field */}
                    <TextField
                        margin="dense"
                        label="Description"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        name="description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.description && Boolean(formik.errors.description)}
                        helperText={formik.touched.description && formik.errors.description}
                        sx={{ mb: 2 }}
                    />

                    {/* Status Select Field */}
                    <FormControl fullWidth margin="dense" sx={{ mb: 2 }}
                        error={formik.touched.status && Boolean(formik.errors.status)}
                    >
                        <InputLabel id="status-label">Status</InputLabel>
                        <Select
                            labelId="status-label"
                            id="status"
                            name="status"
                            value={formik.values.status}
                            label="Status"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        >
                            <MenuItem value="OPEN">Open</MenuItem>
                            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                            <MenuItem value="CLOSED">Closed</MenuItem>
                        </Select>
                        {formik.touched.status && formik.errors.status && (
                            <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>
                                {formik.errors.status}
                            </Typography>
                        )}
                    </FormControl>

                    {/* Assigned To Select Field (only visible if canAssign) */}
                    {canAssign && (
                        <FormControl fullWidth margin="dense" sx={{ mb: 2 }}
                            error={formik.touched.assigned_to_id && Boolean(formik.errors.assigned_to_id)}
                        >
                            <InputLabel id="assigned-to-label">Assigned To</InputLabel>
                            <Select
                                labelId="assigned-to-label"
                                id="assigned_to_id"
                                name="assigned_to_id"
                                value={formik.values.assigned_to_id}
                                label="Assigned To"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                displayEmpty
                            >
                                <MenuItem value="NONE">
                                    <em>None</em> {/* Changed from 0 to 'NONE' for clarity/consistency */}
                                </MenuItem>
                                {users.map(u => (
                                    <MenuItem key={u.id} value={u.id}>{u.username}</MenuItem>
                                ))}
                            </Select>
                            {formik.touched.assigned_to_id && formik.errors.assigned_to_id && (
                                <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>
                                    {formik.errors.assigned_to_id}
                                </Typography>
                            )}
                        </FormControl>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseModal} color="secondary" disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={formik.handleSubmit}
                    variant="contained"
                    disabled={loading || !formik.isValid || !formik.dirty}
                >
                    {loading ? <CircularProgress size={24} /> : (issue ? 'Update' : 'Create')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default IssueModal;