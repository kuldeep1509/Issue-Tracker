import { Box, AppBar, Drawer, Button, ToggleButtonGroup, Typography } from '@mui/material';
import { styled } from '@mui/system';

export const jiraColors = {
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

export const drawerWidth = 240;

export const RootContainer = styled(Box)({
    display: 'flex',
    height: '100vh',
    overflow: 'hidden', // Prevent main scrollbar
    backgroundColor: jiraColors.boardBg,
});

export const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: jiraColors.headerBg,
    color: jiraColors.headerText,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: (theme.zIndex && theme.zIndex.drawer !== undefined) ? theme.zIndex.drawer + 1 : 1201,
    [theme.breakpoints.up('md')]: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
    },
}));

export const Sidebar = styled(Drawer)(({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
        width: drawerWidth,
        boxSizing: 'border-box',
        backgroundColor: jiraColors.sidebarBg,
        color: jiraColors.sidebarText,
        borderRight: 'none',
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
        paddingTop: theme.spacing ? theme.spacing(8) : '64px',
    },
}));

export const MainContent = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflowY: 'auto',
    paddingTop: theme.spacing ? theme.spacing(10) : '80px',
    paddingBottom: theme.spacing(3),
    // Center content horizontally
    alignItems: 'center', // This will center the direct children horizontally
    [theme.breakpoints.up('md')]: {
        marginLeft: drawerWidth,
        // Remove paddingLeft/Right here as the inner Box for content will handle it
    },
    [theme.breakpoints.down('md')]: {
        // Remove paddingLeft/Right here
    }
}));

export const StyledButton = styled(Button)(({ variant }) => ({
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

export const StyledToggleButtonGroup = styled(ToggleButtonGroup)({
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

export const StyledKanbanColumnBox = styled(Box)(({ theme, isActive, canDrop }) => ({
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

export const StyledColumnHeader = styled(Typography)({
    fontSize: '0.9rem',
    fontWeight: 700,
    color: jiraColors.columnHeader,
    textTransform: 'uppercase',
    marginBottom: '10px',
    paddingBottom: '5px',
    borderBottom: `1px solid ${jiraColors.cardBorder}`,
});