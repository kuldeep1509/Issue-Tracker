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
import api from '../services/api';

// This component is now designed to be reusable and notify its parent
// when a team is successfully created.
export default function TeamForm({ onTeamCreated }) {
    const [teamName, setTeamName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, setUsers] = useState([]); // State to hold all available users for selection
    const [loadingUsers, setLoadingUsers] = useState(true); // New loading state for user fetch
    const [loadingTeamCreate, setLoadingTeamCreate] = useState(false); // New loading state for team creation
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch all users for the "Select Members" dropdown
    useEffect(() => {
        setLoadingUsers(true); // Start loading
        setError(''); // Clear previous errors
        api.get('/issues/all_users/') // Using this endpoint as per your backend's current configuration
            .then((res) => {
                // Log the response to inspect its structure
                console.log("API response for users in TeamForm:", res.data);
                if (Array.isArray(res.data)) {
                    setUsers(res.data);
                } else if (res.data && Array.isArray(res.data.results)) {
                    // Handle paginated results if your API returns them like this
                    setUsers(res.data.results);
                } else {
                    console.warn("Unexpected data structure for users:", res.data);
                    setError("Received unexpected user data format from server.");
                    setUsers([]); // Ensure users is an array
                }
                setLoadingUsers(false);
            })
            .catch((err) => {
                console.error('Error fetching users for team form:', err.response?.data || err.message);
                // Display a more specific error if available
                const errorMessage = err.response?.data?.detail || err.message || 'Unknown error';
                setError(`Failed to load users for team selection: ${errorMessage}`);
                setLoadingUsers(false);
            });
    }, []);

    const handleCreateTeam = async () => {
        if (!teamName.trim()) {
            setError('Team name cannot be empty.');
            return;
        }
        if (selectedUsers.length === 0) {
            setError('Please select at least one member for the team.');
            return;
        }

        setLoadingTeamCreate(true); // Start loading for team creation
        setError('');
        setSuccess('');

        const payload = {
            name: teamName,
            // Map selected users to their IDs for the payload
            members: selectedUsers.map((u) => u.id),
        };

        try {
            // IMPORTANT: Reverted POST endpoint back to /issues/all_users/
            // as /api/teams/ resulted in a 404. You MUST ensure your backend
            // is configured to handle POST requests at /issues/all_users/
            // for team creation.
            const res = await api.post('/issues/all_users/', payload);
            console.log('Team created successfully:', res.data);

            setSuccess(`Team "${res.data.name}" created successfully!`);
            setTeamName('');
            setSelectedUsers([]);

            // Notify the parent component (Dashboard) that a new team was created
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
            setError(errorMessage);
        } finally {
            setLoadingTeamCreate(false); // End loading for team creation
        }
    };

    return (
        <Box sx={{ maxWidth: 600, margin: '0 auto', p: 3, backgroundColor: '#fefefe', borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="h5" gutterBottom align="center">Create a Team</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <TextField
                fullWidth
                label="Team Name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                sx={{ mb: 2 }}
                disabled={loadingTeamCreate}
            />

            {loadingUsers ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
                    <CircularProgress size={30} />
                    <Typography variant="body2" color="textSecondary" ml={2}>Loading users...</Typography>
                </Box>
            ) : (
                <Autocomplete
                    multiple
                    options={users}
                    getOptionLabel={(option) => option.username}
                    value={selectedUsers}
                    onChange={(e, value) => setSelectedUsers(value)}
                    renderInput={(params) => (
                        <TextField {...params} label="Select Members" placeholder="Users" />
                    )}
                    sx={{ mb: 2 }}
                    disabled={loadingTeamCreate}
                />
            )}


            <Button
                variant="contained"
                color="primary"
                onClick={handleCreateTeam}
                disabled={loadingTeamCreate || loadingUsers || !teamName.trim() || selectedUsers.length === 0}
                fullWidth
            >
                {loadingTeamCreate ? <CircularProgress size={24} color="inherit" /> : 'Create Team'}
            </Button>

            <Divider sx={{ my: 4 }} />

            <Typography variant="body2" color="textSecondary" align="center">
                Teams will appear on the main dashboard.
            </Typography>
        </Box>
    );
}
