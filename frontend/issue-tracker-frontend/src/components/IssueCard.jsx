import React, { useState } from 'react';
import { Card, CardContent, Typography, Chip, IconButton, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDrag } from 'react-dnd';
import { useAuth } from '../context/AuthContext';
import { styled } from '@mui/system';

const ItemTypes = {
    ISSUE: 'issue'
};

const jiraColors = {
    primaryBlue: '#0052cc',
    primaryBlueDark: '#0065ff',
    backgroundLight: '#f7f7f7',
    backgroundMedium: '#e0e0e0',
    textDark: '#212121',
    textMuted: '#757575',
    white: '#ffffff',
    shadow: 'rgba(0, 0, 0, 0.08)',
    errorRed: '#d32f2f',
    chipBgOpen: '#e1f5fe',
    chipTextOpen: '#1976d2',
    chipBgInProgress: '#fff9c4',
    chipTextInProgress: '#f57c00',
    chipBgClosed: '#e8f5e9',
    chipTextClosed: '#388e3c',
    iconHoverBg: 'rgba(0, 0, 0, 0.04)',
    deleteHoverBg: 'rgba(211, 47, 47, 0.08)',
};

const StyledIssueCard = styled(Card)(({ isdragging }) => ({
    width: '100%',
    marginBottom: '12px',
    opacity: isdragging ? 0.6 : 1,
    cursor: 'grab',
    backgroundColor: jiraColors.white,
    borderRadius: '8px',
    boxShadow: `0 2px 6px ${jiraColors.shadow}`,
    border: `1px solid ${jiraColors.backgroundMedium}`,
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: `0 6px 12px ${jiraColors.shadow}`,
        cursor: 'pointer',
    },
    '&:active': {
        cursor: 'grabbing',
    }
}));

const StyledCardContent = styled(CardContent)({
    padding: '16px',
    '&:last-child': {
        paddingBottom: '16px',
    },
});

const IssueTitle = styled(Typography)({
    fontWeight: 600,
    color: jiraColors.textDark,
    lineHeight: 1.3,
    wordBreak: 'break-word',
    fontSize: '1.1rem',
});

const IssueDescription = styled(Typography)({
    marginTop: '8px',
    color: jiraColors.textMuted,
    fontSize: '0.9rem',
    lineHeight: 1.6,
    maxHeight: '4.8em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
});

const IssueMetaText = styled(Typography)({
    marginTop: '16px',
    fontSize: '0.8rem',
    color: jiraColors.textMuted,
    opacity: 0.9,
    borderTop: `1px solid ${jiraColors.backgroundMedium}`,
    paddingTop: '8px',
});

const StyledChip = styled(Chip)(({ labelcolor }) => ({
    fontWeight: 500,
    fontSize: '0.75rem',
    height: '22px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    padding: '0 8px',
    '& .MuiChip-label': {
        paddingLeft: '6px',
        paddingRight: '6px',
    },
    ...(labelcolor === 'open' && {
        backgroundColor: jiraColors.chipBgOpen,
        color: jiraColors.chipTextOpen,
    }),
    ...(labelcolor === 'in_progress' && {
        backgroundColor: jiraColors.chipBgInProgress,
        color: jiraColors.chipTextInProgress,
    }),
    ...(labelcolor === 'closed' && {
        backgroundColor: jiraColors.chipBgClosed,
        color: jiraColors.chipTextClosed,
    }),
    ...(labelcolor === 'default' && {
        backgroundColor: jiraColors.backgroundMedium,
        color: jiraColors.textMuted,
    }),
}));

const ActionIconButton = styled(IconButton)(({ actiontype }) => ({
    color: jiraColors.textMuted,
    padding: '8px',
    '&:hover': {
        backgroundColor: actiontype === 'delete' ? jiraColors.deleteHoverBg : jiraColors.iconHoverBg,
        color: actiontype === 'delete' ? jiraColors.errorRed : jiraColors.textDark,
        transform: 'scale(1.05)',
    },
}));

const IssueCard = ({ issue, onEdit, onDelete }) => {
    const { user } = useAuth();
    const canManageIssue = user && (issue.owner?.id === user.id || user.is_staff);

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'open';
            case 'IN_PROGRESS': return 'in_progress';
            case 'CLOSED': return 'closed';
            default: return 'default';
        }
    };

    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.ISSUE,
        item: { id: issue.id, currentStatus: issue.status },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <>
            <StyledIssueCard ref={drag} isdragging={isDragging ? 1 : 0} onClick={handleOpen} sx={{ cursor: 'pointer' }}>
                <StyledCardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <IssueTitle variant="h6" component="div" sx={{ flexGrow: 1, pr: 1 }}>
                            {issue.title}
                        </IssueTitle>
                        <StyledChip label={issue.status.replace('_', ' ')} labelcolor={getStatusColor(issue.status)} />
                    </Box>
                    {issue.description && (
                        <IssueDescription variant="body2">
                            {issue.description.substring(0, 150)}{issue.description.length > 150 ? '...' : ''}
                        </IssueDescription>
                    )}
                    <IssueMetaText variant="caption" display="block">
                        Owner: {issue.owner?.username || 'N/A'}
                        {issue.assigned_to && (
                            <> | Assigned to: {issue.assigned_to?.username || 'N/A'}</>
                        )}
                        {!issue.assigned_to && issue.assigned_team && (
                            <> | Team: {issue.assigned_team?.name || 'N/A'}</>
                        )}
                    </IssueMetaText>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 0.5 }}>
                        {canManageIssue && (
                            <>
                                <ActionIconButton
                                    aria-label="edit"
                                    size="small"
                                    onClick={e => { e.stopPropagation(); onEdit(issue); }}
                                    actiontype="edit"
                                >
                                    <EditIcon fontSize="small" />
                                </ActionIconButton>
                                <ActionIconButton
                                    aria-label="delete"
                                    size="small"
                                    onClick={e => { e.stopPropagation(); onDelete(issue.id); }}
                                    actiontype="delete"
                                >
                                    <DeleteIcon fontSize="small" />
                                </ActionIconButton>
                            </>
                        )}
                    </Box>
                </StyledCardContent>
            </StyledIssueCard>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{issue.title}</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Status: <b>{issue.status.replace('_', ' ')}</b>
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        {issue.description || 'No description.'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Owner: {issue.owner?.username || 'N/A'}
                    </Typography>
                    {issue.assigned_to && (
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Assigned to: {issue.assigned_to?.username || 'N/A'}
                        </Typography>
                    )}
                    {issue.assigned_team && (
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Team: {issue.assigned_team?.name || 'N/A'}
                        </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Created: {issue.created_at ? new Date(issue.created_at).toLocaleString() : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Updated: {issue.updated_at ? new Date(issue.updated_at).toLocaleString() : 'N/A'}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" sx={{ textTransform: 'none' }}>Close</Button>
                    {canManageIssue && (
                        <Button onClick={() => { onEdit(issue); handleClose(); }} color="primary" variant="contained" sx={{ textTransform: 'none' }}>
                            Edit
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
};

export default IssueCard;
