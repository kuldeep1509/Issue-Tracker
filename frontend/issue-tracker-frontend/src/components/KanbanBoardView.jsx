import React from 'react';
import {
    Box, Typography, ToggleButtonGroup, ToggleButton, TextField, InputAdornment, CircularProgress, Paper, Chip
} from '@mui/material';
import { useTheme, styled } from '@mui/system';
import SearchIcon from '@mui/icons-material/Search';
import IssueCard from './IssueCard'; // Assuming IssueCard is in the same components folder
import { DndProvider, useDrop } from 'react-dnd'; // DndProvider should wrap the whole app, but useDrop is needed here
import { HTML5Backend } from 'react-dnd-html5-backend'; // Needed for useDrop

// Import jiraColors from the main Dashboard file
import { jiraColors } from '../styles/jiraTheme';

const ItemTypes = {
    ISSUE: 'issue'
};

// Moved from Dashboard.jsx as it's specific to Kanban
const ISSUE_STATUSES = ['OPEN', 'IN_PROGRESS', 'CLOSED'];

// Styled components specific to KanbanBoardView
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


const KanbanColumn = ({ status, issues, moveIssue, handleEditIssue, handleDeleteIssue }) => {
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

    const theme = useTheme(); // Access theme for spacing

    const isActive = isOver && canDrop;
    return (
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


const KanbanBoardView = ({
    issuesGroupedByStatus,
    moveIssue,
    handleEditIssue,
    handleDeleteIssue,
    filterStatus,
    handleStatusFilterChange,
    searchQuery,
    setSearchQuery,
    isSearchLoading,
    ISSUE_STATUSES // Passed as prop now
}) => {
    const theme = useTheme(); // Use theme for spacing

    return (
        <Box>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
            }}>
                <Typography variant="h5" component="h1" sx={{ color: jiraColors.headerText, fontWeight: 'bold' }}>
                    Kanban Board
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
                        handleEditIssue={handleEditIssue}
                        handleDeleteIssue={handleDeleteIssue}
                    />
                ))}
            </Box>
        </Box>
    );
};

export default KanbanBoardView;
