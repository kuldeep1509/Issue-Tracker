import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { styled } from '@mui/system';

// --- Enhanced Magical Color Palette ---
const jiraColors = {
    primaryBlue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    primaryBlueDark: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
    backgroundLight: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    backgroundMedium: 'rgba(102, 126, 234, 0.1)',
    textDark: '#2d3748',
    textMuted: '#718096',
    white: 'rgba(255, 255, 255, 0.95)',
    shadow: 'rgba(102, 126, 234, 0.15)',
    errorRed: '#e53e3e',
    accent: '#38b2ac',
};

// --- Styled Components for Layout ---

const StyledAppBar = styled(AppBar)({
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    color: jiraColors.textDark,
    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)',
    borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.05), transparent)',
        animation: 'shimmer 3s ease-in-out infinite',
    },
    '@keyframes shimmer': {
        '0%': { left: '-100%' },
        '100%': { left: '100%' },
    },
});

const AppTitleLink = styled(Link)({
    textDecoration: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 800,
    letterSpacing: '0.5px',
    fontSize: '1.5rem',
    position: 'relative',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&::before': {
        content: '"🎆"',
        position: 'absolute',
        left: '-30px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '1.2rem',
        opacity: 0,
        transition: 'all 0.3s ease-in-out',
    },
    '&:hover': {
        transform: 'scale(1.05)',
        '&::before': {
            opacity: 1,
            left: '-35px',
        },
    },
});

const NavButton = styled(Button)({
    color: jiraColors.textDark,
    fontWeight: 600,
    borderRadius: '12px',
    padding: '8px 20px',
    textTransform: 'none',
    position: 'relative',
    overflow: 'hidden',
    background: 'rgba(102, 126, 234, 0.05)',
    border: '1px solid rgba(102, 126, 234, 0.1)',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '0',
        height: '0',
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.2) 0%, transparent 70%)',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        transition: 'width 0.3s ease-in-out, height 0.3s ease-in-out',
    },
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        background: 'rgba(102, 126, 234, 0.1)',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
        '&::before': {
            width: '100px',
            height: '100px',
        },
    },
    '& + &': {
        marginLeft: '12px',
    },
});

const WelcomeText = styled(Typography)({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 600,
    marginRight: '20px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '200px',
    position: 'relative',
    '&::before': {
        content: '"👋"',
        position: 'absolute',
        left: '-25px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '1rem',
        animation: 'wave 2s ease-in-out infinite',
    },
    '@keyframes wave': {
        '0%, 100%': { transform: 'translateY(-50%) rotate(0deg)' },
        '25%': { transform: 'translateY(-50%) rotate(20deg)' },
        '75%': { transform: 'translateY(-50%) rotate(-20deg)' },
    },
    '@media (max-width:600px)': {
        maxWidth: '120px',
        marginRight: '12px',
        '&::before': {
            left: '-20px',
        },
    },
});

const MainContentBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4),
    background: `
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%),
        ${jiraColors.backgroundLight}
    `,
    flexGrow: 1,
    overflowY: 'hidden',
    position: 'relative',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23667eea" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="1.5"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        animation: 'float 20s ease-in-out infinite',
        zIndex: 0,
    },
    '& > *': {
        position: 'relative',
        zIndex: 1,
    },
    '@keyframes float': {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-10px)' },
    },
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2),
    },
}));


const Layout = ({ children }) => {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate(); // Hook for navigation

    const handleLogout = () => {
        logout(); // This will also navigate to /login due to AuthContext
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'conic-gradient(from 0deg, transparent, rgba(102, 126, 234, 0.03), transparent)',
                animation: 'rotate 30s linear infinite',
                zIndex: 0,
            },
            '@keyframes rotate': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
            },
            '& > *': {
                position: 'relative',
                zIndex: 1,
            },
        }}> {/* Magical root container */}
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
