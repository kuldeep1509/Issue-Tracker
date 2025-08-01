import { Card, CardContent, Typography, Chip, IconButton, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDrag } from 'react-dnd';
import { useAuth } from '../context/AuthContext';
import { styled } from '@mui/system';

const ItemTypes = {
    ISSUE: 'issue'
};

// --- Jira-like Color Palette Definition (Consistent with other components) ---
const jiraColors = {
    primaryBlue: '#0052cc', // Jira's main blue for buttons, links, focus
    primaryBlueDark: '#0065ff', // Darker blue for hover
    backgroundLight: '#f4f5f7', // Light grey background, similar to Jira's board
    backgroundMedium: '#dfe1e6', // Slightly darker grey for borders/subtle elements
    textDark: '#172b4d', // Dark text for headings and primary content
    textMuted: '#5e6c84', // Muted grey for secondary text
    white: '#ffffff',
    shadow: 'rgba(0, 0, 0, 0.1)', // Subtle shadow
    errorRed: '#de350b', // Jira's error red
    chipBgOpen: '#e9f2ff', // Light blue for OPEN chip background
    chipTextOpen: '#0052cc', // Dark blue for OPEN chip text
    chipBgInProgress: '#fff0b3', // Light yellow for IN_PROGRESS chip background
    chipTextInProgress: '#5c4000', // Dark brown for IN_PROGRESS chip text
    chipBgClosed: '#e3fcef', // Light green for CLOSED chip background
    chipTextClosed: '#1f845a', // Dark green for CLOSED chip text
    iconHoverBg: 'rgba(94, 108, 132, 0.08)', // Subtle grey hover for icons
    deleteHoverBg: 'rgba(222, 53, 11, 0.1)', // Red hover for delete
};

// --- Styled Components for IssueCard ---

const StyledIssueCard = styled(Card)(({ isdragging }) => ({
    width: '100%',
    marginBottom: '16px', // Standard spacing between cards
    opacity: isdragging ? 0.6 : 1, // Slightly more opaque when dragging
    cursor: 'grab',
    backgroundColor: jiraColors.white, // White background for the card
    borderRadius: '3px', // Jira-like rounded corners
    boxShadow: `0 1px 2px ${jiraColors.shadow}`, // Subtle shadow, less pronounced than before
    border: `1px solid ${jiraColors.backgroundMedium}`, // Light grey border
    transition: 'transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out',
    '&:hover': {
        transform: 'translateY(-1px)', // Slight lift effect on hover, less dramatic
        boxShadow: `0 2px 4px ${jiraColors.shadow}`, // Slightly stronger shadow on hover
    }
}));

const StyledCardContent = styled(CardContent)({
    padding: '16px', // Ample padding inside the card
    '&:last-child': { // Override Material-UI's default last-child padding for consistency
        paddingBottom: '16px',
    },
});

const IssueTitle = styled(Typography)({
    fontWeight: 600, // Slightly less bold than h1, more like Jira's card titles
    color: jiraColors.textDark, // Dark text for the title
    lineHeight: 1.3,
    wordBreak: 'break-word', // Ensure long titles wrap
    fontSize: '1rem', // Standard font size for card titles
});

const IssueDescription = styled(Typography)({
    marginTop: '8px',
    color: jiraColors.textMuted, // Muted text for description
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
    color: jiraColors.textMuted,
    opacity: 0.9, // Slightly more visible for subtle info
});

const StyledChip = styled(Chip)(({ labelcolor }) => ({
    fontWeight: 600,
    fontSize: '0.7rem', // Slightly smaller font for chips
    height: '20px', // Consistent chip height
    borderRadius: '3px', // Jira-like chip corners
    textTransform: 'uppercase', // Jira status chips are often uppercase
    padding: '0 6px', // Adjust padding for smaller chips
    '& .MuiChip-label': {
        paddingLeft: '6px',
        paddingRight: '6px',
    },
    // Custom colors based on status
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
    // Fallback for default or unknown status
    ...(labelcolor === 'default' && {
        backgroundColor: jiraColors.backgroundMedium,
        color: jiraColors.textMuted,
    }),
}));

const ActionIconButton = styled(IconButton)(({ actiontype }) => ({
    color: jiraColors.textMuted, // Default icon color is muted
    padding: '6px', // Smaller padding for icons
    '&:hover': {
        backgroundColor: actiontype === 'delete' ? jiraColors.deleteHoverBg : jiraColors.iconHoverBg,
        color: actiontype === 'delete' ? jiraColors.errorRed : jiraColors.textDark, // Red for delete, dark for edit
        transform: 'none', // Remove scale effect for Jira-like subtlety
    },
}));

const IssueCard = ({ issue, onEdit, onDelete }) => {
    const { user } = useAuth();
    // Log the issue object to the console for debugging
    console.log("IssueCard received issue:", issue);

    const canManageIssue = user && (issue.owner?.id === user.id || user.is_staff);

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'open'; // Custom labelcolor for specific styling
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

    return (
        <StyledIssueCard ref={drag} isdragging={isDragging ? 1 : 0}>
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
                    {/* Display assigned_to if available, otherwise display assigned_team */}
                    {issue.assigned_to ? (
                        ` | Assigned to: ${issue.assigned_to?.username || 'N/A'}`
                    ) : (
                        issue.assigned_team?.name ? ` | Team: ${issue.assigned_team.name}` : ''
                    )}
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
