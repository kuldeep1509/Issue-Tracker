import React from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    TextField,
    InputAdornment,
    ToggleButtonGroup,
    ToggleButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import IssueCard from './IssueCard';
import { useTheme } from '@mui/system';

const ISSUE_STATUSES = ['OPEN', 'IN_PROGRESS', 'CLOSED'];

// Jira-like Color Palette (consistent with Dashboard)
const jiraColors = {
    headerText: '#172b4d',
    boardBg: '#f4f5f7',
    columnBg: '#ffffff',
    cardBorder: '#dfe1e6',
    buttonPrimary: '#0052cc',
    textMuted: '#5e6c84',
    sidebarBg: '#0052cc', // For toggle button selected state
    buttonPrimaryHover: '#0065ff', // For toggle button hover
};

const AllIssuesList = ({
    issues,
    loading,
    error,
    onEdit,
    onDelete,
    searchQuery,
    setSearchQuery,
    isSearchLoading,
    filterStatus,
    handleStatusFilterChange
}) => {
    const theme = useTheme();

    if (loading && !isSearchLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%" sx={{ backgroundColor: jiraColors.boardBg }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                maxWidth: '1200px', // Set a max width for the entire content block
                margin: '0 auto', // Center the content horizontally
                width: '100%', // Ensure it takes full width up to maxWidth
            }}
        >
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                flexWrap: 'wrap', // Allow wrapping on smaller screens
                gap: theme.spacing(2), // Space between items when wrapped
            }}>
                <Typography variant="h5" component="h1" sx={{ color: jiraColors.headerText, fontWeight: 'bold' }}>
                    All Issues
                </Typography>
                <ToggleButtonGroup
                    value={filterStatus}
                    exclusive
                    onChange={handleStatusFilterChange}
                    aria-label="issue status filter"
                    sx={{
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
                    }}
                >
                    <ToggleButton value="ALL">All</ToggleButton>
                    {ISSUE_STATUSES.map(status => (
                        <ToggleButton key={status} value={status}>
                            {status.replace('_', ' ')}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '3px', fontSize: '0.875rem' }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ mb: 3 }}>
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

            {issues.length === 0 && !loading && !error ? (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
                    No issues found matching your criteria.
                </Typography>
            ) : (
                <Box sx={{ display: 'grid', gap: theme.spacing(2),
                    gridTemplateColumns: {
                        xs: '1fr', 
                        sm: 'repeat(auto-fill, minmax(280px, 1fr))', 
                        md: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    },
                }}>
                    {issues.map((issue) => (
                        <IssueCard
                            key={issue.id}
                            issue={issue}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default AllIssuesList;
