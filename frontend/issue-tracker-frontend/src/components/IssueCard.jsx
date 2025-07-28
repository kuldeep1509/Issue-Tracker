// src/components/IssueCard.js
import { Card, CardContent, Typography, Chip, IconButton, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDrag } from 'react-dnd';
import { useAuth } from '../context/AuthContext';

const ItemTypes = {
  ISSUE: 'issue'
};

const IssueCard = ({ issue, onEdit, onDelete }) => {
    const { user } = useAuth();
    // A user can edit/delete their own issues OR if they are an admin (is_staff)
    const canManageIssue = user && (issue.owner?.id === user.id || user.is_staff);

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'info';
            case 'IN_PROGRESS': return 'warning';
            case 'CLOSED': return 'success';
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
        <Card
            ref={drag}
            sx={{
                marginBottom: 2,
                opacity: isDragging ? 0.5 : 1,
                cursor: 'grab',
                backgroundColor: 'white',
                boxShadow: 1,
                border: '1px solid #e0e0e0',
            }}
        >
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" component="div">
                        {issue.title}
                    </Typography>
                    <Chip label={issue.status.replace('_', ' ')} color={getStatusColor(issue.status)} size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {issue.description.substring(0, 100)}{issue.description.length > 100 ? '...' : ''}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Owner: {issue.owner?.username || 'N/A'}
                    {issue.assigned_to && ` | Assigned to: ${issue.assigned_to?.username || 'N/A'}`}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                    {canManageIssue && (
                        <>
                            <IconButton aria-label="edit" size="small" onClick={() => onEdit(issue)}>
                                <EditIcon fontSize="inherit" />
                            </IconButton>
                            <IconButton aria-label="delete" size="small" onClick={() => onDelete(issue.id)}>
                                <DeleteIcon fontSize="inherit" />
                            </IconButton>
                        </>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default IssueCard;