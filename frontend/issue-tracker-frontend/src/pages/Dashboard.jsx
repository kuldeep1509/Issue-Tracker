import React, { useState, useEffect, useCallback } from 'react';
import {
    Container, Typography, Box, Button, CircularProgress, Alert,
    ToggleButtonGroup, ToggleButton, Paper, Chip, AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemText, Divider, Avatar, Menu, MenuItem as MuiMenuItem, Select, TextField, InputAdornment
} from '@mui/material';
import { useTheme, styled } from '@mui/system'; // Import useTheme and styled
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import GroupIcon from '@mui/icons-material/Group';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BugReportIcon from '@mui/icons-material/BugReport';
import SettingsIcon from '@mui/icons-material/Settings';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import IssueCard from '../components/IssueCard';
import IssueModal from '../components/IssueModal';
import InviteTeamMemberModal from '../components/InviteTeamMemberModal'
import TeamForm from './TeamForm';
import api from '../services/api';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAuth } from '../context/AuthContext';
import useDebounce from "../hooks/useDebounce"
import SearchIcon from '@mui/icons-material/Search';

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
};

// Styled components for Jira-like theme
const drawerWidth = 240;

const RootContainer = styled(Box)({
    display: 'flex',
    height: '100vh',
    overflow: 'hidden', // Prevent main scrollbar
    backgroundColor: jiraColors.boardBg,
});

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: jiraColors.headerBg,
    color: jiraColors.headerText,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: (theme.zIndex && theme.zIndex.drawer !== undefined) ? theme.zIndex.drawer + 1 : 1201,
    [theme.breakpoints.up('md')]: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
    },
}));

const MainContent = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflowY: 'auto',
    paddingTop: theme.spacing ? theme.spacing(10) : '80px',
    paddingBottom: theme.spacing(3),
    [theme.breakpoints.up('md')]: {
        marginLeft: drawerWidth,
        paddingLeft: theme.spacing(4), // Increased padding for better visual spacing from sidebar
        paddingRight: theme.spacing(4), // Increased padding
    },
    [theme.breakpoints.down('md')]: {
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
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
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    transition: 'background-color 0.2s ease-in-out',
    ...(isActive && {
        backgroundColor: jiraColors.boardBg,
    }),
    ...(canDrop && !isActive && {
        backgroundColor: jiraColors.boardBg,
    }),
}));

const StyledColumnHeader = styled(Typography)({
    fontSize: '0.9rem',
    fontWeight: 700,
    color: jiraColors.columnHeader,
    textTransform: 'uppercase',
    marginBottom: '10px',
    paddingBottom: '5px',
    borderBottom: `1px solid ${jiraColors.cardBorder}`,
});


const Dashboard = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const theme = useTheme(); // Use the theme hook

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
    const [mobileOpen, setMobileOpen] = useState(false);
    const [viewMode, setViewMode] = useState('board');

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
        setIsSearchLoading(true);
        setError('');
        try {
            const endpoint = user?.is_staff ? 'issues/' : 'issues/my_issues/';
            const params = {
                ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
                ...(search && { search })
            };

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
            setIsSearchLoading(false);
        }
    };

    const fetchIssues = useCallback(fetchIssuesData, [user, loading]);

    const fetchTeamsData = async () => {
        try {
            const response = await api.get('teams/');
            console.log("Teams fetched for dashboard:", response.data);
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


    useEffect(() => {
        if (isAuthenticated) {
            fetchIssues(filterStatus, debouncedSearchQuery);
            fetchTeams();
        }
    }, [isAuthenticated, filterStatus, debouncedSearchQuery, fetchIssues, fetchTeams]);

    const handleCreateIssue = () => {
        setCurrentIssue(null);
        setInitialAssignedTeam(null);
        setOpenIssueModal(true);
    };

    const handleCreateIssueForTeam = (team) => {
        setCurrentIssue(null);
        setInitialAssignedTeam(team);
        setOpenIssueModal(true);
    };

    const handleEditIssue = (issue) => {
        setCurrentIssue(issue);
        setInitialAssignedTeam(null);
        setOpenIssueModal(true);
    };

    const handleCloseIssueModal = () => {
        setOpenIssueModal(false);
        setCurrentIssue(null);
        setInitialAssignedTeam(null);
        fetchIssues(filterStatus, debouncedSearchQuery);
    };

    const handleDeleteIssue = async (issueId) => {
        console.log(`Attempting to delete issue ${issueId}`);
        const confirmDelete = window.confirm("Are you sure you want to delete this issue?");
        if (confirmDelete) {
            try {
                await api.delete(`issues/${issueId}/`);
                fetchIssues(filterStatus, debouncedSearchQuery);
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
                case 'OPEN': return 'TO DO';
                case 'IN_PROGRESS': return 'IN PROGRESS';
                case 'CLOSED': return 'DONE';
                default: return 'UNKNOWN';
            }
        };

        const isActive = isOver && canDrop;
        return (
            // Apply flex properties directly to the column box
            <StyledKanbanColumnBox
                ref={drop}
                isActive={isActive}
                canDrop={canDrop}
                sx={{
                    flex: '1 1 300px', // flex-grow, flex-shrink, flex-basis (base width for each column)
                    minWidth: { xs: '100%', sm: '280px', md: '300px' }, // Minimum width for responsiveness
                    maxWidth: { xs: '100%', sm: `calc(33.33% - ${theme.spacing(2)})` }, // Max width to ensure 3 columns fit with gap
                    boxSizing: 'border-box', // Include padding and border in width calculation
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

    const filteredByStatus = filterStatus === 'ALL'
        ? issues
        : issues.filter(issue => issue.status === filterStatus);

    const issuesToDisplay = filteredByStatus.filter(issue => {
        if (!debouncedSearchQuery) {
            return true;
        }
        const lowerCaseQuery = debouncedSearchQuery.toLowerCase();
        return (
            issue.title.toLowerCase().includes(lowerCaseQuery) ||
            (issue.description && issue.description.toLowerCase().includes(lowerCaseQuery))
        );
    });

    const issuesGroupedByStatus = ISSUE_STATUSES.reduce((acc, status) => {
        acc[status] = Array.isArray(issuesToDisplay) ? issuesToDisplay.filter(issue => issue.status === status) : [];
        return acc;
    }, {});

    const drawerContent = (
        <div>
            <Toolbar sx={{ backgroundColor: jiraColors.sidebarBg, minHeight: '64px !important', justifyContent: 'space-between' }}>
                <Typography variant="h6" noWrap component="div" sx={{ color: 'white', fontWeight: 'bold' }}>
                    Issue Tracker
                </Typography>
                <IconButton
                    color="inherit"
                    aria-label="close drawer"
                    onClick={() => setMobileOpen(false)}
                    sx={{ display: { md: 'none' } }}
                >
                    <ChevronLeftIcon />
                </IconButton>
            </Toolbar>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
            <List>
                <ListItem button onClick={() => { setViewMode('board'); setMobileOpen(false); }} sx={{ '&:hover': { backgroundColor: jiraColors.sidebarHover } }}>
                    <DashboardIcon sx={{ color: jiraColors.sidebarText, mr: 2 }} />
                    <ListItemText primary="Board" sx={{ color: jiraColors.sidebarText }} />
                </ListItem>
                <ListItem button onClick={() => { setViewMode('teams'); setMobileOpen(false); }} sx={{ '&:hover': { backgroundColor: jiraColors.sidebarHover } }}>
                    <GroupIcon sx={{ color: jiraColors.sidebarText, mr: 2 }} />
                    <ListItemText primary="Teams" sx={{ color: jiraColors.sidebarText }} />
                </ListItem>
                {user?.is_staff && (
                    <ListItem button onClick={() => { setOpenInviteModal(true); setMobileOpen(false); }} sx={{ '&:hover': { backgroundColor: jiraColors.sidebarHover } }}>
                        <PersonAddIcon sx={{ color: jiraColors.sidebarText, mr: 2 }} />
                        <ListItemText primary="Invite User" sx={{ color: jiraColors.sidebarText }} />
                    </ListItem>
                )}
                <ListItem button sx={{ '&:hover': { backgroundColor: jiraColors.sidebarHover } }}>
                    <BugReportIcon sx={{ color: jiraColors.sidebarText, mr: 2 }} />
                    <ListItemText primary="All Issues" sx={{ color: jiraColors.sidebarText }} />
                </ListItem>
                <ListItem button sx={{ '&:hover': { backgroundColor: jiraColors.sidebarText, mr: 2 }} }>
                    <SettingsIcon sx={{ color: jiraColors.sidebarText, mr: 2 }} />
                    <ListItemText primary="Settings" sx={{ color: jiraColors.sidebarText }} />
                </ListItem>
            </List>
        </div>
    );

    return (
        <DndProvider backend={HTML5Backend}>
            <RootContainer>
                {/* App Bar */}
                <StyledAppBar position="fixed">
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
                            <Typography variant="h6" noWrap component="div" sx={{ color: jiraColors.headerText, fontWeight: 'bold', mr: 2 }}>
                                My Project
                            </Typography>
                            {/* Placeholder for project selector */}
                            <Select
                                value="current"
                                sx={{
                                    '.MuiOutlinedInput-notchedOutline': { border: 'none' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                    color: jiraColors.textDark,
                                    fontWeight: 'bold',
                                    '.MuiSelect-icon': { color: jiraColors.textDark },
                                }}
                            >
                                <MuiMenuItem value="current">Current Project</MuiMenuItem>
                                <MuiMenuItem value="project1">Project Alpha</MuiMenuItem>
                                <MuiMenuItem value="project2">Project Beta</MuiMenuItem>
                            </Select>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StyledButton variant="contained" startIcon={<AddIcon />} onClick={handleCreateIssue}>
                                Create
                            </StyledButton>
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
                                        <MuiMenuItem onClick={handleCloseMenu}>Profile</MuiMenuItem>
                                        <MuiMenuItem onClick={handleCloseMenu}>My account</MuiMenuItem>
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
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            backgroundColor: jiraColors.sidebarBg,
                            color: jiraColors.sidebarText,
                            borderRight: 'none',
                            boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                            paddingTop: theme.spacing(8),
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
                            width: drawerWidth,
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

                <MainContent>
                    {/* Display error message locally */}
                    {error && (
                        <Box sx={{ px: { xs: 3, md: 2 }, mb: 2 }}>
                            <Alert severity="error">{error}</Alert>
                        </Box>
                    )}

                    {/* Main content area based on viewMode */}
                    {viewMode === 'board' && (
                        <Box>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 3,
                                px: { xs: 0, md: 0 },
                                 marginRight: 35
                            }}>
                                <Typography variant="h5" component="h1" sx={{ color: jiraColors.headerText, fontWeight: 'bold'  }}>
                                    Board
                                </Typography>
                                <StyledToggleButtonGroup
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

                            {/* Search Bar wrapped in a form to prevent reload */}
                            <Box sx={{ mb: 3, px: { xs: 0, md: 0 } ,marginRight: 35}}>
                                <form onSubmit={(e) => e.preventDefault()}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
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

                            {/* Kanban Board (now using flexbox) */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    
                                    gap: theme.spacing(2),
                                    pb: 2,
                                    margin: '0 auto',
                                    width: 1200,
                                    
                                   
                                    position: "absolute",
                                    marginLeft: -25,
                                    
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
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h5" gutterBottom sx={{ color: jiraColors.headerText, fontWeight: 'bold' }}>
                                    Your Teams
                                </Typography>
                                <StyledButton
                                    variant="contained"
                                    startIcon={<GroupAddIcon />}
                                    onClick={() => setShowTeamForm(!showTeamForm)}
                                    style={{marginRight: '17%'}}
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
                                    marginRight: 40
                                    
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
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing(2), mt: 2 , marginRight: 22 }}>
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
                    )}
                </MainContent>
            </RootContainer>

            <IssueModal
                open={openIssueModal}
                handleClose={handleCloseIssueModal}
                issue={currentIssue}
                onSave={() => fetchIssues(filterStatus, debouncedSearchQuery)}
                initialAssignedTeam={initialAssignedTeam}
            />

            <InviteTeamMemberModal
                open={openInviteModal}
                handleClose={() => setOpenInviteModal(false)}
            />
        </DndProvider>
    );
};

export default Dashboard;
