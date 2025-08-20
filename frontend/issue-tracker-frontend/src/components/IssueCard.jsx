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
    chipBgOpen: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
    chipTextOpen: '#ffffff',
    chipBgInProgress: 'linear-gradient(135deg, #feca57, #ff9ff3)',
    chipTextInProgress: '#ffffff',
    chipBgClosed: 'linear-gradient(135deg, #48dbfb, #0abde3)',
    chipTextClosed: '#ffffff',
    iconHoverBg: 'rgba(102, 126, 234, 0.1)',
    deleteHoverBg: 'rgba(255, 107, 107, 0.15)',
};

const StyledIssueCard = styled(Card)(({ isdragging }) => ({
    width: '100%',
    marginBottom: '12px',
    opacity: isdragging ? 0.6 : 1,
    cursor: 'grab',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(102, 126, 234, 0.1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent)',
        transition: 'left 0.6s ease-in-out',
    },
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        transform: 'translateY(-6px) scale(1.02)',
        boxShadow: '0 12px 30px rgba(102, 126, 234, 0.2)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        cursor: 'pointer',
        '&::before': {
            left: '100%',
        },
    },
    '&:active': {
        cursor: 'grabbing',
        transform: 'scale(0.98)',
    }
}));

const StyledCardContent = styled(CardContent)({
    padding: '16px',
    '&:last-child': {
        paddingBottom: '16px',
    },
});

const IssueTitle = styled(Typography)({
    fontWeight: 700,
    background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: 1.3,
    wordBreak: 'break-word',
    fontSize: '1.1rem',
    position: 'relative',
    '&::after': {
        content: '"✨"',
        position: 'absolute',
        right: '-20px',
        top: '0',
        fontSize: '0.8rem',
        opacity: 0,
        transition: 'opacity 0.3s ease-in-out',
    },
    '&:hover::after': {
        opacity: 1,
    },
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
    background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, transparent 100%)',
    borderRadius: '8px',
    padding: '8px 12px',
    position: 'relative',
    '&::before': {
        content: '"📊"',
        position: 'absolute',
        left: '-5px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '0.7rem',
        opacity: 0.6,
    },
});

const StyledChip = styled(Chip)(({ labelcolor }) => ({
    fontWeight: 600,
    fontSize: '0.7rem',
    height: '28px',
    borderRadius: '14px',
    textTransform: 'uppercase',
    padding: '0 12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(5px)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 255, 255, 0.2)',
        opacity: 0,
        transition: 'opacity 0.3s ease-in-out',
    },
    '&:hover::before': {
        opacity: 1,
    },
    '& .MuiChip-label': {
        paddingLeft: '8px',
        paddingRight: '8px',
        position: 'relative',
        zIndex: 1,
    },
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        transform: 'scale(1.05)',
    },
    ...(labelcolor === 'open' && {
        background: jiraColors.chipBgOpen,
        color: jiraColors.chipTextOpen,
    }),
    ...(labelcolor === 'in_progress' && {
        background: jiraColors.chipBgInProgress,
        color: jiraColors.chipTextInProgress,
    }),
    ...(labelcolor === 'closed' && {
        background: jiraColors.chipBgClosed,
        color: jiraColors.chipTextClosed,
    }),
    ...(labelcolor === 'default' && {
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: '#ffffff',
    }),
}));

const ActionIconButton = styled(IconButton)(({ actiontype }) => ({
    color: jiraColors.textMuted,
    padding: '8px',
    borderRadius: '12px',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '0',
        height: '0',
        background: actiontype === 'delete' 
            ? 'radial-gradient(circle, rgba(255, 107, 107, 0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        transition: 'width 0.3s ease-in-out, height 0.3s ease-in-out',
    },
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        backgroundColor: actiontype === 'delete' ? jiraColors.deleteHoverBg : jiraColors.iconHoverBg,
        color: actiontype === 'delete' ? '#ff6b6b' : '#667eea',
        transform: 'scale(1.1) rotate(5deg)',
        '&::before': {
            width: '40px',
            height: '40px',
        },
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
                        <StyledChip 
                            label={`${issue.status === 'OPEN' ? '🔥' : issue.status === 'IN_PROGRESS' ? '⚡' : '✅'} ${issue.status.replace('_', ' ')}`} 
                            labelcolor={getStatusColor(issue.status)} 
                        />
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

            <Dialog 
                open={open} 
                onClose={handleClose} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '20px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                    }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    position: 'relative',
                    '&::after': {
                        content: '"✨"',
                        position: 'absolute',
                        right: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '1.2rem',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    },
                }}>
                    {issue.title}
                </DialogTitle>
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
