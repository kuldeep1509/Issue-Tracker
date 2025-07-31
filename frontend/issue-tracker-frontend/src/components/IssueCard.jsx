import { Card, CardContent, Typography, Chip, IconButton, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDrag } from 'react-dnd';
import { useAuth } from '../context/AuthContext';
import { styled } from '@mui/system';

const ItemTypes = {
    ISSUE: 'issue'
};

// --- Aqua Color Palette Definition (Consistent with other components) ---
const aquaColors = {
    primary: '#00bcd4', // Cyan/Aqua primary color (Material Cyan 500)
    primaryLight: '#4dd0e1', // Lighter primary
    primaryDark: '#00838f', // Darker primary for hover
    backgroundLight: '#e0f7fa', // Very light aqua background (Material Cyan 50)
    backgroundMedium: '#b2ebf2', // Medium aqua for subtle accents
    textDark: '#263238', // Dark slate for primary text
    textMuted: '#546e7a', // Muted slate for secondary text
    cardBackground: '#ffffff', // White background for cards
    cardBorder: '#e0f7fa', // Very light aqua border for cards
    deleteRed: '#ef5350', // Standard Material-UI error red for delete
    editBlue: '#2196f3', // Standard Material-UI blue for edit (can be adjusted to aqua if desired)
    white: '#ffffff', // Added white to color palette for chips
};

// --- Styled Components for IssueCard ---

const StyledIssueCard = styled(Card)(({ isdragging }) => ({
    // THIS IS THE CRUCIAL LINE FOR ISSUE CARD WIDTH
    width: '100%',
    marginBottom: '16px', // Standard spacing between cards
    opacity: isdragging ? 0.6 : 1, // Slightly more opaque when dragging
    cursor: 'grab',
    backgroundColor: aquaColors.cardBackground, // White background for the card
    borderRadius: '10px', // Slightly more rounded corners
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', // Soft, subtle shadow
    border: `1px solid ${aquaColors.cardBorder}`, // Very light aqua border
    transition: 'transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out',
    '&:hover': {
        transform: 'translateY(-3px)', // Slight lift effect on hover
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.12)', // Slightly stronger shadow on hover
    }
}));

const StyledCardContent = styled(CardContent)({
    padding: '16px', // Ample padding inside the card
    '&:last-child': { // Override Material-UI's default last-child padding for consistency
        paddingBottom: '16px',
    },
});

const IssueTitle = styled(Typography)({
    fontWeight: 600,
    color: aquaColors.textDark, // Dark text for the title
    lineHeight: 1.3,
    wordBreak: 'break-word', // Ensure long titles wrap
});

const IssueDescription = styled(Typography)({
    marginTop: '8px',
    color: aquaColors.textMuted, // Muted text for description
    fontSize: '0.875rem', // Standard body2 size
    lineHeight: 1.5,
    maxHeight: '4.5em', // Limit description to about 3 lines
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 3, // Limit to 3 lines
    WebkitBoxOrient: 'vertical',
});

const IssueMetaText = styled(Typography)({
    marginTop: '12px', // More space above meta info
    fontSize: '0.75rem', // Caption size
    color: aquaColors.textMuted,
    opacity: 0.8, // Slightly lighter for subtle info
});

const StyledChip = styled(Chip)(({ labelcolor }) => ({
    fontWeight: 600,
    fontSize: '0.75rem', // Slightly larger font for chips
    height: '24px', // Consistent chip height
    '&.MuiChip-colorInfo': {
        backgroundColor: aquaColors.primary, // OPEN: Primary Aqua
        color: aquaColors.white,
    },
    '&.MuiChip-colorWarning': {
        backgroundColor: '#ffb300', // IN_PROGRESS: Amber (Standard warning color)
        color: aquaColors.textDark, // Dark text for contrast
    },
    '&.MuiChip-colorSuccess': {
        backgroundColor: '#43a047', // CLOSED: Green (Standard success color)
        color: aquaColors.white,
    },
    '&.MuiChip-colorDefault': {
        backgroundColor: aquaColors.backgroundMedium,
        color: aquaColors.textDark,
    },
}));

const ActionIconButton = styled(IconButton)(({ actiontype }) => ({
    // Conditional styling based on actionType prop
    color: actiontype === 'delete' ? aquaColors.deleteRed : aquaColors.editBlue,
    '&:hover': {
        backgroundColor: actiontype === 'delete' ? 'rgba(239, 83, 80, 0.1)' : 'rgba(33, 150, 243, 0.1)',
        transform: 'scale(1.1)', // Subtle grow on hover
    },
}));

const IssueCard = ({ issue, onEdit, onDelete }) => {
    const { user } = useAuth();
    const canManageIssue = user && (issue.owner?.id === user.id || user.is_staff);

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'info'; // Maps to primary aqua via StyledChip
            case 'IN_PROGRESS': return 'warning'; // Maps to amber
            case 'CLOSED': return 'success'; // Maps to green
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

    return (
        <StyledIssueCard ref={drag} isdragging={isDragging ? 1 : 0}>
            <StyledCardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <IssueTitle variant="h6" component="div" sx={{ flexGrow: 1, pr: 1 }}>
                        {issue.title}
                    </IssueTitle>
                    <StyledChip label={issue.status.replace('_', ' ')} color={getStatusColor(issue.status)} />
                </Box>
                <IssueDescription variant="body2">
                    {issue.description.substring(0, 150)}{issue.description.length > 150 ? '...' : ''}
                </IssueDescription>
                <IssueMetaText variant="caption" display="block">
                    Owner: {issue.owner?.username || 'N/A'}
                    {issue.assigned_to && ` | Assigned to: ${issue.assigned_to?.username || 'N/A'}`}
                </IssueMetaText>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 0.5 }}>
                    {canManageIssue && (
                        <>
                            <ActionIconButton
                                aria-label="edit"
                                size="small"
                                onClick={() => onEdit(issue)}
                                actiontype="edit"
                            >
                                <EditIcon fontSize="small" />
                            </ActionIconButton>
                            <ActionIconButton
                                aria-label="delete"
                                size="small"
                                onClick={() => onDelete(issue.id)}
                                actiontype="delete"
                            >
                                <DeleteIcon fontSize="small" />
                            </ActionIconButton>
                        </>
                    )}
                </Box>
            </StyledCardContent>
        </StyledIssueCard>
    );
};

export default IssueCard;