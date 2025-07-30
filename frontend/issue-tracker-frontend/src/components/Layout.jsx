// src/components/Layout.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { styled } from '@mui/system';

// --- Aqua Color Palette Definition (Keep consistent with LoginPage) ---
const aquaColors = {
    primary: '#00bcd4', // Cyan/Aqua primary color (Material Cyan 500)
    primaryLight: '#4dd0e1', // Lighter primary
    primaryDark: '#00838f', // Darker primary for hover
    backgroundLight: '#e0f7fa', // Very light aqua background (Material Cyan 50)
    backgroundMedium: '#b2ebf2', // Medium aqua for subtle accents
    textDark: '#263238', // Dark slate for primary text
    textMuted: '#546e7a', // Muted slate for secondary text
    white: '#ffffff',
};

// --- Styled Components for Layout ---

const StyledAppBar = styled(AppBar)({
    backgroundColor: aquaColors.primary, // AppBar background matches the primary aqua
    boxShadow: '0 4px 15px rgba(0, 188, 212, 0.25)', // Subtle shadow
});

const AppTitleLink = styled(Link)({
    textDecoration: 'none',
    color: aquaColors.white, // White text for the title
    fontWeight: 600,
    letterSpacing: '0.8px',
    '&:hover': {
        color: aquaColors.backgroundMedium, // Subtle highlight on hover
    }
});

const NavButton = styled(Button)({
    color: aquaColors.white, // White text for nav buttons
    fontWeight: 500,
    borderRadius: '4px', // Slightly rounded corners
    padding: '6px 16px',
    transition: 'background-color 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: aquaColors.primaryDark, // Darker aqua on hover
    },
    '& + &': { // Margin between buttons
        marginLeft: '8px',
    }
});

const WelcomeText = styled(Typography)({
    color: aquaColors.white, // White text for welcome message
    fontWeight: 400,
    marginRight: '16px', // Spacing before logout button
    whiteSpace: 'nowrap', // Prevent wrapping if username is long
    overflow: 'hidden',
    textOverflow: 'ellipsis', // Add ellipsis if text overflows
    maxWidth: '150px', // Limit width for long usernames
    '@media (max-width:600px)': {
        maxWidth: '100px', // Adjust for smaller screens
        marginRight: '8px',
    }
});

const MainContentBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4), // Increased padding for the main content area
    backgroundColor: aquaColors.backgroundLight, // Light aqua background for content area
    minHeight: 'calc(100vh - 64px)', // Adjust minHeight to fill viewport below AppBar
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2), // Less padding on small screens
        minHeight: 'calc(100vh - 56px)', // AppBar is shorter on small screens
    }
}));


const Layout = ({ children }) => {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate(); // Hook for navigation

    const handleLogout = () => {
        logout(); // This will also navigate to /login due to AuthContext
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <StyledAppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        <AppTitleLink to="/dashboard">
                            Issue Tracker
                        </AppTitleLink>
                    </Typography>
                    {isAuthenticated ? (
                        <>
                            <WelcomeText variant="body1">
                                Welcome, {user?.username || 'User'}!
                            </WelcomeText>
                            <NavButton color="inherit" onClick={handleLogout}>
                                Logout
                            </NavButton>
                        </>
                    ) : (
                        <>
                            <NavButton color="inherit" component={Link} to="/login">
                                Login
                            </NavButton>
                            <NavButton color="inherit" component={Link} to="/register">
                                Register
                            </NavButton>
                        </>
                    )}
                </Toolbar>
            </StyledAppBar>
            <MainContentBox component="main">
                {children}
            </MainContentBox>
        </Box>
    );
};

export default Layout;