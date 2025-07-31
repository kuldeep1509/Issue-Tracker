// src/pages/TeamForm.js
import React, { useEffect, useState } from 'react';
import {
  TextField,
  Button,
  Container,
  Typography,
  Autocomplete,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function TeamForm() {
  const [teamName, setTeamName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [createdTeams, setCreatedTeams] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/issues/all_users/').then(res => {
      setAllUsers(res.data);
    });

    api.get('/teams/').then(res => {
      setCreatedTeams(res.data);
    });
  }, []);

  const handleCreateTeam = () => {
    const payload = {
      name: teamName,
      members: selectedUsers.map(u => u.id)
    };
    api.post('/teams/', payload).then(() => {
      setTeamName('');
      setSelectedUsers([]);
      api.get('/teams/').then(res => setCreatedTeams(res.data));
    });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Create a Team</Typography>
        <TextField
          label="Team Name"
          fullWidth
          margin="normal"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />
        <Autocomplete
          multiple
          options={allUsers.filter(u => u.id !== user?.id)}
          getOptionLabel={(option) => option.username}
          value={selectedUsers}
          onChange={(e, val) => setSelectedUsers(val)}
          renderInput={(params) => (
            <TextField {...params} label="Select Members" margin="normal" />
          )}
        />
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleCreateTeam}
          disabled={!teamName || selectedUsers.length === 0}
        >
          Create Team
        </Button>
      </Paper>

      <Box mt={4}>
        <Typography variant="h6">My Teams</Typography>
        <List>
          {createdTeams.map(team => (
            <ListItem key={team.id}>
              <ListItemText
                primary={team.name}
                secondary={`Members: ${team.members.map(m => m.username).join(', ')}`}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
}
