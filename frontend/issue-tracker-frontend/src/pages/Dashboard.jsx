import React, { useState, useEffect, useCallback } from 'react';
import {
    Container, Typography, Box, Button, CircularProgress, Alert,
    ToggleButtonGroup, ToggleButton, Grid, Paper, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import IssueCard from '../components/IssueCard';
import IssueModal from '../components/IssueModal';
import InviteTeamMemberModal from '../components/InviteTeamMemberModal';
import TeamForm from './TeamForm'; // Import TeamForm
import api from '../services/api';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAuth } from '../context/AuthContext';

const ItemTypes = {
    ISSUE: 'issue'
};

const ISSUE_STATUSES = ['OPEN', 'IN_PROGRESS', 'CLOSED'];

const Dashboard = () => {
    const { user, isAuthenticated } = useAuth();

    const [issues, setIssues] = useState([]);
    const [teams, setTeams] = useState([]); // New state for teams
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openIssueModal, setOpenIssueModal] = useState(false);
    const [currentIssue, setCurrentIssue] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [openInviteModal, setOpenInviteModal] = useState(false);
    const [showTeamForm, setShowTeamForm] = useState(false);

    const fetchIssues = useCallback(async (statusFilter = 'ALL') => {
        setLoading(true);
        setError('');
        try {
            const endpoint = user?.is_staff ? 'issues/' : 'issues/my_issues/'; // Corrected: Removed leading '/'
            const params = statusFilter !== 'ALL' ? { status: statusFilter } : {};

            const response = await api.get(endpoint, { params });

            if (response.data && Array.isArray(response.data.results)) {
                setIssues(response.data.results);
            } else if (Array.isArray(response.data)) {
                setIssues(response.data);
            } else {
                console.warn("Unexpected API response structure for issues:", response.data);
                setIssues([]);
            }
        } catch (err) {
            console.error('Failed to fetch issues:', err.response?.data || err.message);
            setError('Failed to load issues. Please try again.');
            setIssues([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // New function to fetch teams
    const fetchTeams = useCallback(async () => {
        try {
            // CORRECTED: Fetching teams from 'teams/' endpoint, which resolves to /api/teams/
            // This aligns with the TeamViewSet you set up in your backend.
            const response = await api.get('teams/');
            // --- ADDED CONSOLE LOG FOR DEBUGGING ---
            console.log("Teams fetched for dashboard:", response.data);
            // ---------------------------------------
            if (Array.isArray(response.data)) {
                setTeams(response.data);
            } else if (response.data && Array.isArray(response.data.results)) {
                setTeams(response.data.results);
            } else {
                console.warn("Unexpected API response structure for teams:", response.data);
                setTeams([]);
            }
        } catch (err) {
            console.error('Failed to fetch teams:', err.response?.data || err.message);
            // Don't set a global error for teams if issues are still loading
        }
    }, []);

    // Effect to fetch issues and teams on component mount or auth change
    useEffect(() => {
        if (isAuthenticated) {
            fetchIssues(filterStatus);
            fetchTeams(); // Fetch teams when authenticated
        }
    }, [isAuthenticated, filterStatus, fetchIssues, fetchTeams]);

    const handleCreateIssue = () => {
        setCurrentIssue(null);
        setOpenIssueModal(true);
    };

    const handleEditIssue = (issue) => {
        setCurrentIssue(issue);
        setOpenIssueModal(true);
    };

    const handleCloseIssueModal = () => {
        setOpenIssueModal(false);
        setCurrentIssue(null);
    };

    const handleDeleteIssue = async (issueId) => {
        console.log(`Attempting to delete issue ${issueId}`);
        // In a real app, implement a custom Material-UI Dialog for confirmation.
        const confirmDelete = window.confirm("Are you sure you want to delete this issue?"); // Re-added for testing, but replace with custom modal
        if (confirmDelete) {
            try {
                // Corrected: Removed leading '/'
                await api.delete(`issues/${issueId}/`);
                fetchIssues(filterStatus);
            } catch (err) {
                console.error('Failed to delete issue:', err.response?.data || err.message);
                setError('Failed to delete issue. You can only delete your own issues or be an admin.');
            }
        }
    };

    const handleStatusFilterChange = (event, newFilter) => {
        if (newFilter !== null) {
            setFilterStatus(newFilter);
        }
    };

    const moveIssue = useCallback(async (id, newStatus) => {
        const issueToMove = issues.find((issue) => issue.id === id);
        if (!issueToMove || issueToMove.status === newStatus) return;

        if (issueToMove.owner.id !== user.id && !user.is_staff) {
            console.log("Only admin can modify the status");
            setError("You do not have permission to change the status of this issue.");
            return;
        }

        const updatedIssues = issues.map((issue) =>
            issue.id === id ? { ...issue, status: newStatus } : issue
        );
        setIssues(updatedIssues);

        try {
            // Corrected: Removed leading '/'
            await api.patch(`issues/${id}/`, { status: newStatus });
        } catch (err) {
            console.error('Failed to update issue status:', err.response?.data || err.message);
            setError('Failed to update issue status on server.');
            fetchIssues(filterStatus);
        }
    }, [issues, user, fetchIssues, filterStatus]);

    const KanbanColumn = ({ status, issues, moveIssue }) => {
        const [{ isOver, canDrop }, drop] = useDrop(() => ({
            accept: ItemTypes.ISSUE,
            drop: (item) => moveIssue(item.id, status),
            collect: (monitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
            }),
        }));

        const getColumnTitle = (status) => {
            switch (status) {
                case 'OPEN': return 'Open Issues';
                case 'IN_PROGRESS': return 'In Progress';
                case 'CLOSED': return 'Closed Issues';
                default: return 'Unknown Status';
            }
        };

        const isActive = isOver && canDrop;
        let backgroundColor = '#f5f5f5';
        if (isActive) backgroundColor = '#e0e0e0';
        else if (canDrop) backgroundColor = '#f0f0f0';

        return (
            <Grid item xs={4} sx={{ flex: 1, minWidth: 0, px: 1.5 }}>
                <Box
                    ref={drop}
                    sx={{
                        backgroundColor,
                        border: '1px solid #cccccc',
                        borderRadius: 2,
                        padding: 2,
                        minHeight: '300px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        boxShadow: 2,
                        width: '100%',
                        boxSizing: 'border-box',
                    }}
                >
                    <Typography variant="h6" align="center" mb={2} color="primary">
                        {getColumnTitle(status)} ({issues.length})
                    </Typography>
                    {issues.length === 0 && !isActive ? (
                        <Typography variant="body2" color="text.secondary" align="center">
                            No issues here.
                        </Typography>
                    ) : (
                        issues.map((issue) => (
                            <IssueCard
                                key={issue.id}
                                issue={issue}
                                onEdit={handleEditIssue}
                                onDelete={handleDeleteIssue}
                            />
                        ))
                    )}
                </Box>
            </Grid>
        );
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="calc(100vh - 64px)">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    const issuesToDisplay = filterStatus === 'ALL'
        ? issues
        : issues.filter(issue => issue.status === filterStatus);

    const issuesGroupedByStatus = ISSUE_STATUSES.reduce((acc, status) => {
        acc[status] = Array.isArray(issuesToDisplay) ? issuesToDisplay.filter(issue => issue.status === status) : [];
        return acc;
    }, {});

    return (
        <DndProvider backend={HTML5Backend}>
            <Container maxWidth="xl" sx={{ mt: 4, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        Issue Dashboard
                    </Typography>
                    <Box>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleCreateIssue}
                            sx={{ mr: 2 }}
                        >
                            Create Issue
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<GroupAddIcon />}
                            onClick={() => setShowTeamForm(!showTeamForm)} // Toggle TeamForm visibility
                            sx={{ mr: 2 }}
                        >
                            {showTeamForm ? 'Hide Team Form' : 'Create Team'}
                        </Button>
                        {user?.is_staff && (
                            <Button
                                variant="outlined"
                                startIcon={<PersonAddIcon />}
                                onClick={() => setOpenInviteModal(true)}
                            >
                                Invite Team Member
                            </Button>
                        )}
                    </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <ToggleButtonGroup
                        value={filterStatus}
                        exclusive
                        onChange={handleStatusFilterChange}
                        aria-label="issue status filter"
                        color="primary"
                    >
                        <ToggleButton value="ALL">All Issues</ToggleButton>
                        {ISSUE_STATUSES.map(status => (
                            <ToggleButton key={status} value={status}>
                                {status.replace('_', ' ')}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Box>

                {/* Conditionally render TeamForm */}
                {showTeamForm && (
                    <Box sx={{
                        maxWidth: 600,
                        margin: '0 auto',
                        mt: 4,
                        mb: 4,
                        p: 3,
                        backgroundColor: '#fefefe',
                        borderRadius: 2,
                        boxShadow: 3
                    }}>
                        {/* Pass fetchTeams as a callback to refresh teams after creation */}
                        <TeamForm onTeamCreated={fetchTeams} />
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Button variant="outlined" onClick={() => setShowTeamForm(false)}>
                                Close Team Form
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* Display Teams Section */}
                <Box sx={{ mt: 4, mb: 4, p: 3, backgroundColor: '#f9f9f9', borderRadius: 2, boxShadow: 1 }}>
                    <Typography variant="h5" gutterBottom align="center">
                        Your Teams
                    </Typography>
                    {teams.length === 0 ? (
                        <Typography variant="body2" color="textSecondary" align="center">
                            No teams created yet. Create a team using the "Create Team" button above.
                        </Typography>
                    ) : (
                        <Grid container spacing={2}>
                            {teams.map((team) => (
                                <Grid item xs={12} sm={6} md={4} key={team.id}>
                                    <Paper sx={{ p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">{team.name}</Typography>
                                        <Typography variant="body2" color="textSecondary" mt={1}>Members:</Typography>
                                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {(team.members ?? []).map((member) => (
                                                <Chip
                                                    key={member.id || member}
                                                    label={typeof member === 'object' ? member.username : member}
                                                    color="primary"
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            ))}
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>


                {/* Kanban Board */}
                <Grid
                    container
                    columns={3}
                    spacing={0}
                    sx={{ width: '100%', flexWrap: 'nowrap' }}
                >
                    {ISSUE_STATUSES.map((status) => (
                        <KanbanColumn
                            key={status}
                            status={status}
                            issues={issuesGroupedByStatus[status]}
                            moveIssue={moveIssue}
                        />
                    ))}
                </Grid>

                <IssueModal
                    open={openIssueModal}
                    handleClose={handleCloseIssueModal}
                    issue={currentIssue}
                    onSave={() => fetchIssues(filterStatus)}
                />

                <InviteTeamMemberModal
                    open={openInviteModal}
                    handleClose={() => setOpenInviteModal(false)}
                />
            </Container>
        </DndProvider>
    );
};

export default Dashboard;
