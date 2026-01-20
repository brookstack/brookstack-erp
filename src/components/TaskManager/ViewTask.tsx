import { Dialog, DialogContent, Typography, Stack, Box, Divider, IconButton, alpha } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';

const PRIMARY_RUST = '#b52841';
const DARK_NAVY = '#1a202c';

export const ViewTask = ({ open, onClose, data }: any) => {
    if (!data) return null;

    const isDone = data.status === 'Completed';

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            fullWidth 
            maxWidth="sm" 
            PaperProps={{ sx: { borderRadius: '12px', overflow: 'hidden' } }}
        >
            <DialogContent sx={{ p: 0 }}>
                {/* --- Slim Compact Header --- */}
                <Box sx={{ 
                    bgcolor: isDone ? '#10b981' : PRIMARY_RUST, 
                    px: 3, 
                    py: 1.5, 
                    color: '#fff', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.6rem', letterSpacing: 1.2, textTransform: 'uppercase', opacity: 0.9 }}>
                        ID-{data.id} • {data.status}
                    </Typography>
                    
                    <IconButton 
                        onClick={onClose} 
                        size="small" 
                        sx={{ color: '#fff', p: 0.5, '&:hover': { bgcolor: alpha('#fff', 0.1) } }}
                    >
                        <CloseIcon sx={{ fontSize: '1.1rem' }} />
                    </IconButton>
                </Box>

                {/* --- Main Content Section --- */}
                <Box sx={{ p: 3.5 }}>
                    {/* The Title: Small Font but Extremely Bold */}
                    <Typography sx={{ 
                        fontWeight: 900, 
                        color: DARK_NAVY, 
                        mb: 3, 
                        lineHeight: 1.3, 
                        fontSize: '1.1rem', // Reduced size
                        letterSpacing: '-0.01em'
                    }}>
                        {data.task_name}
                    </Typography>

                    <Stack direction="row" spacing={5} sx={{ mb: 3 }}>
                        {/* Category */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AssignmentIcon sx={{ fontSize: '0.9rem', color: PRIMARY_RUST }} />
                            <Box>
                                <Typography sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.6rem', textTransform: 'uppercase', display: 'block' }}>
                                    Category
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: DARK_NAVY }}>
                                    {data.category}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Owner */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon sx={{ fontSize: '0.9rem', color: DARK_NAVY }} />
                            <Box>
                                <Typography sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.6rem', textTransform: 'uppercase', display: 'block' }}>
                                    Ownership
                                </Typography>
                                <Typography sx={{ fontWeight: 600, fontSize: '0.75rem', color: DARK_NAVY }}>
                                    {data.owner}
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>

                    <Divider sx={{ mb: 3, opacity: 0.6 }} />

                    {/* Deadline Row: Compact */}
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        px: 2, 
                        py: 1.5,
                        borderRadius: '8px', 
                        bgcolor: alpha('#f59e0b', 0.04),
                        border: `1px solid ${alpha('#f59e0b', 0.15)}`
                    }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <CalendarMonthIcon sx={{ fontSize: '1rem', color: '#f59e0b' }} />
                            <Typography sx={{ fontWeight: 700, fontSize: '0.7rem', color: DARK_NAVY, textTransform: 'uppercase' }}>
                                Target Deadline
                            </Typography>
                        </Stack>
                        <Typography sx={{ fontWeight: 900, fontSize: '0.75rem', color: '#f59e0b' }}>
                            {new Date(data.due_date).toLocaleDateString('en-GB', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                            })}
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};