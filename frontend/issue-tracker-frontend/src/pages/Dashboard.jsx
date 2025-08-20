import  { useState, useEffect, useCallback } from 'react';
import {
  Typography, Box, Button, CircularProgress, Alert,
  ToggleButtonGroup, ToggleButton, Paper, Chip, AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemText, Divider, Avatar, Menu, MenuItem as MuiMenuItem, Select, TextField, InputAdornment
} from '@mui/material';
import { useTheme, styled } from '@mui/system';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import GroupIcon from '@mui/icons-material/Group';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BugReportIcon from '@mui/icons-material/BugReport';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import DeleteIcon from '@mui/icons-material/Delete'; // Import Delete icon

import IssueCard from '../components/IssueCard';
import IssueModal from '../components/IssueModal';
import InviteTeamMemberModal from '../components/InviteTeamMemberModal'
import TeamForm from './TeamForm';
import AllIssuesList from '../components/AllIssuesList';
import api from '../services/api';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAuth } from '../context/AuthContext';
import useDebounce from "../hooks/useDebounce"
import SearchIcon from '@mui/icons-material/Search';
import { Link, useNavigate } from 'react-router-dom';

const ItemTypes = {
    ISSUE: 'issue'
};

const ISSUE_STATUSES = ['OPEN', 'IN_PROGRESS', 'CLOSED'];

// Enhanced Modern Color Palette
const jiraColors = {
    sidebarBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Modern gradient
    sidebarText: '#ffffff',
    sidebarHover: 'rgba(255, 255, 255, 0.1)',
    headerBg: '#ffffff',
    headerText: '#2d3748',
    boardBg: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', // Subtle gradient background
    columnBg: '#ffffff',
    columnHeader: '#4a5568',
    cardBorder: '#e2e8f0',
    buttonPrimary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    buttonPrimaryHover: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
    buttonSecondary: '#f7fafc',
    buttonSecondaryHover: '#edf2f7',
    textDark: '#2d3748',
    textMuted: '#718096',
    chipBg: 'linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%)',
    chipText: '#2d3748',
    deleteRed: '#e53e3e',
    dropZoneHighlight: 'rgba(102, 126, 234, 0.1)',
    accent: '#38b2ac', // Teal accent color
    success: '#48bb78', // Green for success states
    warning: '#ed8936', // Orange for warnings
};

// Define sidebar widths
const expandedDrawerWidth = 240;
const collapsedDrawerWidth = 60;

const RootContainer = styled(Box)({
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    background: `
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%),
        ${jiraColors.boardBg}
    `,
    position: 'relative',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23667eea" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="1.5"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        animation: 'float 20s ease-in-out infinite',
        zIndex: 0,
    },
    '@keyframes float': {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-10px)' },
    },
});

const StyledAppBar = styled(AppBar)(({ theme, sidebaropen }) => ({
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    color: jiraColors.headerText,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
    zIndex: (theme.zIndex && theme.zIndex.drawer !== undefined) ? theme.zIndex.drawer + 1 : 1201,
    width: `calc(100% - ${sidebaropen ? expandedDrawerWidth : collapsedDrawerWidth}px)`,
    marginLeft: sidebaropen ? expandedDrawerWidth : collapsedDrawerWidth,
    transition: theme.transitions ? theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }) : 'none',
    [theme.breakpoints.down('md')]: {
        width: '100%',
        marginLeft: 0,
    },
}));

const MainContent = styled(Box)(({ theme, sidebaropen }) => ({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflowY: 'auto',
    paddingTop: theme.spacing ? theme.spacing(10) : '80px',
    paddingBottom: theme.spacing(3),
    marginLeft: sidebaropen ? expandedDrawerWidth : collapsedDrawerWidth,
    transition: theme.transitions ? theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }) : 'none',
    [theme.breakpoints.up('md')]: {
        paddingLeft: theme.spacing(4),
        paddingRight: theme.spacing(4),
    },
    [theme.breakpoints.down('md')]: {
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
        marginLeft: 0,
    }
}));

const StyledButton = styled(Button)(({ variant }) => ({
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 600,
    padding: '10px 20px',
    transition: 'all 0.3s ease-in-out',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    ...(variant === 'contained' && {
        background: jiraColors.buttonPrimary,
        color: 'white',
        '&:hover': {
            background: jiraColors.buttonPrimaryHover,
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
        },
    }),
    ...(variant === 'outlined' && {
        borderColor: jiraColors.cardBorder,
        color: jiraColors.headerText,
        backgroundColor: jiraColors.buttonSecondary,
        '&:hover': {
            backgroundColor: jiraColors.buttonSecondaryHover,
            borderColor: jiraColors.accent,
            transform: 'translateY(-1px)',
        },
    }),
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)({
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '4px',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
    border: '1px solid rgba(102, 126, 234, 0.1)',
    '& .MuiToggleButton-root': {
        textTransform: 'none',
        color: jiraColors.textMuted,
        borderColor: 'transparent',
        borderRadius: '12px',
        fontWeight: 600,
        fontSize: '0.9rem',
        padding: '8px 16px',
        margin: '2px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
            transition: 'left 0.5s ease-in-out',
        },
        '&.Mui-selected': {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            transform: 'scale(1.05)',
            '&::before': {
                left: '100%',
            },
            '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                transform: 'scale(1.08)',
            },
        },
        '&:hover': {
            background: 'rgba(102, 126, 234, 0.1)',
            transform: 'translateY(-2px)',
            '&::before': {
                left: '100%',
            },
        },
    },
});

const StyledKanbanColumnBox = styled(Box)(({ theme, isActive, canDrop }) => ({
    backgroundColor: jiraColors.columnBg,
    border: `1px solid ${jiraColors.cardBorder}`,
    borderRadius: '3px',
    padding: theme.spacing(2),
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    boxShadow: '0 1px 2px rgba(5, 5, 5, 0.05)',
    transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    ...(isActive && {
        backgroundColor: jiraColors.dropZoneHighlight, // Lighter background when active
        borderColor: jiraColors.buttonPrimary, // Blue border
        boxShadow: `0 0 0 2px ${jiraColors.buttonPrimary}, 0 4px 8px rgba(0,0,0,0.1)`, // Glow effect
    }),
    ...(canDrop && !isActive && {
        borderColor: jiraColors.buttonPrimary, // Indicate droppable even if not directly over
        boxShadow: `0 0 0 1px ${jiraColors.buttonPrimary}, 0 2px 4px rgba(0,0,0,0.08)`,
    }),
}));

const StyledColumnHeader = styled(Typography)({
    fontSize: '1rem', // Slightly larger font
    fontWeight: 700,
    color: jiraColors.columnHeader,
    textTransform: 'uppercase',
    marginBottom: '10px',
    paddingBottom: '5px',
    borderBottom: `1px solid ${jiraColors.cardBorder}`,
});


const Dashboard = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const theme = useTheme();
    const navigate = useNavigate();

    const [issues, setIssues] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openIssueModal, setOpenIssueModal] = useState(false);
    const [currentIssue, setCurrentIssue] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [openInviteModal, setOpenInviteModal] = useState(false);
    const [showTeamForm, setShowTeamForm] = useState(false);
    const [initialAssignedTeam, setInitialAssignedTeam] = useState(null);
    const [initialIssueStatus, setInitialIssueStatus] = useState('OPEN'); // New state for pre-setting status
    const [mobileOpen, setMobileOpen] = useState(false);
    const [viewMode, setViewMode] = useState('board');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const [isSearchLoading, setIsSearchLoading] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);



    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleCloseMenu();
        logout();
    };


    const fetchIssuesData = async (statusFilter = 'ALL', search = '') => {
        if (!search && loading) {
             setLoading(true);
        }
        // Only set search loading if there's actually a search query
        if (search) {
            setIsSearchLoading(true);
        }
        setError('');
        try {
            const params = {
                ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
                ...(search && { search })
            };

            // FIX: Removed the explicit client-side filtering for non-staff users.
            // The backend's IssueViewSet.get_queryset already handles filtering
            // based on the authenticated user (owner, assigned_to, or assigned_team).
            const response = await api.get('issues/', { params }); // Simply request issues

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
            // Only clear search loading if it was set
            if (search) {
                setIsSearchLoading(false);
            }
        }
    };

    const fetchIssues = useCallback((statusFilter, search) => {
        const fetchAll = viewMode === 'allIssues';
        fetchIssuesData(statusFilter, search, fetchAll);
    }, [user, loading, viewMode]);


    const fetchTeamsData = async () => {
        try {
            const response = await api.get('teams/');
            
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
        }
    };

    const fetchTeams = useCallback(fetchTeamsData, []);

    const handleDeleteTeam = async (teamId, teamName, teamOwnerId) => {
        if (user?.id !== teamOwnerId && !user?.is_staff) {
            setError("You do not have permission to delete this team. Only the team creator or an admin can delete a team.");
            return;
        }

        const confirmDelete = window.confirm(`Are you sure you want to delete the team "${teamName}"? This action cannot be undone.`);
        if (confirmDelete) {
            try {
                await api.delete(`teams/${teamId}/`);
                fetchTeams();
                setError('');
            } catch (err) {
                console.error('Failed to delete team:', err.response?.data || err.message);
                setError(`Failed to delete team: ${err.response?.data?.detail || err.message || 'Unknown error'}`);
            }
        }
    };


    useEffect(() => {
        if (isAuthenticated) {
            if (viewMode === 'allIssues') {
                fetchIssues('ALL', debouncedSearchQuery);
            } else {
                fetchIssues(filterStatus, debouncedSearchQuery);
            }
            fetchTeams();
            

           
        }
    }, [isAuthenticated, filterStatus, debouncedSearchQuery, fetchIssues, fetchTeams, viewMode]);

    const handleCreateIssue = () => {
        setCurrentIssue(null);
        setInitialAssignedTeam(null);
        setInitialIssueStatus('OPEN'); // Default to OPEN for general create
        setOpenIssueModal(true);
    };

    const handleCreateIssueForTeam = (team) => {
        setCurrentIssue(null);
        setInitialAssignedTeam(team);
        setInitialIssueStatus('OPEN'); // Default to OPEN when creating for team
        setOpenIssueModal(true);
    };

    // New handler for creating issue directly in a column
    const handleCreateIssueInColumn = (status) => {
        setCurrentIssue(null);
        setInitialAssignedTeam(null);
        setInitialIssueStatus(status); // Set initial status based on column
        setOpenIssueModal(true);
    };

    const handleEditIssue = (issue) => {
        setCurrentIssue(issue);
        setInitialAssignedTeam(null);
        setInitialIssueStatus(issue.status); // Set initial status from existing issue
        setOpenIssueModal(true);
    };

    const handleCloseIssueModal = () => {
        setOpenIssueModal(false);
        setCurrentIssue(null);
        setInitialAssignedTeam(null);
        setInitialIssueStatus('OPEN');
        if (viewMode === 'allIssues') {
            fetchIssues('ALL', debouncedSearchQuery);
        } else {
            fetchIssues(filterStatus, debouncedSearchQuery);
        }
    };

    const handleDeleteIssue = async (issueId) => {
        console.log(`Attempting to delete issue ${issueId}`);
        const confirmDelete = window.confirm("Are you sure you want to delete this issue?");
        if (confirmDelete) {
            try {
                await api.delete(`issues/${issueId}/`);
                if (viewMode === 'allIssues') {
                    fetchIssues('ALL', debouncedSearchQuery);
                } else {
                        fetchIssues(filterStatus, debouncedSearchQuery);
                }
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

  


        const updatedIssues = issues.map((issue) =>
            issue.id === id ? { ...issue, status: newStatus } : issue
        );
        setIssues(updatedIssues);

        try {
            await api.patch(`issues/${id}/`, { status: newStatus });
        } catch (err) {
            console.error('Failed to update issue status:', err.response?.data || err.message);
            setError('Failed to update issue status on server.');
            fetchIssues(filterStatus, debouncedSearchQuery);
        }
    }, [issues, user, fetchIssues, filterStatus, debouncedSearchQuery]);

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
                case 'OPEN': return '🔥 OPEN';
                case 'IN_PROGRESS': return '⚡ IN PROGRESS';
                case 'CLOSED': return '✅ CLOSED';
                default: return '❓ UNKNOWN';
            }
        };

        const getColumnGradient = (status) => {
            switch (status) {
                case 'OPEN': return 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
                case 'IN_PROGRESS': return 'linear-gradient(135deg, #feca57, #ff9ff3)';
                case 'CLOSED': return 'linear-gradient(135deg, #48dbfb, #0abde3)';
                default: return 'linear-gradient(135deg, #667eea, #764ba2)';
            }
        };

        const isActive = isOver && canDrop;
        return (
<StyledKanbanColumnBox
    ref={drop}
    isActive={isActive}
    canDrop={canDrop}
    sx={{
        flex: '1 1 300px',
        minWidth: { xs: '100%', sm: '280px', md: '300px' },
        maxWidth: { xs: '100%', sm: `calc(33.33% - ${theme.spacing(2)})` },
        boxSizing: 'border-box',
        background: canDrop ? 'linear-gradient(135deg, #f0f4ff 0%, #e6fffa 100%)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: isActive ? '2px solid #667eea' : '1px solid rgba(226, 232, 240, 0.8)',
        borderRadius: '16px',
        p: 2,
        boxShadow: canDrop ? '0 8px 25px rgba(102, 126, 234, 0.15)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
        },
        '&.is-active': {
            background: 'linear-gradient(135deg, #dcebff 0%, #e6fffa 100%)',
            transform: 'scale(1.02)',
        },
    }}
>
    {/* Column Header */}
    <StyledColumnHeader align="left" sx={{
        mb: 2,
        pb: 1,
        background: getColumnGradient(status),
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        borderRadius: '8px',
        p: 1,
        fontWeight: 800,
        fontSize: '1.1rem',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: getColumnGradient(status),
            borderRadius: '2px',
            animation: 'pulse 2s ease-in-out infinite',
        },
        '@keyframes pulse': {
            '0%, 100%': { opacity: 0.6 },
            '50%': { opacity: 1 },
        },
    }}>
        <span>{getColumnTitle(status)}</span>
        <Box sx={{
            background: getColumnGradient(status),
            borderRadius: '12px',
            px: 1.5,
            py: 0.5,
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'white',
            minWidth: '24px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
            {issues.length}
        </Box>
    </StyledColumnHeader>

    {/* Issues Container */}
    <Box sx={{
        flexGrow: 1,
        overflowY: 'auto',
        // Refined scrollbar styling
        '&::-webkit-scrollbar': {
            width: '6px',
        },
        '&::-webkit-scrollbar-track': {
            background: 'rgba(102, 126, 234, 0.1)',
            borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '10px',
            '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8, #6b46c1)',
            },
        },
    }}>
        {issues.length === 0 && !isActive ? (
            <Box
                sx={{
                    my: 2,
                    p: 3,
                    border: '2px dashed rgba(102, 126, 234, 0.3)',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                    position: 'relative',
                    '&::before': {
                        content: '"✨"',
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        fontSize: '1.2rem',
                        animation: 'sparkle 2s ease-in-out infinite',
                    },
                    '@keyframes sparkle': {
                        '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
                        '50%': { opacity: 1, transform: 'scale(1.2)' },
                    },
                }}
            >
                <Typography variant="body2" align="center" sx={{ fontStyle: 'italic', color: '#667eea', fontWeight: 500 }}>
                    🎯 No issues here. Drag and drop to add or click the button below.
                </Typography>
            </Box>
        ) : (
            issues.map((issue) => (
                <Box
                    key={issue.id}
                    sx={{
                        my: 1,
                        position: 'relative',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                            borderRadius: '12px',
                            opacity: 0,
                            transition: 'opacity 0.3s ease-in-out',
                            zIndex: -1,
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                            transform: 'translateY(-4px) scale(1.02)',
                            '&::before': {
                                opacity: 1,
                            },
                        },
                    }}
                >
                    <IssueCard
                        issue={issue}
                        onEdit={handleEditIssue}
                        onDelete={handleDeleteIssue}
                    />
                </Box>
            ))
        )}
    </Box>

    {/* Create Issue Button */}
    <Button
        variant="text"
        startIcon={<AddIcon />}
        onClick={() => handleCreateIssueInColumn(status)}
        sx={{
            mt: 2,
            textTransform: 'none',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            color: '#667eea',
            fontWeight: 600,
            fontSize: '0.9rem',
            borderRadius: '12px',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            '&:hover': {
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            },
            alignSelf: 'flex-start',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
    >
        ✨ Create issue
    </Button>
</StyledKanbanColumnBox>
        );
    };

    if (loading && !isSearchLoading) {
        return (
            <Box 
                display="flex" 
                flexDirection="column"
                justifyContent="center" 
                alignItems="center" 
                height="100vh" 
                sx={{ 
                    background: `
                        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
                        ${jiraColors.boardBg}
                    `,
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        width: '100px',
                        height: '100px',
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        borderRadius: '50%',
                        top: '20%',
                        left: '10%',
                        animation: 'float1 6s ease-in-out infinite',
                        opacity: 0.1,
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        width: '150px',
                        height: '150px',
                        background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                        borderRadius: '50%',
                        top: '60%',
                        right: '15%',
                        animation: 'float2 8s ease-in-out infinite',
                        opacity: 0.1,
                    },
                    '@keyframes float1': {
                        '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                        '50%': { transform: 'translateY(-20px) rotate(180deg)' },
                    },
                    '@keyframes float2': {
                        '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                        '50%': { transform: 'translateY(-30px) rotate(-180deg)' },
                    },
                }}
            >
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Typography 
                        variant="h4" 
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 800,
                            mb: 1,
                        }}
                    >
                        🎆 Loading Magic...
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#667eea', fontWeight: 500 }}>
                        Preparing your enchanted workspace
                    </Typography>
                </Box>
                <CircularProgress 
                    size={60} 
                    sx={{
                        color: '#667eea',
                        '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
                        },
                    }}
                />
            </Box>
        );
    }

    const issuesToDisplay = issues.filter(issue => {
        const matchesStatus = (filterStatus === 'ALL' || issue.status === filterStatus);
        const matchesSearch = (
            !debouncedSearchQuery ||
            issue.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            (issue.description && issue.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
        );
        return matchesStatus && matchesSearch;
    });


    const issuesGroupedByStatus = ISSUE_STATUSES.reduce((acc, status) => {
        acc[status] = Array.isArray(issuesToDisplay) ? issuesToDisplay.filter(issue => issue.status === status) : [];
        return acc;
    }, {});

    const drawerContent = (
        <Box sx={{
            width: sidebarOpen ? expandedDrawerWidth : collapsedDrawerWidth,
            overflowX: 'hidden',
            transition: theme.transitions ? theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }) : 'none',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
        }}>
            <Toolbar sx={{ 
                background: jiraColors.sidebarBg, 
                minHeight: '64px !important', 
                justifyContent: sidebarOpen ? 'space-between' : 'center', 
                pr: sidebarOpen ? 2 : 0,
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                {sidebarOpen && (
                    <Typography variant="h6" noWrap component="div" sx={{ color: 'white', fontWeight: 'bold' }}>
                        Issue Tracker
                    </Typography>
                )}
                <IconButton
                    color="inherit"
                    aria-label={sidebarOpen ? "collapse sidebar" : "expand sidebar"}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    sx={{
                        color: 'white',
                        ml: sidebarOpen ? 0 : 'auto',
                        transition: theme.transitions ? theme.transitions.create('margin', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }) : 'none',
                    }}
                >
                    {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
            </Toolbar>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
            <List sx={{ flexGrow: 1 }}>
    <ListItem
        button
        onClick={() => { setViewMode('board'); setMobileOpen(false); }}
        sx={{
            py: 1.5,
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            backgroundColor: viewMode === 'board' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
            borderLeft: viewMode === 'board' ? '4px solid #38b2ac' : 'none',
            borderRadius: '0 25px 25px 0',
            mx: 1,
            '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                transform: 'translateX(8px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
            borderRadius: '4px',
            '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderLeft: '3px solid #bcc4bcff',
            }
        }}
    >
        <DashboardIcon sx={{ color: 'rgba(255, 255, 255, 0.8)', mr: sidebarOpen ? 2 : 0 }} />
        {sidebarOpen && <ListItemText primary="Board" sx={{ color: 'rgba(255, 255, 255, 0.9)' }} />}
    </ListItem>

    <ListItem
        button
        onClick={() => { setViewMode('teams'); setMobileOpen(false); }}
        sx={{
            py: 1.5,
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            backgroundColor: viewMode === 'teams' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
            borderLeft: viewMode === 'teams' ? '3px solid #c7d3c7ff' : 'none',
            '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                transform: 'translateX(4px)',
                transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
            },
            borderRadius: '4px',
            '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderLeft: '3px solid #d8e7d9ff',
            }
        }}
    >
        <GroupIcon sx={{ color: 'rgba(255, 255, 255, 0.8)', mr: sidebarOpen ? 2 : 0 }} />
        {sidebarOpen && <ListItemText primary="Teams" sx={{ color: 'rgba(255, 255, 255, 0.9)' }} />}
    </ListItem>

    {user?.is_staff && (
        <ListItem
            button
            onClick={() => { setOpenInviteModal(true); setMobileOpen(false); }}
            sx={{
                py: 1.5,
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    transform: 'translateX(4px)',
                    transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
                },
                borderRadius: '4px',
            }}
        >
            <PersonAddIcon sx={{ color: 'rgba(255, 255, 255, 0.8)', mr: sidebarOpen ? 2 : 0 }} />
            {sidebarOpen && <ListItemText primary="Invite User" sx={{ color: 'rgba(255, 255, 255, 0.9)' }} />}
        </ListItem>
    )}

    <ListItem
        button
        onClick={() => { setViewMode('allIssues'); setMobileOpen(false); setFilterStatus('ALL'); setSearchQuery(''); }}
        sx={{
            py: 1.5,
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            backgroundColor: viewMode === 'allIssues' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
            borderLeft: viewMode === 'allIssues' ? '3px solid #e9f0eaff' : 'none',
            '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                transform: 'translateX(4px)',
                transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
            },
            borderRadius: '4px',
            '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderLeft: '3px solid #cbdfcbff',
            }
        }}
    >
        <BugReportIcon sx={{ color: 'rgba(255, 255, 255, 0.8)', mr: sidebarOpen ? 2 : 0 }} />
        {sidebarOpen && <ListItemText primary="All Issues" sx={{ color: 'rgba(255, 255, 255, 0.9)' }} />}
    </ListItem>
</List>
        </Box>
    );

    return (
        <DndProvider backend={HTML5Backend}>
            <RootContainer>
                {/* App Bar */}
                <StyledAppBar position="fixed" sidebaropen={sidebarOpen ? 1 : 0}>
                    <Toolbar sx={{ justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={() => setMobileOpen(!mobileOpen)}
                                sx={{ mr: 2, display: { md: 'none' }, color: jiraColors.headerText }}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Typography
                                variant="h6"
                                noWrap
                                component={Link}
                                to="/dashboard"
                                sx={{
                                    color: jiraColors.headerText,
                                    fontWeight: 'bold',
                                    mr: 2,
                                    textDecoration: 'none',
                                    '&:hover': {
                                        color: jiraColors.primaryBlue,
                                    },
                                }}
                            >
                                ISSUE-TRACKER
                            </Typography>
                           
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                           
                           
                                           

                          
                            {isAuthenticated && (
                                <Box>
                                    <IconButton
                                        size="large"
                                        aria-label="account of current user"
                                        aria-controls="menu-appbar"
                                        aria-haspopup="true"
                                        onClick={handleMenu}
                                        color="inherit"
                                        sx={{ color: jiraColors.headerText }}
                                    >
                                        <Avatar sx={{ bgcolor: jiraColors.sidebarBg, width: 32, height: 32, fontSize: '0.8rem' }}>
                                            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                        </Avatar>
                                    </IconButton>
                                    <Menu
                                        id="menu-appbar"
                                        anchorEl={anchorEl}
                                        anchorOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                        keepMounted
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                        open={Boolean(anchorEl)}
                                        onClose={handleCloseMenu}
                                    >
                                        <MuiMenuItem onClick={handleLogout}>Logout</MuiMenuItem>
                                    </Menu>
                                </Box>
                            )}
                        </Box>
                    </Toolbar>
                </StyledAppBar>

                {/* Permanent Sidebar for Desktop */}
                <Drawer
                    variant="permanent"
                    sx={{
                        width: sidebarOpen ? expandedDrawerWidth : collapsedDrawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: sidebarOpen ? expandedDrawerWidth : collapsedDrawerWidth,
                            boxSizing: 'border-box',
                            background: jiraColors.sidebarBg,
                            color: jiraColors.sidebarText,
                            borderRight: 'none',
                            boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)',
                            paddingTop: theme.spacing(8),
                            transition: theme.transitions ? theme.transitions.create('width', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }) : 'none',
                        },
                        display: { xs: 'none', md: 'block' },
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>

                {/* Temporary Sidebar for Mobile */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: expandedDrawerWidth,
                            boxSizing: 'border-box',
                            backgroundColor: jiraColors.sidebarBg,
                            color: jiraColors.sidebarText,
                            borderRight: 'none',
                            boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                            paddingTop: theme.spacing(8),
                        },
                        display: { xs: 'block', md: 'none' },
                    }}
                >
                    {drawerContent}
                </Drawer>

                <MainContent sidebaropen={sidebarOpen ? 1 : 0}>
                    {error && (
                        <Box sx={{ px: { xs: 3, md: 2 }, mb: 2 }}>
                            <Alert severity="error">{error}</Alert>
                        </Box>
                    )}

                    {viewMode === 'board' && (
                        <Box
                            sx={{
                                maxWidth: '1200px',
                                margin: '0 auto',
                                width: '100%',
                            }}
                        >
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 3,
                                px: { xs: 0, md: 0 },
                            }}>
                                <Typography 
                                    variant="h4" 
                                    component="h1" 
                                    sx={{ 
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontWeight: 800,
                                        letterSpacing: '-0.02em'
                                    }}
                                >
                                    🚀 Project Board
                                </Typography>
                                <StyledToggleButtonGroup
                                    style={{marginRight: "1.9%"}}
                                    value={filterStatus}
                                    exclusive
                                    onChange={handleStatusFilterChange}
                                    aria-label="issue status filter"
                                >
                                    <ToggleButton value="ALL">🌟 All</ToggleButton>
                                    <ToggleButton value="OPEN">🔥 Open</ToggleButton>
                                    <ToggleButton value="IN_PROGRESS">⚡ In Progress</ToggleButton>
                                    <ToggleButton value="CLOSED">✅ Closed</ToggleButton>
                                </StyledToggleButtonGroup>
                            </Box>

                            <Box sx={{ mb: 3, px: { xs: 0, md: 0 } }}>
                                <form onSubmit={(e) => e.preventDefault()}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        style={{width: "98.5%"}}
                                        placeholder="Search issues..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon sx={{ color: jiraColors.textMuted }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    {isSearchLoading && <CircularProgress size={20} />}
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            background: 'rgba(255, 255, 255, 0.9)',
                                            backdropFilter: 'blur(10px)',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: 'rgba(102, 126, 234, 0.2)',
                                                    borderWidth: '2px',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'rgba(102, 126, 234, 0.4)',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#667eea',
                                                    borderWidth: '2px',
                                                    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                                                },
                                            },
                                            '& .MuiInputBase-input': {
                                                padding: '12px 16px',
                                                fontSize: '1rem',
                                            }
                                        }}
                                    />
                                </form>
                            </Box>

                            <Box
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'nowrap',
                                    gap: theme.spacing(2),
                                    pb: 2,
                                    overflowX: 'auto',
                                    justifyContent: 'flex-start',
                                }}
                            >
                                {ISSUE_STATUSES.map((status) => (
                                    <KanbanColumn
                                        key={status}
                                        status={status}
                                        issues={issuesGroupedByStatus[status]}
                                        moveIssue={moveIssue}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {viewMode === 'teams' && (
                        <Box
                            sx={{
                                maxWidth: '1200px',
                                margin: '0 auto',
                                width: '100%',
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography 
                                    variant="h4" 
                                    gutterBottom 
                                    sx={{ 
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontWeight: 800,
                                        letterSpacing: '-0.02em'
                                    }}
                                >
                                    👥 Your Teams
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
                                    <TeamForm onTeamCreated={fetchTeams} /> {/* Pass fetchTeams to refresh after creation */}
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
                                                flex: '1 1 calc(33.33% - 16px)',
                                                minWidth: '280px',
                                                maxWidth: 'calc(33.33% - 16px)',
                                                boxSizing: 'border-box',
                                            }}
                                        >
                                            <Paper
                                                sx={{
                                                    p: 3,
                                                    background: 'rgba(255, 255, 255, 0.9)',
                                                    backdropFilter: 'blur(10px)',
                                                    border: '2px solid transparent',
                                                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), linear-gradient(135deg, #667eea, #764ba2)',
                                                    backgroundOrigin: 'border-box',
                                                    backgroundClip: 'content-box, border-box',
                                                    borderRadius: '16px',
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    '&::before': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: '-100%',
                                                        width: '100%',
                                                        height: '100%',
                                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                                        transition: 'left 0.5s',
                                                    },
                                                    '&:hover': { 
                                                        transform: 'translateY(-8px) scale(1.02)',
                                                        boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
                                                        '&::before': {
                                                            left: '100%',
                                                        },
                                                    },
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between',
                                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                }}
                                            >
                                                <Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <GroupIcon sx={{ color: jiraColors.textMuted, mr: 1 }} />
                                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: jiraColors.textDark }}>{team.name}</Typography>
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" mt={1}>Members:</Typography>
                                                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                        {(team.members ?? []).map((member, index) => (
                                                            <Chip
                                                                key={member.id || member}
                                                                label={typeof member === 'object' ? member.username : member}
                                                                size="small"
                                                                sx={{ 
                                                                    background: `linear-gradient(135deg, hsl(${index * 60}, 70%, 85%) 0%, hsl(${index * 60 + 30}, 70%, 75%) 100%)`,
                                                                    color: '#2d3748',
                                                                    fontWeight: 600,
                                                                    border: '1px solid rgba(255,255,255,0.3)',
                                                                    backdropFilter: 'blur(5px)',
                                                                    '&:hover': {
                                                                        transform: 'scale(1.05)',
                                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                                                    },
                                                                    transition: 'all 0.2s ease-in-out',
                                                                }}
                                                            />
                                                        ))}
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, gap: 1 }}>
                                                    <StyledButton size="small" variant="text" sx={{ flexGrow: 1, color: jiraColors.primaryBlue }} onClick={(e) => { e.stopPropagation(); handleCreateIssueForTeam(team); }}>
                                                        Assign Issue
                                                    </StyledButton>
                                                    {(user?.id === team.owner?.id || user?.is_staff) && (
                                                        <StyledButton
                                                            size="small"
                                                            variant="text"
                                                            color="error"
                                                            startIcon={<DeleteIcon />}
                                                            sx={{
                                                                flexGrow: 1,
                                                                color: jiraColors.deleteRed,
                                                                '&:hover': {
                                                                    backgroundColor: 'rgba(255, 77, 79, 0.1)',
                                                                },
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteTeam(team.id, team.name, team.owner?.id);
                                                            }}
                                                        >
                                                            Delete
                                                        </StyledButton>
                                                    )}
                                                </Box>
                                            </Paper>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    )}

                    {viewMode === 'allIssues' && (
                        <AllIssuesList
                            issues={issuesToDisplay}
                            loading={loading}
                            error={error}
                            onEdit={handleEditIssue}
                            onDelete={handleDeleteIssue}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            isSearchLoading={isSearchLoading}
                            filterStatus={filterStatus}
                            handleStatusFilterChange={handleStatusFilterChange}
                        />
                    )}
                </MainContent>
            </RootContainer>

            <IssueModal
                open={openIssueModal}
                handleClose={handleCloseIssueModal}
                issue={currentIssue}
                onSave={() => {
                    if (viewMode === 'allIssues') {
                        fetchIssues('ALL', debouncedSearchQuery);
                    } else {
                        fetchIssues(filterStatus, debouncedSearchQuery);
                    }
                }}
                initialAssignedTeam={initialAssignedTeam}
                initialIssueStatus={initialIssueStatus} // Pass the initial status
            />

            <InviteTeamMemberModal
                open={openInviteModal}
                handleClose={() => setOpenInviteModal(false)}
            />
        </DndProvider>
    );
};

export default Dashboard;
