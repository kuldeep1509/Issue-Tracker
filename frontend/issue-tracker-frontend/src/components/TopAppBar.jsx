import React from 'react';
import {
    AppBar, Toolbar, IconButton, Box, Typography, Button, Avatar, Menu, Select, MenuItem as MuiMenuItem
} from '@mui/material';
import { styled } from '@mui/system';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import AccountCircle from '@mui/icons-material/AccountCircle';

// Import jiraColors from the main Dashboard file
import { jiraColors } from '../pages/Dashboard';

// Styled components for TopAppBar
const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: jiraColors.headerBg,
    color: jiraColors.headerText,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: (theme.zIndex && theme.zIndex.drawer !== undefined) ? theme.zIndex.drawer + 1 : 1201,
    [theme.breakpoints.up('md')]: {
        width: `calc(100% - ${240}px)`, // Use drawerWidth directly if it's a constant
        marginLeft: 240,
    },
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
}));

const TopAppBar = ({ user, isAuthenticated, handleCreateIssue, handleMenu, handleCloseMenu, handleLogout, anchorEl }) => {
    return (
        <StyledAppBar position="fixed">
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        // This IconButton is typically for opening the mobile drawer, so it should be handled by Dashboard
                        // onClick={() => setMobileOpen(!mobileOpen)} // This prop needs to be passed if used directly here
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
    );
};

export default TopAppBar;
