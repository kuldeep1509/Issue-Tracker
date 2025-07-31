import React from 'react';
import {
    Toolbar, Typography, IconButton, List, ListItem, ListItemText, Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu'; // Keep for consistency if needed, though ChevronLeftIcon is used
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BugReportIcon from '@mui/icons-material/BugReport';
import SettingsIcon from '@mui/icons-material/Settings';
import { Sidebar, jiraColors } from '../styles/jiraTheme';

const DashboardSidebar = ({ user, mobileOpen, setMobileOpen, setViewMode, setOpenInviteModal }) => {
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
                <ListItem button sx={{ '&:hover': { backgroundColor: jiraColors.sidebarHover } }}>
                    <SettingsIcon sx={{ color: jiraColors.sidebarText, mr: 2 }} />
                    <ListItemText primary="Settings" sx={{ color: jiraColors.sidebarText }} />
                </ListItem>
            </List>
        </div>
    );

    return (
        <>
            {/* Permanent Sidebar for Desktop */}
            <Sidebar
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                }}
                open
            >
                {drawerContent}
            </Sidebar>

            {/* Temporary Sidebar for Mobile */}
            <Sidebar
                variant="temporary"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                }}
            >
                {drawerContent}
            </Sidebar>
        </>
    );
};

export default DashboardSidebar;