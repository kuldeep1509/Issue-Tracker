import React from 'react';
import {
    Toolbar, IconButton, Typography, Box, Select, MenuItem as MuiMenuItem, Avatar, Menu
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import { StyledAppBar, StyledButton, jiraColors } from '../styles/jiraTheme';

const DashboardHeader = ({ user, mobileOpen, setMobileOpen, handleCreateIssue, handleLogout, anchorEl, handleMenu, handleCloseMenu }) => {
    return (
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
                    {user && (
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

export default DashboardHeader;