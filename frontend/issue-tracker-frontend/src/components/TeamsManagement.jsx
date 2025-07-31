import React, { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { StyledButton, jiraColors } from '../styles/jiraTheme';
import TeamForm from '../pages/TeamForm';// Assuming this component already exists

const TeamsManagement = ({ teams, fetchTeams, handleCreateIssueForTeam }) => {
    const [showTeamForm, setShowTeamForm] = useState(false);

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: '1200px', // Center content
                px: { xs: 2, md: 4 } // Match Dashboard's padding
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ color: jiraColors.headerText, fontWeight: 'bold' }}>
                    Your Teams
                </Typography>
                <StyledButton
                    variant="contained"
                    startIcon={<GroupAddIcon />}
                    onClick={() => setShowTeamForm(!showTeamForm)}
                >
                    {showTeamForm ? 'Hide Form' : 'Create New Team'}
                </StyledButton>
            </Box>

            {showTeamForm && (
                <Box sx={{
                    maxWidth: 600,
                    margin: '0 auto', // Center the form
                    mt: 2,
                    mb: 4,
                    p: 3,
                    backgroundColor: jiraColors.columnBg,
                    borderRadius: 1,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}>
                    <TeamForm onTeamCreated={() => { fetchTeams(); setShowTeamForm(false); }} />
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <StyledButton variant="outlined" onClick={() => setShowTeamForm(false)}>
                            Close Form
                        </StyledButton>
                    </Box>
                </Box>
            )}

            {teams.length === 0 ? (
                <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 4 }}>
                    No teams created yet. Click "Create New Team" to get started.
                </Typography>
            ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2, justifyContent: 'center' }}> {/* Center teams */}
                    {teams.map((team) => (
                        <Box
                            key={team.id}
                            sx={{
                                flex: '1 1 calc(33.33% - 16px)',
                                minWidth: '280px',
                                maxWidth: 'calc(33.33% - 16px)',
                                boxSizing: 'border-box',
                            }}
                        >
                            <Paper
                                sx={{
                                    p: 2,
                                    border: `1px solid ${jiraColors.cardBorder}`,
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
                                    backgroundColor: jiraColors.columnBg,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Box>
                                    <Typography variant="h6" sx={{ color: jiraColors.textDark, fontWeight: 'bold', mb: 1 }}>
                                        {team.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {team.description}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: jiraColors.textMuted, mb: 1 }}>
                                        Members: {team.members_details?.length || 0}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                        {team.members_details && team.members_details.map(member => (
                                            <Chip
                                                key={member.id}
                                                label={member.username}
                                                size="small"
                                                sx={{
                                                    backgroundColor: jiraColors.chipBg,
                                                    color: jiraColors.chipText,
                                                    fontWeight: 'bold',
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                                <StyledButton
                                    variant="outlined"
                                    size="small"
                                    startIcon={<AddIcon />}
                                    sx={{ mt: 2, alignSelf: 'flex-start' }}
                                    onClick={() => handleCreateIssueForTeam(team)}
                                >
                                    Create Issue for Team
                                </StyledButton>
                            </Paper>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default TeamsManagement;