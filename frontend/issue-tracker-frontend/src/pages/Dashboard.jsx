import React, { useState, useEffect, useCallback } from 'react';
import {
    Container, Typography, Box, Button, CircularProgress, Alert,
    ToggleButtonGroup, ToggleButton, Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupAddIcon from '@mui/icons-material/GroupAdd'; // Added for team creation button
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openIssueModal, setOpenIssueModal] = useState(false);
    const [currentIssue, setCurrentIssue] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [openInviteModal, setOpenInviteModal] = useState(false);
    const [showTeamForm, setShowTeamForm] = useState(false); // New state for TeamForm visibility

    const fetchIssues = useCallback(async (statusFilter = 'ALL') => {
        setLoading(true);
        setError('');
        try {
            const endpoint = user?.is_staff ? '/issues/' : '/issues/my_issues/';
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

    useEffect(() => {
        if (isAuthenticated) {
            fetchIssues(filterStatus);
        }
    }, [isAuthenticated, filterStatus, fetchIssues]);

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
        // IMPORTANT: Replaced window.confirm with a custom modal or a more robust solution
        // as window.confirm is blocked in the Canvas environment.
        // For this example, I'm using a simple console log. In a real app,
        // you'd implement a custom Material-UI Dialog for confirmation.
        console.log(`Attempting to delete issue ${issueId}`);
        const confirmDelete = true; // Replace with actual custom confirmation logic
        if (confirmDelete) {
            try {
                await api.delete(`/issues/${issueId}/`);
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
            // IMPORTANT: Replaced alert with a console log. Implement a custom Material-UI Snackbar or Dialog for user feedback.
            console.log("Only admin can modify the status");
            return;
        }

        const updatedIssues = issues.map((issue) =>
            issue.id === id ? { ...issue, status: newStatus } : issue
        );
        setIssues(updatedIssues);

        try {
            await api.patch(`/issues/${id}/`, { status: newStatus });
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
                        {/* New Button to show TeamForm */}
                        <Button
                            variant="contained"
                            startIcon={<GroupAddIcon />} // Using GroupAddIcon for teams
                            onClick={() => setShowTeamForm(true)}
                            sx={{ mr: 2 }}
                        >
                            Create Team
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
                        mb: 4, // Added margin-bottom for spacing
                        p: 3,
                        backgroundColor: '#fefefe',
                        borderRadius: 2,
                        boxShadow: 3
                    }}>
                        <Typography variant="h5" gutterBottom align="center">
                            Create a New Team
                        </Typography>
                        <TeamForm />
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Button variant="outlined" onClick={() => setShowTeamForm(false)}>
                                Close Team Form
                            </Button>
                        </Box>
                    </Box>
                )}

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
