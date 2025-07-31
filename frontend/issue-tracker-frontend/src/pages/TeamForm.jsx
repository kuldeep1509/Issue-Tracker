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
import api from '../services/api'; // Your Axios instance

export default function TeamForm({ onTeamCreated }) {
    const [teamName, setTeamName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingTeamCreate, setLoadingTeamCreate] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch all users for the "Select Members" dropdown
    useEffect(() => {
        setLoadingUsers(true);
        setError('');
        // Corrected: Removed leading '/api/' if baseURL is already '/api/'
        api.get('issues/all_users/') // Path relative to baseURL, e.g., /api/issues/all_users/
            .then((res) => {
                console.log("API response for users in TeamForm:", res.data);
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
            return;
        }
        if (selectedUsers.length === 0) {
            setError('Please select at least one member for the team.');
            return;
        }

        setLoadingTeamCreate(true);
        setError('');
        setSuccess('');

        const payload = {
            name: teamName,
            member_ids: selectedUsers.map((u) => u.id),
        };

        try {
            // Corrected: Removed leading '/api/' if baseURL is already '/api/'
            // This will now correctly target /api/teams/
            const res = await api.post('teams/', payload);
            console.log('Team created successfully:', res.data);

            setSuccess(`Team "${res.data.name}" created successfully!`);
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
            setError(errorMessage);
        } finally {
            setLoadingTeamCreate(false);
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

            
        </Box>
    );
}
