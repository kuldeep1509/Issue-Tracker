// src/components/IssueModal.js
import { useState, useEffect, useCallback } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Select, MenuItem, FormControl, InputLabel,
    CircularProgress, Box, Alert
} from '@mui/material';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const IssueModal = ({ open, handleClose, issue, onSave }) => {
    const { user: currentUser } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'OPEN',
        assigned_to_id: '',
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (issue) {
            setFormData({
                title: issue.title,
                description: issue.description || '',
                status: issue.status,
                assigned_to_id: issue.assigned_to?.id || '',
            });
        } else {
            setFormData({
                title: '',
                description: '',
                status: 'OPEN',
                assigned_to_id: '',
            });
        }
        setError('');
    }, [issue, open]);

    const fetchUsers = useCallback(async () => {
        if (!open) return;
        try {
            // This endpoint in Django backend allows admins to see all users.
            // If a regular user can only assign to self or specific team, modify this logic.
            const response = await api.get('/issues/all_users/');
            setUsers(response.data);
        } catch (err) {
            console.error("Failed to fetch users for assignment:", err.response?.data || err.message);
            // Don't set a critical error, as not all users might need to be assignable.
        }
    }, [open]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const dataToSend = { ...formData };
        if (dataToSend.assigned_to_id === '') {
            dataToSend.assigned_to_id = null;
        }

        try {
            if (issue) {
                await api.patch(`/issues/${issue.id}/`, dataToSend);
            } else {
                await api.post('/issues/', dataToSend);
            }
            onSave();
            handleClose();
        } catch (err) {
            console.error('Error saving issue:', err.response?.data || err);
            setError(err.response?.data?.detail || 'Failed to save issue. Check your input and permissions.');
        } finally {
            setLoading(false);
        }
    };

    // Check if the current user is the owner of the issue being edited or an admin
    const canAssign = currentUser && (issue?.owner?.id === currentUser.id || currentUser.is_staff);

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>{issue ? 'Edit Issue' : 'Create New Issue'}</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <TextField
                        margin="dense"
                        label="Title"
                        type="text"
                        fullWidth
                        variant="outlined"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                        <InputLabel id="status-label">Status</InputLabel>
                        <Select
                            labelId="status-label"
                            id="status"
                            name="status"
                            value={formData.status}
                            label="Status"
                            onChange={handleChange}
                        >
                            <MenuItem value="OPEN">Open</MenuItem>
                            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                            <MenuItem value="CLOSED">Closed</MenuItem>
                        </Select>
                    </FormControl>
                    {canAssign && (
                        <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                            <InputLabel id="assigned-to-label">Assigned To</InputLabel>
                            <Select
                                labelId="assigned-to-label"
                                id="assigned_to_id"
                                name="assigned_to_id"
                                value={formData.assigned_to_id}
                                label="Assigned To"
                                onChange={handleChange}
                                displayEmpty
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {users.map(u => (
                                    <MenuItem key={u.id} value={u.id}>{u.username}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="secondary" disabled={loading}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : (issue ? 'Update' : 'Create')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default IssueModal;