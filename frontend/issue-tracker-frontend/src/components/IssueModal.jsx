// src/components/IssueModal.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Select, MenuItem, FormControl, InputLabel,
    CircularProgress, Box, Alert, Avatar, InputAdornment // Import InputAdornment
} from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'; // Icon for AI generation
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { styled, useTheme } from '@mui/system';

// --- Jira-like Color Palette Definition (Consistent with other components) ---
const jiraColors = {
    primaryBlue: '#0052cc', // Jira's main blue for buttons, links, focus
    primaryBlueDark: '#0065ff', // Darker blue for hover
    backgroundLight: '#f4f5f7', // Light grey background, similar to Jira's board
    backgroundMedium: '#dfe1e6', // Slightly darker grey for borders/subtle elements
    textDark: '#172b4d', // Dark text for headings and primary content
    textMuted: '#5e6c84', // Muted grey for secondary text
    white: '#ffffff',
    shadow: 'rgba(0, 0, 0, 0.1)', // Subtle shadow
    errorRed: '#de350b', // Jira's error red
    cancelButtonText: '#5e6c84', // Muted grey for cancel button text
    cancelButtonHoverBg: 'rgba(94, 108, 132, 0.08)', // Subtle grey hover for cancel button
    chipBgOpen: '#e9f2ff', // Light blue for chips (used in pre-assigned team box)
};

// --- Styled Components (Adapted       Jira-like Dialog) ---

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        backgroundColor: jiraColors.white,
        borderRadius: '3px', // Jira-like rounded corners
        boxShadow: `0 4px 8px ${jiraColors.shadow}`,
        border: `1px solid ${jiraColors.backgroundMedium}`,
        padding: theme.spacing(2), // Consistent padding
    },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    textAlign: 'center',
    paddingBottom: theme.spacing(1),
    color: jiraColors.textDark,
    fontWeight: 600, // Slightly less bold for titles
    fontSize: '1.5rem', // Smaller title font size
    borderBottom: `1px solid ${jiraColors.backgroundMedium}`, // Separator line
    marginBottom: theme.spacing(2),
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    padding: theme.spacing(3),
    paddingTop: theme.spacing(1), // Adjust top padding after title
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
    justifyContent: 'flex-end', // Align buttons to the right
    borderTop: `1px solid ${jiraColors.backgroundMedium}`, // Separator line
    marginTop: theme.spacing(2),
    gap: theme.spacing(1), // Space between buttons
}));

const JiraTextField = styled(TextField)(({ theme }) => ({
    marginBottom: theme.spacing(2), // Consistent vertical margin

    '& .MuiOutlinedInput-root': {
        borderRadius: '3px', // Match Jira's input field corners
        '& fieldset': {
            borderColor: jiraColors.backgroundMedium,
        },
        '&:hover fieldset': {
            borderColor: jiraColors.textMuted,
        },
        '&.Mui-focused fieldset': {
            borderColor: jiraColors.primaryBlue,
            borderWidth: '2px',
        },
    },
    '& .MuiInputBase-input': {
        padding: '12px 14px', // Standard input padding
        color: jiraColors.textDark,
    },
    '& .MuiInputLabel-root': {
        color: jiraColors.textMuted,
        '&.Mui-focused': {
            color: jiraColors.primaryBlue,
        },
    },
    '& .MuiFormHelperText-root': {
        color: jiraColors.errorRed,
        marginTop: theme.spacing(0.5),
        marginBottom: 0,
    }
}));

const JiraSelectFormControl = styled(FormControl)(({ theme }) => ({
    marginBottom: theme.spacing(2), // Consistent vertical margin

    '& .MuiOutlinedInput-root': {
        borderRadius: '3px', // Match Jira's input field corners
        '& fieldset': {
            borderColor: jiraColors.backgroundMedium,
        },
        '&:hover fieldset': {
            borderColor: jiraColors.textMuted,
        },
        '&.Mui-focused fieldset': {
            borderColor: jiraColors.primaryBlue,
            borderWidth: '2px',
        },
    },
    '& .MuiInputBase-input': {
        padding: '12px 14px', // Consistent input padding
        color: jiraColors.textDark,
    },
    '& .MuiInputLabel-root': {
        color: jiraColors.textMuted,
        '&.Mui-focused': {
            color: jiraColors.primaryBlue,
        },
    },
    '& .MuiFormHelperText-root': {
        color: jiraColors.errorRed,
        marginTop: theme.spacing(0.5),
        marginBottom: 0,
    }
}));


const JiraButton = styled(Button)(({ theme }) => ({
    backgroundColor: jiraColors.primaryBlue,
    color: jiraColors.white,
    borderRadius: '3px',
    height: 40, // Standard button height
    fontWeight: 600, // Bolder text
    fontSize: '0.95rem',
    textTransform: 'none', // Jira buttons are not all caps
    transition: 'background-color 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: jiraColors.primaryBlueDark,
    },
    '&:disabled': {
        backgroundColor: jiraColors.backgroundMedium,
        color: jiraColors.textMuted,
    },
}));

const CancelButton = styled(Button)(({ theme }) => ({
    color: jiraColors.cancelButtonText,
    borderRadius: '3px',
    height: 40,
    fontWeight: 600,
    fontSize: '0.95rem',
    textTransform: 'none',
    transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: jiraColors.cancelButtonHoverBg,
        color: jiraColors.textDark, // Darker text on hover
    },
    '&:disabled': {
        color: jiraColors.textMuted,
        opacity: 0.6,
    },
}));


const IssueModal = ({ open, handleClose, issue, onSave, initialAssignedTeam }) => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatingDescription, setGeneratingDescription] = useState(false); // New state for description generation loading
    const [descriptionGenerationError, setDescriptionGenerationError] = useState(''); // New state for description generation error
    const theme = useTheme(); // Use theme hook

    // Determine if the modal is opened specifically for pre-assigning to a team
    const isPreAssignedToTeam = !!initialAssignedTeam && !issue; // Only true if creating new and team is provided

    const validationSchema = yup.object().shape({
        title: yup
            .string()
            .trim()
            .required('Title is required')
            .max(200, 'Title cannot exceed 200 characters'),
        description: yup
            .string()
            .trim()
            .nullable()
            .max(6000, 'Description cannot exceed 6000 characters (approx. 1000 words)'), // Increased limit
        status: yup
            .string()
            .oneOf(['OPEN', 'IN_PROGRESS', 'CLOSED'], 'Invalid status selected')
            .required('Status is required'),
        assigned_to_id: yup
            .number()
            .required("Assigning user is required")
            .transform((value, originalValue) => {
                return originalValue === 'NONE' || originalValue === '' ? null : value;
            }),
        assigned_team_id: yup
            .number()
            .nullable()
            .transform((value, originalValue) => {
                return originalValue === 'NONE' || originalValue === '' ? null : value;
            }),
    }).test(
        'at-least-one-assignment',
        'Please assign this issue to either a user or a team.',
        function (values) {
            const { assigned_to_id, assigned_team_id } = values;
            return assigned_to_id !== null || assigned_team_id !== null;
        }
    ).test(
        'assigned-mutually-exclusive',
        'Cannot assign issue to both a user and a team.',
        function (values) {
            const { assigned_to_id, assigned_team_id } = values;
            if (assigned_to_id !== null && assigned_team_id !== null) {
                return false;
            }
            return true;
        }
    );


    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            status: 'OPEN',
            assigned_to_id: 'NONE',
            assigned_team_id: 'NONE',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            setError('');

            const dataToSend = { ...values };

            if (dataToSend.assigned_to_id === 'NONE' || dataToSend.assigned_to_id === '') {
                dataToSend.assigned_to_id = null;
            }
            if (dataToSend.assigned_team_id === 'NONE' || dataToSend.assigned_team_id === '') {
                dataToSend.assigned_team_id = null;
            }

            try {
                if (issue) {
                    await api.patch(`issues/${issue.id}/`, dataToSend);
                } else {
                    await api.post('issues/', dataToSend);
                }
                onSave();
                handleCloseModal();
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
                            return '';
                        })
                        .filter(msg => msg !== '')
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

    useEffect(() => {
        if (open) {
            formik.resetForm(); // Always reset form first
            if (issue) {
                formik.setValues({
                    title: issue.title,
                    description: issue.description || '',
                    status: issue.status,
                    assigned_to_id: issue.assigned_to?.id ? issue.assigned_to.id : 'NONE',
                    assigned_team_id: issue.assigned_team?.id ? issue.assigned_team.id : 'NONE',
                }, false);
            } else if (initialAssignedTeam) {
                formik.setValues({
                    title: '',
                    description: '',
                    status: 'OPEN',
                    assigned_to_id: 'NONE',
                    assigned_team_id: initialAssignedTeam.id,
                }, false);
            }
            setError('');
            setDescriptionGenerationError(''); // Clear description generation error on open
        }
    }, [issue, open, initialAssignedTeam]);

    const fetchUsers = useCallback(async () => {
        if (!open) return;
        try {
            const response = await api.get('issues/all_users/');
            setUsers(response.data);
        } catch (err) {
            console.error("Failed to fetch users for assignment:", err.response?.data || err.message);
        }
    }, [open]);

    const fetchTeamsForAssignment = useCallback(async () => {
        if (!open) return;
        try {
            const response = await api.get('teams/');
            // Corrected: Ensure response.data is an array or has a results array
            if (Array.isArray(response.data)) {
                setTeams(response.data);
            } else if (response.data && Array.isArray(response.data.results)) {
                setTeams(response.data.results);
            } else {
                console.warn("Unexpected API response structure for teams:", response.data);
                setTeams([]); // Ensure it's always an array
            }
        } catch (err) {
            console.error("Failed to fetch teams for assignment:", err.response?.data || err.message);
            setTeams([]); // Ensure it's always an array on error too
        }
    }, [open]);

    useEffect(() => {
        fetchUsers();
        fetchTeamsForAssignment();
    }, [fetchUsers, fetchTeamsForAssignment]);

    const handleCloseModal = () => {
        formik.resetForm();
        setError('');
        setDescriptionGenerationError('');
        handleClose();
    };

    const canAssign = !!currentUser;

    // Determine if a user or team is currently selected (not 'NONE' or null)
    const isUserCurrentlySelected = formik.values.assigned_to_id !== 'NONE' && formik.values.assigned_to_id !== null;
    const isTeamCurrentlySelected = formik.values.assigned_team_id !== 'NONE' && formik.values.assigned_team_id !== null;

    const generateDescription = async () => {
        setGeneratingDescription(true);
        setDescriptionGenerationError('');

        let prompt = `Generate a detailed and professional description for an issue.`;
        if (formik.values.title) {
            prompt += ` The issue title is: "${formik.values.title}".`;
        } else {
            prompt += ` The user has not provided a title yet. Please provide a general template for a software bug report or feature request description.`;
        }
        prompt += ` Focus on clarity and actionable information. The description should not exceed 1000 words.`;

        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };
        // The apiKey is automatically provided by the Canvas environment when left as an empty string.
        // A 403 (Forbidden) error typically means the API key is missing, invalid, or lacks necessary permissions.
        // Ensure your Canvas environment is correctly configured with a valid Gemini API key.
        const apiKey = "AIzaSyD50Lt_ubYlkTPYhMjgqbIrfeKr5L3-p7Q";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        let retries = 0;
        const maxRetries = 3;
        const baseDelay = 1000; // 1 second

        while (retries < maxRetries) {
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    // If the status is 403, it's likely an API key issue, no need to retry
                    if (response.status === 403) {
                        setDescriptionGenerationError('Permission denied: Please ensure a valid Gemini API key is configured in your environment.');
                        throw new Error('API Key Forbidden (403)'); // Break out of retry loop
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    const text = result.candidates[0].content.parts[0].text;
                    formik.setFieldValue('description', text);
                    break; // Exit loop on success
                } else {
                    throw new Error('Unexpected API response structure or no content.');
                }
            } catch (err) {
                console.error('Error generating description:', err);
                if (err.message === 'API Key Forbidden (403)') {
                    break; // Do not retry for 403 errors
                }
                if (retries < maxRetries - 1) {
                    const delay = baseDelay * Math.pow(2, retries);
                    console.log(`Retrying in ${delay / 1000} seconds...`);
                    await new Promise(res => setTimeout(res, delay));
                    retries++;
                } else {
                    setDescriptionGenerationError('Failed to generate description after multiple attempts. Please try again later.');
                }
            }
        }
        setGeneratingDescription(false);
    };


    return (
        <StyledDialog open={open} onClose={handleCloseModal} fullWidth maxWidth="sm">
            <StyledDialogTitle>
                <Avatar sx={{ m: 'auto', mb: 2, bgcolor: jiraColors.primaryBlue, width: 48, height: 48 }}>
                    <EditNoteIcon sx={{ fontSize: 28 }} />
                </Avatar>
                {issue ? 'Edit Issue' : (isPreAssignedToTeam ? `Assign Issue to Team: ${initialAssignedTeam.name}` : 'Create New Issue')}
            </StyledDialogTitle>
            <StyledDialogContent>
                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '3px', fontSize: '0.875rem' }}>{error}</Alert>}
                {descriptionGenerationError && <Alert severity="warning" sx={{ mb: 2, borderRadius: '3px', fontSize: '0.875rem' }}>{descriptionGenerationError}</Alert>}

                <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                    <JiraTextField
                        autoFocus
                        label="Title"
                        style={{marginTop: "5px"}}
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

                    <JiraTextField
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
                        InputProps={{ // Add InputProps to attach the button
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Button
                                        onClick={generateDescription}
                                        disabled={generatingDescription}
                                        variant="text"
                                        size="small"
                                        sx={{
                                            textTransform: 'none',
                                            color: jiraColors.primaryBlue,
                                            '&:hover': {
                                                backgroundColor: 'transparent',
                                                textDecoration: 'underline',
                                            },
                                            minWidth: 'auto', // Allow button to shrink
                                            padding: '4px 8px', // Adjust padding
                                        }}
                                    >
                                        {generatingDescription ? (
                                            <CircularProgress size={16} color="inherit" />
                                        ) : (
                                            <>
                                                <AutoFixHighIcon sx={{ fontSize: 18, mr: 0.5 }} /> Generate
                                            </>
                                        )}
                                    </Button>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <JiraSelectFormControl fullWidth
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
                    </JiraSelectFormControl>

                    {/* Conditionally render assignment fields based on context */}
                    {canAssign && (
                        <>
                            {/* Assigned To User dropdown:
                                - **Now hidden if the 'issue' prop is present (editing an issue).**
                                - Still hidden if a team is currently selected for a new issue.
                            */}
                            {!issue && !isTeamCurrentlySelected && (
                                <JiraSelectFormControl fullWidth
                                    error={formik.touched.assigned_to_id && Boolean(formik.errors.assigned_to_id)}
                                >
                                    <InputLabel id="assigned-to-label">Assigned To User</InputLabel>
                                    <Select
                                        labelId="assigned-to-label"
                                        id="assigned_to_id"
                                        name="assigned_to_id"
                                        value={formik.values.assigned_to_id}
                                        label="Assigned To User"
                                        onChange={(e) => {
                                            formik.handleChange(e);
                                            // If a user is selected, clear assigned_team_id
                                            if (e.target.value !== 'NONE') {
                                                formik.setFieldValue('assigned_team_id', 'NONE');
                                            }
                                        }}
                                        onBlur={formik.handleBlur}
                                        displayEmpty
                                    >
                                        <MenuItem value="NONE">
                                            <em>None</em>
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
                                </JiraSelectFormControl>
                            )}

                            {/* Assigned To Team dropdown:
                                - **Now hidden if the 'issue' prop is present (editing an issue).**
                                - Still hidden if a user is currently selected for a new issue.
                                - Also hidden if pre-assigned to a team (as it's already set).
                            */}
                            {!issue && !isUserCurrentlySelected && !isPreAssignedToTeam && (
                                <JiraSelectFormControl fullWidth
                                    error={formik.touched.assigned_team_id && Boolean(formik.errors.assigned_team_id)}
                                >
                                    <InputLabel id="assigned-team-label">Assigned To Team</InputLabel>
                                    <Select
                                        labelId="assigned-team-label"
                                        id="assigned_team_id"
                                        name="assigned_team_id"
                                        value={formik.values.assigned_team_id}
                                        label="Assigned To Team"
                                        onChange={(e) => {
                                            formik.handleChange(e);
                                            // If a team is selected, clear assigned_to_id
                                            if (e.target.value !== 'NONE') {
                                                formik.setFieldValue('assigned_to_id', 'NONE');
                                            }
                                        }}
                                        onBlur={formik.handleBlur}
                                        displayEmpty
                                    >
                                        <MenuItem value="NONE">
                                            <em>None</em>
                                        </MenuItem>
                                        {Array.isArray(teams) && teams.map(t => (
                                            <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                                        ))}
                                    </Select>
                                    {formik.touched.assigned_team_id && formik.errors.assigned_team_id && (
                                        <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>
                                            {formik.errors.assigned_team_id}
                                        </Typography>
                                    )}
                                </JiraSelectFormControl>
                            )}

                            {/* Display pre-assigned team if applicable */}
                            {isPreAssignedToTeam && (
                                <Box sx={{ mb: 2, p: 1.5, border: `1px dashed ${jiraColors.primaryBlue}`, borderRadius: '3px', backgroundColor: jiraColors.chipBgOpen }}>
                                    <Typography variant="body2" sx={{ color: jiraColors.textDark, fontWeight: 600 }}>
                                        Assigned to Team: {initialAssignedTeam.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: jiraColors.textMuted }}>
                                        This issue will be created for this team.
                                    </Typography>
                                </Box>
                            )}

                            {/* Display current user/team assignment when editing */}
                            {issue && (
                                <Box sx={{ mb: 2, p: 1.5, border: `1px dashed ${jiraColors.primaryBlue}`, borderRadius: '3px', backgroundColor: jiraColors.chipBgOpen }}>
                                    {issue.assigned_to && (
                                        <Typography variant="body2" sx={{ color: jiraColors.textDark, fontWeight: 600 }}>
                                            Currently Assigned to User: {issue.assigned_to.username}
                                        </Typography>
                                    )}
                                    {issue.assigned_team && (
                                        <Typography variant="body2" sx={{ color: jiraColors.textDark, fontWeight: 600 }}>
                                            Currently Assigned to Team: {issue.assigned_team.name}
                                        </Typography>
                                    )}
                                    <Typography variant="caption" sx={{ color: jiraColors.textMuted }}>
                                        Assignment cannot be changed from this form.
                                    </Typography>
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </StyledDialogContent>
            <StyledDialogActions>
                <CancelButton onClick={handleCloseModal} disabled={loading || generatingDescription}>
                    Cancel
                </CancelButton>
                <JiraButton
                    onClick={formik.handleSubmit}
                    variant="contained"
                    disabled={loading || generatingDescription || !formik.isValid || !formik.dirty}
                >
                    {loading ? <CircularProgress size={20} color="inherit" /> : (issue ? 'Update Issue' : 'Create Issue')}
                </JiraButton>
            </StyledDialogActions>
        </StyledDialog>
    );
};

export default IssueModal;
