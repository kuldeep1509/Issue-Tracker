// src/components/IssueModal.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Select, MenuItem, FormControl, InputLabel,
    CircularProgress, Box, Alert, Avatar, FormHelperText
} from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote'; // Icon for editing/creating notes/issues
import { createIssue, updateIssue, getAllUsers } from '../services/api'; // Import specific API calls
import { useAuth } from '../context/AuthContext';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { styled } from '@mui/system';// Import styled

// --- Aqua Color Palette Definition (Consistent with other components) ---
const aquaColors =
{
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
    white: '#ffffff', // Explicit white for styled components
};

// --- Styled Components (Re-used and adapted for Dialog) ---

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper':
    {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
        border: `1px solid ${aquaColors.backgroundMedium}`,
        padding: theme.spacing(2), // Overall padding inside the dialog paper
    },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    textAlign: 'center',
    paddingBottom: theme.spacing(1),
    color: aquaColors.textDark,
    fontWeight: 700,
    fontSize: '1.75rem',
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    padding: theme.spacing(3),
    paddingTop: theme.spacing(1),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
    justifyContent: 'center',
    borderTop: `1px solid ${aquaColors.backgroundLight}`,
    marginTop: theme.spacing(2),
}));

const AquaTextField = styled(TextField)(({ theme }) => ({
    marginBottom: theme.spacing(3),

    '& .MuiOutlinedInput-root':
    {
        borderRadius: '8px',
        '& fieldset':
        {
            borderColor: aquaColors.borderLight,
        },
        '&:hover fieldset':
        {
            borderColor: aquaColors.borderMuted,
        },
        '&.Mui-focused fieldset':
        {
            borderColor: aquaColors.primary,
            borderWidth: '2px',
        },
    },
    '& .MuiInputBase-input':
    {
        padding: '16px 18px',
        color: aquaColors.textDark,
    },
    '& .MuiInputLabel-root':
    {
        color: aquaColors.textMuted,
        '&.Mui-focused':
        {
            color: aquaColors.primary,
        },
    },
    '& .MuiFormHelperText-root':
    {
        color: aquaColors.errorRed,
        marginTop: theme.spacing(0.5),
        marginBottom: 0,
    }
}));

const AquaSelectFormControl = styled(FormControl)(({ theme }) => ({
    marginBottom: theme.spacing(3), // Consistent margin with text fields

    '& .MuiOutlinedInput-root':
    {
        borderRadius: '8px',
        '& fieldset':
        {
            borderColor: aquaColors.borderLight,
        },
        '&:hover fieldset':
        {
            borderColor: aquaColors.borderMuted,
        },
        '&.Mui-focused fieldset':
        {
            borderColor: aquaColors.primary,
            borderWidth: '2px',
        },
    },
    '& .MuiInputBase-input':
    {
        padding: '16px 18px',
        color: aquaColors.textDark,
    },
    '& .MuiInputLabel-root':
    {
        color: aquaColors.textMuted,
        '&.Mui-focused':
        {
            color: aquaColors.primary,
        },
    },
    '& .MuiFormHelperText-root':
    {
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
    '&:hover':
    {
        backgroundColor: aquaColors.primaryDark,
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 20px rgba(0, 188, 212, 0.3)',
    },
    '&:disabled':
    {
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
    '&:hover':
    {
        backgroundColor: 'rgba(108, 117, 125, 0.1)', // Light grey transparent hover
        color: aquaColors.cancelButtonHover,
    },
    '&:disabled':
    {
        color: aquaColors.textMuted,
        opacity: 0.6,
    },
}));


const IssueModal = ({ open, handleClose, issue, onSave }) => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]); // State to store users for assignment
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validationSchema = yup.object({
        title: yup
            .string()
            .trim()
            .required('Title is required')
            .max(200, 'Title cannot exceed 200 characters'),
        description: yup
            .string()
            .trim()
            .nullable()
            .max(1000, 'Description cannot exceed 1000 characters'),
        status: yup
            .string()
            .oneOf(['OPEN', 'IN_PROGRESS', 'CLOSED'], 'Invalid status selected')
            .required('Status is required'),
        // assigned_to_id is optional and can be null
        assigned_to_id: yup
            .number()
            .nullable()
            // Transform 'NONE' string or empty string to null for API
            .transform((value, originalValue) => {
                return originalValue === 'NONE' || originalValue === '' ? null : value;
            })
            .notRequired('Assignment is optional'),
    });

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            status: 'OPEN',
            assigned_to_id: 'NONE', // Use 'NONE' as a string placeholder for no assignment
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            setError('');

            // Prepare data to send to the API
            const dataToSend = { ...values };
            // Ensure assigned_to_id is null if 'NONE' or empty string is selected
            if (dataToSend.assigned_to_id === 'NONE' || dataToSend.assigned_to_id === '') {
                dataToSend.assigned_to_id = null;
            }

            try {
                if (issue) {
                    // Update existing issue
                    await updateIssue(issue.id, dataToSend); // Use updateIssue from api.js
                } else {
                    // Create new issue
                    await createIssue(dataToSend); // Use createIssue from api.js
                }
                onSave(); // Callback to refresh issues list in Dashboard
                handleCloseModal(); // Close the modal
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
                            return ''; // Handle unexpected types
                        })
                        .filter(msg => msg !== '') // Filter out empty messages
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

    // Effect to populate form when an issue is passed (for editing)
    useEffect(() => {
        if (open) { // Only reset/set values when modal is opened
            if (issue) {
                formik.setValues({
                    title: issue.title,
                    description: issue.description || '',
                    status: issue.status,
                    // Set assigned_to_id to user's ID or 'NONE' if not assigned
                    assigned_to_id: issue.assigned_to?.id ? issue.assigned_to.id : 'NONE',
                }, false); // Set values without validating immediately
            } else {
                formik.resetForm(); // Reset for new issue creation
            }
            setError(''); // Clear any previous errors when opening
        }
    }, [issue, open, formik.resetForm, formik.setValues]);


    // Fetch users for assignment dropdown
    const fetchUsers = useCallback(async () => {
        if (!open) return; // Only fetch when modal is open
        try {
            const response = await getAllUsers(); // Using getAllUsers from api.js
            setUsers(response.data);
        } catch (err) {
            console.error("Failed to fetch users for assignment:", err.response?.data || err.message);
            setError('Failed to load users for assignment. Please try again.');
        }
    }, [open]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]); // Refetch users when fetchUsers dependency changes (e.g., modal opens)

    const handleCloseModal = () => {
        formik.resetForm(); // Reset form on close
        setError(''); // Clear errors
        handleClose(); // Call parent's handleClose
    };

    // Determine if the current user can assign an issue.
    // Only the issue owner or a staff user can assign/reassign.
    const canAssign = currentUser && (issue?.owner?.id === currentUser.id || currentUser.is_staff);

    return (
        <StyledDialog open={open} onClose={handleCloseModal} fullWidth maxWidth="sm">
            <StyledDialogTitle>
                <Avatar sx={{ m: 'auto', mb: 2, bgcolor: aquaColors.primary, width: 64, height: 64 }}>
                    <EditNoteIcon sx={{ fontSize: 36 }} />
                </Avatar>
                {issue ? 'Edit Issue' : 'Create New Issue'}
            </StyledDialogTitle>
            <StyledDialogContent>
                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '6px' }}>{error}</Alert>}

                <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                    <AquaTextField
                        autoFocus
                        label="Title"
                        type="text"
                        fullWidth
                        name="title"
                        value={formik.values.title}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.title && Boolean(formik.errors.title)}
                        helperText={formik.touched.title && formik.errors.title}
                        required
                    />

                    <AquaTextField
                        label="Description"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        name="description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.description && Boolean(formik.errors.description)}
                        helperText={formik.touched.description && formik.errors.description}
                    />

                    <AquaSelectFormControl
                        fullWidth
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
                            <FormHelperText>{formik.errors.status}</FormHelperText>
                        )}
                    </AquaSelectFormControl>

                    {/* Assigned To Select - conditionally rendered/disabled */}
                    <AquaSelectFormControl
                        fullWidth
                        disabled={!canAssign} // Disable if user cannot assign
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
                        >
                            <MenuItem value="NONE">
                                <em>Unassigned</em>
                            </MenuItem>
                            {users.map((userOption) => (
                                <MenuItem key={userOption.id} value={userOption.id}>
                                    {userOption.username} ({userOption.email})
                                </MenuItem>
                            ))}
                        </Select>
                        {formik.touched.assigned_to_id && formik.errors.assigned_to_id && (
                            <FormHelperText>{formik.errors.assigned_to_id}</FormHelperText>
                        )}
                        {!canAssign && (
                            <FormHelperText>
                                Only the issue owner or a staff member can assign issues.
                            </FormHelperText>
                        )}
                    </AquaSelectFormControl>
                </Box>
            </StyledDialogContent>
            <StyledDialogActions>
                <CancelButton onClick={handleCloseModal} disabled={loading}>
                    Cancel
                </CancelButton>
                <AquaButton
                    onClick={formik.handleSubmit}
                    variant="contained"
                    // Disable if loading, form is invalid, or no changes for existing issue
                    disabled={loading || !formik.isValid || (issue && !formik.dirty)}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : (issue ? 'Save Changes' : 'Create Issue')}
                </AquaButton>
            </StyledDialogActions>
        </StyledDialog>
    );
};

export default IssueModal;