import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { styled } from '@mui/system';

// --- Jira-like Color Palette Definition (Consistent with LoginPage) ---
const jiraColors = {
    primaryBlue: '#0052cc', // Jira's main blue for buttons, links, focus
    primaryBlueDark: '#0065ff', // Darker blue for hover
    backgroundLight: '#f4f5f7', // Light grey background, similar to Jira's board
    backgroundMedium: '#dfe1e6', // Slightly darker grey for borders/subtle elements
    textDark: '#172b4d', // Dark text for headings and primary content
    textMuted: '#5e6c84', // Muted grey for secondary text
    white: '#ffffff',
    shadow: 'rgba(0, 0, 0, 0.1)', // Subtle shadow
    errorRed: '#de350b', // Jira's error red (though not used directly in this layout)
};

// --- Styled Components for Layout ---

const StyledAppBar = styled(AppBar)({
    backgroundColor: jiraColors.white, // AppBar background is white like Jira's header
    color: jiraColors.textDark, // Text color is dark like Jira's header
    boxShadow: `0 2px 4px ${jiraColors.shadow}`, // Subtle shadow
    borderBottom: `1px solid ${jiraColors.backgroundMedium}`, // Light border at the bottom
});

const AppTitleLink = styled(Link)({
    textDecoration: 'none',
    color: jiraColors.textDark, // Dark text for the title
    fontWeight: 700, // Bolder title
    letterSpacing: '0.5px',
    fontSize: '1.25rem', // Slightly larger font size
    '&:hover': {
        color: jiraColors.primaryBlue, // Primary blue on hover
    }
});

const NavButton = styled(Button)({
    color: jiraColors.textDark, // Dark text for nav buttons
    fontWeight: 600,
    borderRadius: '3px', // Slightly rounded corners
    padding: '6px 16px',
    textTransform: 'none', // Jira buttons are not all caps
    transition: 'background-color 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: jiraColors.backgroundMedium, // Light grey on hover
    },
    '& + &': { // Margin between buttons
        marginLeft: '8px',
    }
});

const WelcomeText = styled(Typography)({
    color: jiraColors.textDark, // Dark text for welcome message
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
    backgroundColor: jiraColors.backgroundLight, // Light grey background for content area
    flexGrow: 1, // Allow it to take up remaining vertical space
    overflowY: 'auto', // Add vertical scrolling if content overflows
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2), // Less padding on small screens
    }
}));


const Layout = ({ children }) => {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate(); // Hook for navigation

    const handleLogout = () => {
        logout(); // This will also navigate to /login due to AuthContext
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh'}}> {/* Ensure the root Box takes full viewport height and is a flex container */}
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
                        <></>
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
