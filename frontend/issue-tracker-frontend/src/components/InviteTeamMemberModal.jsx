// src/components/InviteTeamMemberModal.js
import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Typography, Alert, CircularProgress,
    
} from '@mui/material';
import api from '../services/api';

const InviteTeamMemberModal = ({ open, handleClose }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('info');

    const handleInvite = async () => {
        setLoading(true);
        setMessage('');
        try {
            await api.post('/auth/users/', { username, email, password });
            setMessage('Team member invited (account created successfully)! They can now login.');
            setSeverity('success');
            setUsername('');
            setEmail('');
            setPassword('');
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
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>Invite New Team Member</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    This will create a new user account. Share the credentials securely with the invited team member.
                </Typography>
                {message && <Alert severity={severity} sx={{ mb: 2 }}>{message}</Alert>}
                <TextField
                    autoFocus
                    margin="dense"
                    label="Username"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <TextField
                    margin="dense"
                    label="Email"
                    type="email"
                    fullWidth
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <TextField
                    margin="dense"
                    label="Password"
                    type="password"
                    fullWidth
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="secondary" disabled={loading}>Cancel</Button>
                <Button onClick={handleInvite} variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Create Account'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InviteTeamMemberModal;