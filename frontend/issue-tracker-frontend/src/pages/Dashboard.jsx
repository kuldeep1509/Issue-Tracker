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
import { styled } from '@mui/system'; // Import styled

// --- Aqua Color Palette Definition (Consistent with other components) ---
const aquaColors = {
    primary: '#00bcd4', // Cyan/Aqua primary color (Material Cyan 500)
    primaryLight: '#4dd0e1', // Lighter primary
    primaryDark: '#00838f', // Darker primary for hover
    backgroundLight: '#e0f7fa', // Very light aqua background (Material Cyan 50)
    backgroundMedium: '#b2ebf2', // Medium aqua for subtle accents
    textDark: '#263238', // Dark slate for primary text
    textMuted: '#546e7a', // Muted slate for secondary text
    white: '#ffffff',
    errorRed: '#ef5350', // Standard Material-UI error red
    kanbanColumnBg: '#f0f8ff', // Very light blue for column background
    kanbanColumnBorder: '#a7d9ed', // Light blue border
    kanbanDropActive: '#e0f2f7', // Lighter aqua when active drop
    kanbanDropCan: '#f5fcff', // Even lighter aqua when can drop
};

const ItemTypes = {
    ISSUE: 'issue'
};

const ISSUE_STATUSES = ['OPEN', 'IN_PROGRESS', 'CLOSED'];

// --- Styled Components for Dashboard ---

const DashboardTitle = styled(Typography)({
    fontWeight: 700,
    color: aquaColors.textDark,
    fontSize: '2.5rem', // Larger title for dashboard
    letterSpacing: '0.8px',
    '@media (max-width:600px)': {
        fontSize: '2rem',
    }
});

const AquaButton = styled(Button)(({ theme }) => ({
    backgroundColor: aquaColors.primary,
    color: aquaColors.white,
    borderRadius: '8px',
    height: 48,
    fontWeight: 600,
    letterSpacing: '0.5px',
    transition: 'background-color 0.2s ease-in-out, transform 0.1s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: aquaColors.primaryDark,
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 15px rgba(0, 188, 212, 0.3)',
    },
    '&:disabled': {
        backgroundColor: aquaColors.backgroundMedium,
        color: aquaColors.white,
        boxShadow: 'none',
        transform: 'none',
    },
}));

const AquaOutlinedButton = styled(Button)(({ theme }) => ({
    borderColor: aquaColors.primary,
    color: aquaColors.primary,
    borderRadius: '8px',
    height: 48,
    fontWeight: 600,
    letterSpacing: '0.5px',
    transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out, border-color 0.2s ease-in-out, transform 0.1s ease-in-out',
    '&:hover': {
        backgroundColor: aquaColors.primaryLight,
        color: aquaColors.white,
        borderColor: aquaColors.primaryLight,
        transform: 'translateY(-2px)',
    },
    '&:disabled': {
        borderColor: aquaColors.backgroundMedium,
        color: aquaColors.textMuted,
    },
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    backgroundColor: aquaColors.white,
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    '& .MuiToggleButtonGroup-grouped': {
        margin: theme.spacing(0.5),
        border: `1px solid ${aquaColors.backgroundMedium} !important`,
        borderRadius: '6px !important',
        '&.Mui-disabled': {
            border: `1px solid ${aquaColors.backgroundMedium} !important`,
        },
    },
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
    color: aquaColors.textMuted,
    fontWeight: 500,
    textTransform: 'none', // Prevent uppercase
    '&.Mui-selected': {
        backgroundColor: aquaColors.primary,
        color: aquaColors.white,
        fontWeight: 600,
        '&:hover': {
            backgroundColor: aquaColors.primaryDark,
        },
    },
    '&:hover': {
        backgroundColor: aquaColors.backgroundMedium,
        color: aquaColors.textDark,
    },
}));

const KanbanColumnBox = styled(Box)(({ theme, isactive, candrop }) => ({
    backgroundColor: isactive ? aquaColors.kanbanDropActive : (candrop ? aquaColors.kanbanDropCan : aquaColors.kanbanColumnBg),
    border: `1px solid ${aquaColors.kanbanColumnBorder}`,
    borderRadius: '12px', // More rounded columns
    padding: theme.spacing(3), // More padding inside columns
    minHeight: '400px', // Ensure columns have a decent minimum height
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2), // Spacing between cards
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)', // Soft shadow for columns
    transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
}));

const ColumnTitle = styled(Typography)({
    fontWeight: 700,
    color: aquaColors.textDark,
    fontSize: '1.25rem', // Larger column titles
    marginBottom: '16px', // More space below title
    textAlign: 'center',
});

const NoIssuesText = styled(Typography)({
    color: aquaColors.textMuted,
    textAlign: 'center',
    marginTop: '16px',
    fontStyle: 'italic',
});

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
        // IMPORTANT: In a real application, replace window.confirm with a custom Material-UI Dialog for better UX.
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
            // IMPORTANT: In a real application, replace alert with a custom Material-UI Snackbar or Dialog for better UX.
            alert("Only admin can modify the status of issues not owned by them.");
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
            setError('Failed to update issue status on server. Reverting changes.');
            fetchIssues(filterStatus); // Revert to actual state from backend on error
        }
    }, [issues, user, fetchIssues, filterStatus]);

    const KanbanColumn = ({ status, issues, moveIssue }) => {
        const [{ isOver, canDrop }, drop] = useDrop(() => ({
            type: ItemTypes.ISSUE,
            accept: ItemTypes.ISSUE, // Explicitly accept ISSUE type
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

        return (
            <Grid item xs={12} sm={6} md={4}>
                <KanbanColumnBox ref={drop} isactive={isActive ? 1 : 0} candrop={canDrop ? 1 : 0}>
                    <ColumnTitle variant="h6">
                        {getColumnTitle(status)} ({issues.length})
                    </ColumnTitle>
                    {issues.length === 0 && !isActive ? (
                        <NoIssuesText variant="body2">
                            No issues here.
                        </NoIssuesText>
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
                </KanbanColumnBox>
            </Grid>
        );
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="calc(100vh - 64px)">
                <CircularProgress sx={{ color: aquaColors.primary }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error" sx={{ backgroundColor: '#ffebee', color: aquaColors.errorRed, borderColor: aquaColors.errorRed, borderRadius: '8px' }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    // Filter and group issues based on the selected status filter
    const issuesToDisplay = filterStatus === 'ALL'
        ? issues
        : issues.filter(issue => issue.status === filterStatus);

    const issuesGroupedByStatus = ISSUE_STATUSES.reduce((acc, status) => {
        acc[status] = issuesToDisplay.filter(issue => issue.status === status);
        return acc;
    }, {});

    return (
        <DndProvider backend={HTML5Backend}>
            <Container maxWidth="xl" sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                    <DashboardTitle component="h1">
                        Issue Dashboard
                    </DashboardTitle>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <AquaButton
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleCreateIssue}
                        >
                            Create Issue
                        </AquaButton>
                        {user?.is_staff && (
                            <AquaOutlinedButton
                                variant="outlined"
                                startIcon={<PersonAddIcon />}
                                onClick={() => setOpenInviteModal(true)}
                            >
                                Invite Team Member
                            </AquaOutlinedButton>
                        )}
                    </Box>
                </Box>

                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                    <StyledToggleButtonGroup
                        value={filterStatus}
                        exclusive
                        onChange={handleStatusFilterChange}
                        aria-label="issue status filter"
                    >
                        <StyledToggleButton value="ALL" aria-label="all issues">
                            All Issues
                        </StyledToggleButton>
                        {ISSUE_STATUSES.map(status => (
                            <StyledToggleButton key={status} value={status} aria-label={`${status.toLowerCase()} issues`}>
                                {status.replace('_', ' ')}
                            </StyledToggleButton>
                        ))}
                    </StyledToggleButtonGroup>
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