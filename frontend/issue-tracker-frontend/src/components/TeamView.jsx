import React from 'react';
import {
    Box, Typography, Button, Paper, Chip, CircularProgress
} from '@mui/material';
import { useTheme, styled } from '@mui/system';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import GroupIcon from '@mui/icons-material/Group';
import TeamForm from './TeamCreationModal';

// Import jiraColors from the main Dashboard file
import { jiraColors } from '../styles/jiraTheme';

// Styled components for TeamView
const StyledButton = styled(Button)(({ variant }) => ({
    borderRadius: '3px',
    textTransform: 'none',
    fontWeight: 600,
    padding: '8px 16px',
    transition: 'background-color 0.2s ease-in-out',
    ...(variant === 'contained' && {
        backgroundColor: jiraColors.buttonPrimary,
        color: 'white',
        '&:hover': {
            backgroundColor: jiraColors.buttonPrimaryHover,
        },
    }),
    ...(variant === 'outlined' && {
        borderColor: jiraColors.buttonSecondary,
        color: jiraColors.headerText,
        '&:hover': {
            backgroundColor: jiraColors.buttonSecondaryHover,
            borderColor: jiraColors.buttonSecondaryHover,
        },
    }),
}));

const TeamView = ({ teams, showTeamForm, setShowTeamForm, fetchTeams, handleCreateIssueForTeam }) => {
    const theme = useTheme();

    return (
        <Box>
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
                    margin: '0 auto',
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
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                    No teams created yet. Click "Create New Team" to get started.
                </Typography>
            ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing(2), mt: 2 }}>
                    {teams.map((team) => (
                        <Box
                            key={team.id}
                            sx={{
                                flex: '1 1 calc(33.33% - 16px)', // Adjusted flex-basis for 3 columns with gap
                                minWidth: '280px',
                                maxWidth: 'calc(33.33% - 16px)', // Max width to ensure 3 columns fit with gap
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
                                onClick={() => handleCreateIssueForTeam(team)}
                            >
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <GroupIcon sx={{ color: jiraColors.textMuted, mr: 1 }} />
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: jiraColors.textDark }}>{team.name}</Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" mt={1}>Members:</Typography>
                                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {(team.members ?? []).map((member) => (
                                            <Chip
                                                key={member.id || member}
                                                label={typeof member === 'object' ? member.username : member}
                                                size="small"
                                                sx={{ backgroundColor: jiraColors.chipBg, color: jiraColors.chipText, fontWeight: 600 }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                                <StyledButton size="small" variant="outlined" sx={{ mt: 2, alignSelf: 'flex-start' }} onClick={(e) => { e.stopPropagation(); handleCreateIssueForTeam(team); }}>
                                    Assign Issue to Team
                                </StyledButton>
                            </Paper>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default TeamView;
