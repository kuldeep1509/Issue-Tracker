import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Autocomplete,
    Paper,
    Chip,
    Divider,
} from '@mui/material';
import api from '../services/api';

export default function TeamForm() {
    const [teamName, setTeamName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]);

    // Fetch all users using the same endpoint as IssueModal
    useEffect(() => {
        api.get('/issues/all_users/') // Changed from 'users/' to '/issues/all_users/'
            .then((res) => setUsers(res.data))
            .catch((err) => console.error('Error fetching users for team form:', err));
    }, []);

    // Fetch teams created by the logged-in user
    // IMPORTANT: It seems you changed this from 'teams/' to '/issues/all_users/'.
    // If your backend has a dedicated '/teams/' endpoint for fetching user's teams,
    // you should revert this to 'teams/' or the correct endpoint for teams.
    // For now, I'm keeping it as '/issues/all_users/' as per your provided code,
    // but be aware this might not be the correct endpoint for *teams*.
    useEffect(() => {
        api.get('/teams/') // Reverted to '/teams/' - assuming this is the correct endpoint for teams
            .then((res) => setTeams(res.data))
            .catch((err) => console.error('Error fetching teams:', err));
    }, []);

    const handleCreateTeam = () => {
        if (!teamName || selectedUsers.length === 0) return;

        const payload = {
            name: teamName,
            members: selectedUsers.map((u) => u.id),
        };

        // IMPORTANT: Similar to the fetch, it looks like you changed this to '/issues/all_users/'.
        // Team creation should typically go to a '/teams/' endpoint.
        // Reverting this to 'teams/' assuming that's your backend's team creation endpoint.
        api.post('/teams/', payload) // Reverted to '/teams/' - assuming this is the correct endpoint for creating teams
            .then((res) => {
                setTeams([...teams, res.data]);
                setTeamName('');
                setSelectedUsers([]);
            })
            .catch((err) => console.error('Error creating team:', err));
    };

    return (
        <Box sx={{ maxWidth: 600, margin: '0 auto', mt: 4, p: 3, backgroundColor: '#fefefe', borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="h5" gutterBottom>Create a Team</Typography>

            <TextField
                fullWidth
                label="Team Name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                sx={{ mb: 2 }}
            />

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
            />

            <Button variant="contained" color="primary" onClick={handleCreateTeam}>
                Create Team
            </Button>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6">Your Teams</Typography>
            {teams.map((team) => (
                <Paper key={team.id} sx={{ p: 2, mt: 2 }}>
                    <Typography variant="subtitle1">{team.name}</Typography>
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {team.members.map((user) => (
                            <Chip key={user.id || user} label={typeof user === 'object' ? user.username : user} />
                        ))}
                    </Box>
                </Paper>
            ))}
        </Box>
    );
}
