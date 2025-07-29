// src/pages/Dashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    Container, Typography, Box, Button, CircularProgress, Alert,
    ToggleButtonGroup, ToggleButton, Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import IssueCard from '../components/IssueCard';
import IssueModal from '../components/IssueModal';
import InviteTeamMemberModal from '../components/InviteTeamMemberModal';
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


const fetchIssues = useCallback(async (statusFilter = 'ALL') => {
    setLoading(true);
    setError('');
    try {
        const endpoint = user?.is_staff ? '/issues/' : '/issues/my_issues/';
        const params = statusFilter !== 'ALL' ? { status: statusFilter } : {};

        const response = await api.get(endpoint, { params });

        
        // DRF backend uses pagination, response.data will be an object
        // with a 'results' key containing the actual array of issues.
        if (response.data && Array.isArray(response.data.results)) {
            setIssues(response.data.results);
        } else if (Array.isArray(response.data)) {
            // If it's not paginated, it might be a direct array
            setIssues(response.data);
        } else {
            // Log if the response structure is unexpected
            console.warn("Unexpected API response structure for issues:", response.data);
            setIssues([]); // Ensure issues is an array to prevent filter error
        }
   
    } catch (err) {
        console.error('Failed to fetch issues:', err.response?.data || err.message);
        setError('Failed to load issues. Please try again.');
        setIssues([]); // Crucial: Ensure 'issues' is reset to an empty array on error
    } finally {
        setLoading(false);
    }
}, [user]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchIssues(filterStatus);
            // Polling for real-time updates (can be replaced by WebSockets for better performance)
            
            
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
        if (window.confirm('Are you sure you want to delete this issue?')) {
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

        // Frontend permission check (backend has the final say)
        if (issueToMove.owner.id !== user.id && !user.is_staff) {
            alert("Only admin can modify the status")
            return;
        }

        // Optimistic UI update
        const updatedIssues = issues.map((issue) =>
            issue.id === id ? { ...issue, status: newStatus } : issue
        );
        setIssues(updatedIssues);

        try {
            await api.patch(`/issues/${id}/`, { status: newStatus });
        } catch (err) {
            console.error('Failed to update issue status:', err.response?.data || err.message);
            setError('Failed to update issue status on server.');
            fetchIssues(filterStatus); // Revert to actual state from backend on error
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
        if (isActive) {
            backgroundColor = '#e0e0e0';
        } else if (canDrop) {
            backgroundColor = '#f0f0f0';
        }

        return (
            <Grid item xs={12} sm={6} md={4}>
                <Box
                    ref={drop}
                    sx={{
                        backgroundColor: backgroundColor,
                        border: '1px solid #cccccc',
                        borderRadius: 2,
                        padding: 2,
                        minHeight: '250px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        boxShadow: 2,
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

// Line 205 (where the error occurs, specifically the filter inside reduce):
    const issuesGroupedByStatus = ISSUE_STATUSES.reduce((acc, status) => {
        acc[status] = issuesToDisplay.filter(issue => issue.status === status); // <--- ERROR HERE
        return acc;
    }, {});

    return (
        <DndProvider backend={HTML5Backend}>
            <Container maxWidth="xl" sx={{ mt: 4 }}>
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
                        <ToggleButton value="ALL" aria-label="all issues">
                            All Issues
                        </ToggleButton>
                        {ISSUE_STATUSES.map(status => (
                            <ToggleButton key={status} value={status} aria-label={`${status.toLowerCase()} issues`}>
                                {status.replace('_', ' ')}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Box>

                <Grid container spacing={3}>
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