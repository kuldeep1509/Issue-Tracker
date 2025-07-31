import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Autocomplete,
    Paper,
    Chip,
    Divider,
    CircularProgress, // Added for loading indicator
    Alert // Added for error messages
} from '@mui/material';
import { styled, useTheme } from '@mui/system'; // Import useTheme and styled
import api from '../services/api'; // Your Axios instance
import { toast } from 'react-toastify'; // Import toast for notifications

// --- Jira-like Color Palette Definition (Consistent with LoginPage & Layout) ---
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
    chipBg: '#e9f2ff', // Light blue for chips (from Dashboard)
    chipText: '#0052cc', // Text color for chips (from Dashboard)
};

// --- Styled Components for TeamForm ---

const StyledTeamFormContainer = styled(Box)(({ theme }) => ({
    maxWidth: 600,
    margin: '0 auto',
    padding: theme.spacing(4), // Increased padding for consistency
    backgroundColor: jiraColors.white, // White background for the form
    borderRadius: '3px', // Jira-like rounded corners
    boxShadow: `0 4px 8px ${jiraColors.shadow}`, // Subtle shadow
    border: `1px solid ${jiraColors.backgroundMedium}`, // Light border
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
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

const StyledButton = styled(Button)(({ theme }) => ({
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

export default function TeamForm({ onTeamCreated }) {
    const [teamName, setTeamName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingTeamCreate, setLoadingTeamCreate] = useState(false);
    const [error, setError] = useState('');
    // Removed local 'success' state as toast will handle success messages
    const theme = useTheme(); // Access theme for spacing

    // Fetch all users for the "Select Members" dropdown
    useEffect(() => {
        setLoadingUsers(true);
        setError('');
        api.get('issues/all_users/')
            .then((res) => {
                if (Array.isArray(res.data)) {
                    setUsers(res.data);
                } else if (res.data && Array.isArray(res.data.results)) {
                    setUsers(res.data.results);
                } else {
                    console.warn("Unexpected data structure for users:", res.data);
                    setError("Received unexpected user data format from server.");
                    setUsers([]);
                }
                setLoadingUsers(false);
            })
            .catch((err) => {
                console.error('Error fetching users for team form:', err.response?.data || err.message);
                const errorMessage = err.response?.data?.detail || err.message || 'Unknown error';
                setError(`Failed to load users for team selection: ${errorMessage}`);
                setLoadingUsers(false);
            });
    }, []);

    const handleCreateTeam = async () => {
        if (!teamName.trim()) {
            setError('Team name cannot be empty.');
            toast.error('Team name cannot be empty.'); // Show toast for validation error
            return;
        }
        if (selectedUsers.length === 0) {
            setError('Please select at least one member for the team.');
            toast.error('Please select at least one member for the team.'); // Show toast for validation error
            return;
        }

        setLoadingTeamCreate(true);
        setError('');
        // setSuccess(''); // No longer needed as toast handles success

        const payload = {
            name: teamName,
            member_ids: selectedUsers.map((u) => u.id),
        };

        try {
            const res = await api.post('teams/', payload);
            console.log('Team created successfully:', res.data);

            // Show a success toast for the team creation
            toast.success(`Team "${res.data.name}" created successfully!`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });

            // Show an info toast for each member added (on the admin's side)
            selectedUsers.forEach(user => {
                toast.info(`Admin notification: ${user.username} has been added to team "${res.data.name}".`, {
                    position: "bottom-right", // Different position for member notifications
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
            });

            setTeamName('');
            setSelectedUsers([]);

            if (onTeamCreated) {
                onTeamCreated(res.data);
            }
        } catch (err) {
            console.error('Error creating team:', err.response?.data || err.message);
            const serverErrors = err.response?.data;
            let errorMessage = 'Failed to create team. Please check your input.';

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
            // Show an error toast
            toast.error(errorMessage, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored", // Use a colored theme for errors
            });
            setError(errorMessage); // Still set local error state if you want it displayed below the form
        } finally {
            setLoadingTeamCreate(false);
        }
    };

    return (
        <StyledTeamFormContainer>
            <Typography variant="h5" gutterBottom align="center" sx={{ color: jiraColors.textDark, fontWeight: 600, mb: 3 }}>
                Create a Team
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '3px', fontSize: '0.875rem' }}>{error}</Alert>}
            {/* Removed {success && <Alert...>} as toast handles success */}

            <StyledTextField
                fullWidth
                label="Team Name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                disabled={loadingTeamCreate}
            />

            {loadingUsers ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100, mb: 2 }}>
                    <CircularProgress size={24} sx={{ color: jiraColors.primaryBlue }} />
                    <Typography variant="body2" color="text.secondary" ml={2} sx={{ color: jiraColors.textMuted }}>Loading users...</Typography>
                </Box>
            ) : (
                <Autocomplete
                    multiple
                    options={users}
                    getOptionLabel={(option) => option.username}
                    value={selectedUsers}
                    onChange={(e, value) => setSelectedUsers(value)}
                    renderInput={(params) => (
                        <StyledTextField
                            {...params}
                            label="Select Members"
                            placeholder="Users"
                            sx={{
                                '& .MuiInputBase-root': {
                                    paddingRight: '0 !important', // Override default Autocomplete padding
                                },
                                '& .MuiAutocomplete-endAdornment': {
                                    top: 'calc(50% - 12px)', // Adjust vertical alignment of clear/dropdown icon
                                },
                            }}
                        />
                    )}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                            <Chip
                                label={option.username}
                                {...getTagProps({ index })}
                                size="small"
                                sx={{ backgroundColor: jiraColors.chipBg, color: jiraColors.chipText, fontWeight: 600 }}
                            />
                        ))
                    }
                    sx={{ mb: 2 }}
                    disabled={loadingTeamCreate}
                />
            )}

            <StyledButton
                variant="contained"
                onClick={handleCreateTeam}
                disabled={loadingTeamCreate || loadingUsers || !teamName.trim() || selectedUsers.length === 0}
                fullWidth
            >
                {loadingTeamCreate ? <CircularProgress size={20} color="inherit" /> : 'Create Team'}
            </StyledButton>

            <Divider sx={{ my: 4, borderColor: jiraColors.backgroundMedium }} />
        </StyledTeamFormContainer>
    );
}
