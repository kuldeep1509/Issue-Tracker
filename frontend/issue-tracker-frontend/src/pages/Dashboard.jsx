// src/pages/Dashboard.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box, Grid, Typography, Button, CircularProgress,
    AppBar, Toolbar, IconButton, Menu, MenuItem, Tooltip,
    Avatar, Tab, Tabs, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings'; // For user/admin settings
import GroupIcon from '@mui/icons-material/Group'; // For teams tab
import BugReportIcon from '@mui/icons-material/BugReport'; // For issues tab
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'; // For inviting members
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAuth } from '../context/AuthContext';
import IssueCard from '../components/IssueCard';
import IssueModal from '../components/IssueModal';
import TeamCreationModal from '../components/TeamCreationModal';
import InviteTeamMemberModal from '../components/InviteTeamMemberModal'; // For inviting new users
import toast from 'react-toastify'
import {
    getIssues, deleteIssue, updateIssue,
    getTeams, addTeamMember, removeTeamMember, deleteTeam
} from '../services/api'; // Import all necessary API functions
import { styled } from '@mui/system';


// --- Aqua Color Palette Definition ---
const aquaColors = {
    primary: '#00bcd4', // Cyan/Aqua primary color (Material Cyan 500)
    primaryLight: '#4dd0e1', // Lighter primary
    primaryDark: '#00838f', // Darker primary for hover
    backgroundLight: '#e0f7fa', // Very light aqua background (Material Cyan 50)
    backgroundMedium: '#b2ebf2', // Medium aqua for subtle accents
    textDark: '#263238', // Dark slate for primary text
    textMuted: '#546e7a', // Muted slate for secondary text
    paperBackground: '#f5f5f5', // Light grey for the dashboard columns
    white: '#ffffff', // Explicit white for styled components
    deleteRed: '#ef5350',
    editBlue: '#2196f3',
    sectionHeaderBackground: '#e0f7fa', // Light aqua for section headers
};

// --- Styled Components for Dashboard Layout ---
const DashboardContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: aquaColors.backgroundLight,
});

const StyledAppBar = styled(AppBar)({
    backgroundColor: aquaColors.primary,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
});

const StyledToolbar = styled(Toolbar)({
    display: 'flex',
    justifyContent: 'space-between',
});

const UserAvatar = styled(Avatar)({
    backgroundColor: aquaColors.backgroundMedium,
    color: aquaColors.textDark,
    fontWeight: 600,
});

const MainContent = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1),
    },
}));

const ColumnHeader = styled(Box)({
    backgroundColor: aquaColors.sectionHeaderBackground,
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
});

const IssuesColumn = styled(Box)(({ theme }) => ({
    backgroundColor: aquaColors.paperBackground,
    borderRadius: '12px',
    padding: theme.spacing(2),
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
    minHeight: '500px', // Ensure columns have a minimum height for DND
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1),
    },
}));

const StyledTabs = styled(Tabs)({
    '& .MuiTabs-indicator': {
        backgroundColor: aquaColors.primaryLight,
        height: '4px',
    },
});

const StyledTab = styled(Tab)({
    color: aquaColors.white,
    fontWeight: 600,
    fontSize: '1rem',
    opacity: 0.8,
    '&.Mui-selected': {
        color: aquaColors.white,
        opacity: 1,
    },
});

const AddButton = styled(Button)({
    backgroundColor: aquaColors.primaryLight,
    color: aquaColors.textDark,
    '&:hover': {
        backgroundColor: aquaColors.primaryDark,
        color: aquaColors.white,
    },
});

const MemberChip = styled(Chip)({
    margin: '4px',
    backgroundColor: aquaColors.backgroundMedium,
    color: aquaColors.textDark,
    fontWeight: 500,
});

const ActionButton = styled(Button)(({ theme, variant, color }) => ({
    minWidth: '100px', // Standardize button width
    borderRadius: '8px',
    fontWeight: 600,
    textTransform: 'none',
    margin: theme.spacing(0.5),
    ...(variant === 'outlined' && {
        borderColor: aquaColors.borderMuted,
        color: aquaColors.textDark,
        '&:hover': {
            borderColor: aquaColors.primary,
            backgroundColor: aquaColors.backgroundMedium,
        },
    }),
    ...(variant === 'contained' && color === 'primary' && {
        backgroundColor: aquaColors.primary,
        color: aquaColors.white,
        '&:hover': {
            backgroundColor: aquaColors.primaryDark,
        },
    }),
    ...(variant === 'contained' && color === 'error' && {
        backgroundColor: aquaColors.deleteRed,
        color: aquaColors.white,
        '&:hover': {
            backgroundColor: '#c62828', // Darker red on hover
        },
    }),
}));

const DangerZoneSection = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(4),
    padding: theme.spacing(3),
    border: `1px solid ${aquaColors.errorRed}`,
    borderRadius: '12px',
    backgroundColor: 'rgba(239, 83, 80, 0.05)', // Very light red background
}));

// --- Dashboard Component ---
const Dashboard = () => {
    const { user, logoutUser } = useAuth();
    const [issues, setIssues] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [currentIssue, setCurrentIssue] = useState(null); // For editing issues

    const [isTeamCreationModalOpen, setIsTeamCreationModalOpen] = useState(false);
    const [isInviteMemberModalOpen, setIsInviteMemberModalOpen] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null); // For user menu
    const openUserMenu = Boolean(anchorEl);

    const [selectedTab, setSelectedTab] = useState(0); // 0 for Issues, 1 for Teams

    // Memoized issue statuses for columns
    const issueStatuses = useMemo(() => ['OPEN', 'IN_PROGRESS', 'CLOSED'], []);

    // --- Data Fetching Functions ---

    const fetchIssues = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getIssues();
            setIssues(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching issues:', err.response?.data || err.message);
            setError('Failed to load issues. Please try again.');
            toast.error('Failed to load issues.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTeams = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getTeams();
            setTeams(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching teams:', err.response?.data || err.message);
            setError('Failed to load teams. Please try again.');
            toast.error('Failed to load teams.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedTab === 0) {
            fetchIssues();
        } else {
            fetchTeams();
        }
    }, [selectedTab, fetchIssues, fetchTeams]);

    // --- Issue Actions ---

    const handleCreateIssueClick = () => {
        setCurrentIssue(null); // Clear any existing issue data
        setIsIssueModalOpen(true);
    };

    const handleEditIssueClick = (issue) => {
        setCurrentIssue(issue);
        setIsIssueModalOpen(true);
    };

    const handleDeleteIssue = async (issueId) => {
        if (window.confirm('Are you sure you want to delete this issue?')) {
            try {
                await deleteIssue(issueId);
                toast.success('Issue deleted successfully!');
                fetchIssues(); // Refresh the list
            } catch (err) {
                console.error('Error deleting issue:', err.response?.data || err.message);
                toast.error('Failed to delete issue.');
            }
        }
    };

    const handleIssueSave = () => {
        // This function is called by IssueModal on successful save/update
        fetchIssues(); // Refresh issues after save
        toast.success(currentIssue ? 'Issue updated!' : 'Issue created!');
    };

    // --- Drag and Drop (DND) for Issues ---

    const moveIssue = useCallback(async (issueId, newStatus) => {
        const issueToMove = issues.find(issue => issue.id === issueId);
        if (issueToMove && issueToMove.status !== newStatus) {
            // Optimistic UI update
            setIssues(prevIssues =>
                prevIssues.map(issue =>
                    issue.id === issueId ? { ...issue, status: newStatus } : issue
                )
            );

            try {
                // Send partial update to backend for status change
                await updateIssue(issueId, { status: newStatus });
                toast.success(`Issue status updated to ${newStatus.replace('_', ' ')}`);
            } catch (err) {
                console.error('Error updating issue status via DND:', err.response?.data || err.message);
                toast.error('Failed to update issue status. Reverting changes.');
                // Revert UI if API call fails
                setIssues(prevIssues =>
                    prevIssues.map(issue =>
                        issue.id === issueId ? { ...issue, status: issueToMove.status } : issue
                    )
                );
            }
        }
    }, [issues]);

    // --- Team Actions ---

    const handleCreateTeamClick = () => {
        setIsTeamCreationModalOpen(true);
    };

    const handleTeamCreated = (newTeam) => {
        toast.success(`Team "${newTeam.name}" created successfully!`);
        fetchTeams(); // Refresh teams after creation
    };

    const handleInviteMemberClick = () => {
        setIsInviteMemberModalOpen(true);
    };

    const handleAddMemberToTeam = async (teamId, userId) => {
        try {
            await addTeamMember(teamId, userId);
            toast.success('Member added to team!');
            fetchTeams(); // Refresh teams to show new member
        } catch (error) {
            console.error('Error adding member:', error.response?.data || error.message);
            toast.error('Failed to add member to team.');
        }
    };

    const handleRemoveMemberFromTeam = async (teamId, userId) => {
        if (window.confirm('Are you sure you want to remove this member from the team?')) {
            try {
                await removeTeamMember(teamId, userId);
                toast.success('Member removed from team!');
                fetchTeams(); // Refresh teams to show updated members
            } catch (error) {
                console.error('Error removing member:', error.response?.data || error.message);
                toast.error('Failed to remove member from team.');
            }
        }
    };

    const handleDeleteTeam = async (teamId, teamName) => {
        if (window.confirm(`Are you sure you want to delete the team "${teamName}"? This action cannot be undone.`)) {
            try {
                await deleteTeam(teamId);
                toast.success(`Team "${teamName}" deleted successfully!`);
                fetchTeams(); // Refresh teams
            } catch (error) {
                console.error('Error deleting team:', error.response?.data || error.message);
                toast.error('Failed to delete team.');
            }
        }
    };

    // --- User Menu Actions ---
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        logoutUser();
    };

    // Filter issues by status for each column
    const getIssuesByStatus = (status) => issues.filter(issue => issue.status === status);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: aquaColors.backgroundLight }}>
                <CircularProgress sx={{ color: aquaColors.primary }} size={60} thickness={5} />
            </Box>
        );
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <DashboardContainer>
                <StyledAppBar position="static">
                    <StyledToolbar>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h5" component="div" sx={{ fontWeight: 700, color: aquaColors.white }}>
                                Issue Tracker
                            </Typography>
                            <StyledTabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
                                <StyledTab label="Issues" icon={<BugReportIcon />} iconPosition="start" />
                                <StyledTab label="Teams" icon={<GroupIcon />} iconPosition="start" />
                            </StyledTabs>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {user && (
                                <Tooltip title="Account Settings">
                                    <IconButton onClick={handleMenuOpen} size="large" edge="end" color="inherit">
                                        <UserAvatar>{user.username ? user.username.charAt(0).toUpperCase() : '?'}</UserAvatar>
                                    </IconButton>
                                </Tooltip>
                            )}
                            <Menu
                                anchorEl={anchorEl}
                                open={openUserMenu}
                                onClose={handleMenuClose}
                                PaperProps={{
                                    sx: {
                                        mt: 1.5,
                                        width: 200,
                                        borderRadius: '8px',
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                                        '& .MuiMenuItem-root': {
                                            fontWeight: 500,
                                            padding: '10px 16px',
                                            '&:hover': {
                                                backgroundColor: aquaColors.backgroundLight,
                                                color: aquaColors.primaryDark,
                                            },
                                        },
                                    },
                                }}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            >
                                <MenuItem disabled>
                                    <Typography variant="body2" color="text.secondary">Logged in as:</Typography>
                                </MenuItem>
                                <MenuItem onClick={() => { /* Implement profile view */ }}>
                                    <Typography fontWeight={600}>{user?.username}</Typography>
                                </MenuItem>
                                {user?.is_staff && (
                                    <MenuItem onClick={handleInviteMemberClick}>
                                        <PersonAddAlt1Icon sx={{ mr: 1, color: aquaColors.textMuted }} fontSize="small" /> Invite New User
                                    </MenuItem>
                                )}
                                <MenuItem onClick={handleLogout}>
                                    <SettingsIcon sx={{ mr: 1, color: aquaColors.textMuted }} fontSize="small" /> Logout
                                </MenuItem>
                            </Menu>
                        </Box>
                    </StyledToolbar>
                </StyledAppBar>

                <MainContent>
                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '6px' }}>{error}</Alert>}

                    {selectedTab === 0 && ( // Issues Tab
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                                <AddButton
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={handleCreateIssueClick}
                                >
                                    Create New Issue
                                </AddButton>
                            </Box>
                            <Grid container spacing={3}>
                                {issueStatuses.map((status) => (
                                    <Grid item xs={12} md={4} key={status}>
                                        <IssuesColumn>
                                            <ColumnHeader>
                                                <Typography variant="h6" sx={{ color: aquaColors.textDark, fontWeight: 700 }}>
                                                    {status.replace('_', ' ')} ({getIssuesByStatus(status).length})
                                                </Typography>
                                            </ColumnHeader>
                                            <IssueDropTarget status={status} moveIssue={moveIssue}>
                                                {getIssuesByStatus(status).map((issue) => (
                                                    <IssueCard
                                                        key={issue.id}
                                                        issue={issue}
                                                        onEdit={handleEditIssueClick}
                                                        onDelete={handleDeleteIssue}
                                                    />
                                                ))}
                                                {getIssuesByStatus(status).length === 0 && (
                                                    <Typography variant="body2" color={aquaColors.textMuted} sx={{ textAlign: 'center', mt: 4 }}>
                                                        No issues in this status.
                                                    </Typography>
                                                )}
                                            </IssueDropTarget>
                                        </IssuesColumn>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {selectedTab === 1 && ( // Teams Tab
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                                <AddButton
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={handleCreateTeamClick}
                                >
                                    Create New Team
                                </AddButton>
                            </Box>
                            <Grid container spacing={3}>
                                {teams.length === 0 ? (
                                    <Grid item xs={12}>
                                        <Typography variant="h6" color={aquaColors.textMuted} textAlign="center" mt={5}>
                                            No teams created yet. Start by creating a new team!
                                        </Typography>
                                    </Grid>
                                ) : (
                                    teams.map((team) => (
                                        <Grid item xs={12} md={6} lg={4} key={team.id}>
                                            <IssuesColumn> {/* Re-using IssuesColumn style for team cards */}
                                                <ColumnHeader>
                                                    <Typography variant="h6" sx={{ color: aquaColors.textDark, fontWeight: 700 }}>
                                                        {team.name}
                                                    </Typography>
                                                </ColumnHeader>
                                                <Typography variant="body2" color={aquaColors.textMuted} mb={2}>
                                                    {team.description || 'No description provided.'}
                                                </Typography>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: aquaColors.textDark, mb: 1 }}>
                                                    Members:
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                                    {team.members.length === 0 ? (
                                                        <Typography variant="body2" color={aquaColors.textMuted}>
                                                            No members in this team.
                                                        </Typography>
                                                    ) : (
                                                        team.members.map(member => (
                                                            <MemberChip
                                                                key={member.id}
                                                                label={member.username}
                                                                onDelete={user?.is_staff || user?.id === team.owner.id ? () => handleRemoveMemberFromTeam(team.id, member.id) : undefined}
                                                                deleteIcon={user?.is_staff || user?.id === team.owner.id ? <IconButton size="small" sx={{ color: aquaColors.textMuted }}><SettingsIcon fontSize="small" /></IconButton> : null}
                                                            />
                                                        ))
                                                    )}
                                                </Box>

                                                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                    {/* Only team owner or staff can manage members */}
                                                    {(user?.is_staff || user?.id === team.owner.id) && (
                                                        <ActionButton
                                                            variant="outlined"
                                                            color="primary"
                                                            onClick={() => toast.info('Member management coming soon!')}
                                                        >
                                                            Manage Members
                                                        </ActionButton>
                                                    )}
                                                    {/* Only team owner or staff can delete team */}
                                                    {(user?.is_staff || user?.id === team.owner.id) && (
                                                        <ActionButton
                                                            variant="contained"
                                                            color="error"
                                                            onClick={() => handleDeleteTeam(team.id, team.name)}
                                                        >
                                                            Delete Team
                                                        </ActionButton>
                                                    )}
                                                </Box>
                                            </IssuesColumn>
                                        </Grid>
                                    ))
                                )}
                            </Grid>
                        </Box>
                    )}
                </MainContent>

                {/* Modals */}
                <IssueModal
                    open={isIssueModalOpen}
                    handleClose={() => setIsIssueModalOpen(false)}
                    issue={currentIssue}
                    onSave={handleIssueSave}
                />
                <TeamCreationModal
                    open={isTeamCreationModalOpen}
                    handleClose={() => setIsTeamCreationModalOpen(false)}
                    onTeamCreated={handleTeamCreated}
                />
                {user?.is_staff && ( // Only show invite modal to staff users
                    <InviteTeamMemberModal
                        open={isInviteMemberModalOpen}
                        handleClose={() => setIsInviteMemberModalOpen(false)}
                    />
                )}
            </DashboardContainer>
        </DndProvider>
    );
};

export default Dashboard;

// --- IssueDropTarget Component for DND ---
// This component acts as a drop zone for issues
import { useDrop } from 'react-dnd';

const IssueDropTarget = ({ status, children, moveIssue }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemTypes.ISSUE,
        drop: (item, monitor) => {
            if (item.currentStatus !== status) {
                moveIssue(item.id, status);
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    return (
        <Box
            ref={drop}
            sx={{
                minHeight: '200px', // Ensure enough height for dropping
                backgroundColor: isOver ? aquaColors.backgroundMedium : 'transparent',
                borderRadius: '8px',
                padding: '8px',
                transition: 'background-color 0.2s ease-in-out',
            }}
        >
            {children}
        </Box>
    );
};