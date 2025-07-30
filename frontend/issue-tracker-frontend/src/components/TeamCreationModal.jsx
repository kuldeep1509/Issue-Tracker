// src/components/TeamCreationModal.js
import React, { useState } from 'react';
import {
    Typography,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, CircularProgress, Box, Alert, Avatar
} from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd'; // Icon for adding a team
import { createTeam } from '../services/api'; // Import specific API call
import { useFormik } from 'formik';
import * as yup from 'yup';
import { styled } from '@mui/system';

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

const StyledDialog = styled(Dialog)(({ theme }) =>
({
    '& .MuiDialog-paper':
    {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
        border: `1px solid ${aquaColors.backgroundMedium}`,
        padding: theme.spacing(2),
    },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) =>
({
    textAlign: 'center',
    paddingBottom: theme.spacing(1),
    color: aquaColors.textDark,
    fontWeight: 700,
    fontSize: '1.75rem',
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) =>
({
    padding: theme.spacing(3),
    paddingTop: theme.spacing(1),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) =>
({
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
    justifyContent: 'center',
    borderTop: `1px solid ${aquaColors.backgroundLight}`,
    marginTop: theme.spacing(2),
}));

const AquaTextField = styled(TextField)(({ theme }) =>
({
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
        backgroundColor: 'rgba(108, 117, 125, 0.1)',
        color: aquaColors.cancelButtonHover,
    },
    '&:disabled':
    {
        color: aquaColors.textMuted,
        opacity: 0.6,
    },
}));


const TeamCreationModal = ({ open, handleClose, onTeamCreated }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validationSchema = yup.object({
        name: yup
            .string()
            .trim()
            .required('Team name is required')
            .min(3, 'Team name must be at least 3 characters')
            .max(100, 'Team name cannot exceed 100 characters'),
        description: yup
            .string()
            .trim()
            .nullable()
            .max(500, 'Description cannot exceed 500 characters'),
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            description: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values, { resetForm }) => {
            setLoading(true);
            setError('');

            try {
                const response = await createTeam(values); // Call createTeam from api.js
                onTeamCreated(response.data); // Pass the new team data back to parent
                resetForm();
                handleClose();
            } catch (err) {
                console.error('Error creating team:', err.response?.data || err);
                const serverErrors = err.response?.data;
                let errorMessage = 'Failed to create team. Please try again.';

                if (typeof serverErrors === 'object' && serverErrors !== null) {
                    const errorMessages = Object.keys(serverErrors)
                        .map(key => {
                            const errorValue = serverErrors[key];
                            if (Array.isArray(errorValue)) {
                                return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${errorValue.join(', ')}`;
                            } else if (typeof errorValue === 'string') {
                                return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${errorValue}`;
                            }
                            return '';
                        })
                        .filter(msg => msg !== '')
                        .join('; ');
                    errorMessage = `Failed to create team: ${errorMessages || 'Unknown server error.'}`;
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

    const handleCloseModal = () => {
        formik.resetForm();
        setError('');
        handleClose();
    };

    return (
        <StyledDialog open={open} onClose={handleCloseModal} fullWidth maxWidth="sm">
            <StyledDialogTitle>
                <Avatar sx={{ m: 'auto', mb: 2, bgcolor: aquaColors.primary, width: 64, height: 64 }}>
                    <GroupAddIcon sx={{ fontSize: 36 }} />
                </Avatar>
                Create New Team
            </StyledDialogTitle>
            <StyledDialogContent>
                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '6px' }}>{error}</Alert>}

                <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                    <AquaTextField
                        autoFocus
                        label="Team Name"
                        type="text"
                        fullWidth
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        required
                        helperText={formik.touched.name && formik.errors.name}
                    />
                    <AquaTextField
                        label="Description (Optional)"
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
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Team'}
                </AquaButton>
            </StyledDialogActions>
        </StyledDialog>
    );
};

export default TeamCreationModal;