import  { useState, useEffect, useCallback } from 'react';
import {
  Typography, Box, Button, CircularProgress, Alert,
    ToggleButtonGroup, ToggleButton, Paper, Chip, AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemText, Divider, Avatar, Menu, MenuItem as MuiMenuItem, Select, TextField, InputAdornment, Badge // Import Badge for notification count
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

// Jira-like Color Palette
const jiraColors = {
    sidebarBg: '#0052cc', // Jira Blue
    sidebarText: '#deebff',
    sidebarHover: '#0065ff',
    headerBg: '#ffffff',
    headerText: '#172b4d',
    boardBg: '#f4f5f7', // Light grey for board background
    columnBg: '#ffffff',
    columnHeader: '#5e6c84', // Muted grey for column headers
    cardBorder: '#dfe1e6', // Light grey for card borders
    buttonPrimary: '#0052cc',
    buttonPrimaryHover: '#0065ff',
    buttonSecondary: '#e0e0e0',
    buttonSecondaryHover: '#c0c0c0',
    textDark: '#172b4d',
    textMuted: '#5e6c84',
    chipBg: '#e9f2ff', // Light blue for chips
    chipText: '#0052cc',
    deleteRed: '#ff4d4f', // A red for delete actions
    dropZoneHighlight: '#e0e0ff', // Light blue for drop zone highlight
};

// Define sidebar widths
const expandedDrawerWidth = 240;
const collapsedDrawerWidth = 60;

const RootContainer = styled(Box)({
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: jiraColors.boardBg,
});

const StyledAppBar = styled(AppBar)(({ theme, sidebaropen }) => ({
    backgroundColor: jiraColors.headerBg,
    color: jiraColors.headerText,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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

const StyledToggleButtonGroup = styled(ToggleButtonGroup)({
    backgroundColor: jiraColors.columnBg,
    borderRadius: '3px',
    '& .MuiToggleButton-root': {
        textTransform: 'none',
        color: jiraColors.textMuted,
        borderColor: jiraColors.cardBorder,
        '&.Mui-selected': {
            backgroundColor: jiraColors.sidebarBg,
            color: 'white',
            '&:hover': {
                backgroundColor: jiraColors.buttonPrimaryHover,
            },
        },
        '&:hover': {
            backgroundColor: jiraColors.boardBg,
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

    const handleNotificationClick = (event) => {
        setNotificationAnchorEl(event.currentTarget);
    };

    const handleNotificationClose = () => {
        setNotificationAnchorEl(null);
    };

    

    


    const fetchIssuesData = async (statusFilter = 'ALL', search = '') => {
        if (!search && loading) {
             setLoading(true);
        }
        setIsSearchLoading(true);
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
            setIsSearchLoading(false);
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
                case 'OPEN': return 'OPEN';
                case 'IN_PROGRESS': return 'IN PROGRESS';
                case 'CLOSED': return 'DONE';
                default: return 'UNKNOWN';
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
                }}
            >
                <StyledColumnHeader align="center">
                    {getColumnTitle(status)} ({issues.length})
                </StyledColumnHeader>
                {issues.length === 0 && !isActive ? (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
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
                 <Button
                    variant="text"
                    startIcon={<AddIcon />}
                    onClick={() => handleCreateIssueInColumn(status)}
                    sx={{
                        mt: 2,
                        textTransform: 'none',
                        color: jiraColors.textMuted,
                        '&:hover': {
                            backgroundColor: jiraColors.boardBg,
                            color: jiraColors.textDark,
                        },
                    }}
                >
                    Create issue
                </Button>
            </StyledKanbanColumnBox>
        );
    };

    if (loading && !isSearchLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh" sx={{ backgroundColor: jiraColors.boardBg }}>
                <CircularProgress />
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
            <Toolbar sx={{ backgroundColor: jiraColors.sidebarBg, minHeight: '64px !important', justifyContent: sidebarOpen ? 'space-between' : 'center', pr: sidebarOpen ? 2 : 0 }}>
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
                <ListItem button onClick={() => { setViewMode('board'); setMobileOpen(false); }} sx={{ '&:hover': { backgroundColor: jiraColors.sidebarHover }, justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
                    <DashboardIcon sx={{ color: jiraColors.sidebarText, mr: sidebarOpen ? 2 : 0 }} />
                    {sidebarOpen && <ListItemText primary="Board" sx={{ color: jiraColors.sidebarText }} />}
                </ListItem>
                <ListItem button onClick={() => { setViewMode('teams'); setMobileOpen(false); }} sx={{ '&:hover': { backgroundColor: jiraColors.sidebarHover }, justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
                    <GroupIcon sx={{ color: jiraColors.sidebarText, mr: sidebarOpen ? 2 : 0 }} />
                    {sidebarOpen && <ListItemText primary="Teams" sx={{ color: jiraColors.sidebarText }} />}
                </ListItem>
                {user?.is_staff && (
                    <ListItem button onClick={() => { setOpenInviteModal(true); setMobileOpen(false); }} sx={{ '&:hover': { backgroundColor: jiraColors.sidebarHover }, justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
                        <PersonAddIcon sx={{ color: jiraColors.sidebarText, mr: sidebarOpen ? 2 : 0 }} />
                        {sidebarOpen && <ListItemText primary="Invite User" sx={{ color: jiraColors.sidebarText }} />}
                    </ListItem>
                )}
                <ListItem button onClick={() => { setViewMode('allIssues'); setMobileOpen(false); setFilterStatus('ALL'); setSearchQuery(''); }} sx={{ '&:hover': { backgroundColor: jiraColors.sidebarHover }, justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
                    <BugReportIcon sx={{ color: jiraColors.sidebarText, mr: sidebarOpen ? 2 : 0 }} />
                    {sidebarOpen && <ListItemText primary="All Issues" sx={{ color: jiraColors.sidebarText }} />}
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
                            backgroundColor: jiraColors.sidebarBg,
                            color: jiraColors.sidebarText,
                            borderRight: 'none',
                            boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
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
                                <Typography variant="h5" component="h1" sx={{ color: jiraColors.headerText, fontWeight: 'bold' }}>
                                    Board
                                </Typography>
                                <StyledToggleButtonGroup
                                    style={{marginRight: "1.9%"}}
                                    value={filterStatus}
                                    exclusive
                                    onChange={handleStatusFilterChange}
                                    aria-label="issue status filter"
                                >
                                    <ToggleButton value="ALL">All</ToggleButton>
                                    {ISSUE_STATUSES.map(status => (
                                        <ToggleButton key={status} value={status}>
                                            {status.replace('_', ' ')}
                                        </ToggleButton>
                                    ))}
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
                                            backgroundColor: jiraColors.columnBg,
                                            borderRadius: '3px',
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: jiraColors.cardBorder,
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: jiraColors.textMuted,
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: jiraColors.buttonPrimary,
                                                    borderWidth: '1px',
                                                },
                                            },
                                            '& .MuiInputBase-input': {
                                                padding: '10px 14px',
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
                                                    p: 2,
                                                    border: `1px solid ${jiraColors.cardBorder}`,
                                                    borderRadius: '3px',
                                                    cursor: 'pointer',
                                                    '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }, // More pronounced hover shadow
                                                    backgroundColor: jiraColors.columnBg,
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between',
                                                }}
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
