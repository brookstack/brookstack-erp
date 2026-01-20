import React from 'react';
import {
    Box, Typography, Stack, Chip, Dialog, DialogContent, 
    IconButton, Grid, Divider, Link, Paper, alpha
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LaunchIcon from '@mui/icons-material/Launch';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DnsIcon from '@mui/icons-material/Dns';
import CodeIcon from '@mui/icons-material/Code';
import PersonIcon from '@mui/icons-material/Person';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';

const RUST = '#b52841';
const DARK_NAVY = '#1a202c';
const SLATE = '#64748b';

interface ViewProjectProps {
    open: boolean;
    onClose: () => void;
    project: any;
}

export const ViewProject: React.FC<ViewProjectProps> = ({ open, onClose, project }) => {
    if (!project) return null;

    const getStatusConfig = (status: string) => {
        const stages: any = {
            discovery: { color: '#64748b', label: 'Discovery & Planning' },
            development: { color: '#0ea5e9', label: 'Active Development' },
            uat: { color: '#f59e0b', label: 'User Testing (UAT)' },
            completed: { color: '#10b981', label: 'Project Completed' },
            retired: { color: '#10b981', label: 'Project Retired' }
        };
        return stages[status?.toLowerCase()] || { color: RUST, label: status };
    };

    // Date Safety Logic
    const formatHumanDate = (row: any) => {
        const rawDate = row.created_at || row.createdAt || row.date_added || row.start_date;
        if (!rawDate) return 'Pending';
        try {
            return new Intl.DateTimeFormat('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }).format(new Date(rawDate));
        } catch (e) {
            return '-';
        }
    };

    const statusConfig = getStatusConfig(project.status);

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            fullWidth 
            maxWidth="md"
            PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}
        >
            {/* Thinner Horizontal Header */}
            <Box sx={{ bgcolor: RUST, px: 3, py: 2, color: '#fff' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="h6" sx={{ fontWeight: 900, fontSize: '1.1rem' }}>
                            {project.project_name}
                        </Typography>
                        <Chip 
                            label={project.status?.toUpperCase()} 
                            size="small" 
                            sx={{ 
                                bgcolor: statusConfig.color, 
                                color: '#fff', 
                                fontWeight: 800, 
                                borderRadius: '4px',
                                height: 20,
                                fontSize: '0.65rem'
                            }} 
                        />
                    </Stack>

                    <Stack direction="row" spacing={3} alignItems="center">
                        <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                            <Typography variant="overline" sx={{ color: alpha('#fff', 0.4), lineHeight: 1, fontWeight: 700, display: 'block' }}>
                                Project System
                            </Typography>
                            <Typography variant="caption" sx={{ color: alpha('#fff', 0.7), fontWeight: 600 }}>
                                ID: PROJ-{project.id?.toString().padStart(4, '0')}
                            </Typography>
                        </Box>
                        <IconButton 
                            onClick={onClose} 
                            size="small"
                            sx={{ color: alpha('#fff', 0.6), '&:hover': { color: '#fff', bgcolor: alpha('#fff', 0.1) } }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                </Stack>
            </Box>

            <DialogContent sx={{ p: 0 }}>
                <Grid container>
                    {/* Left Sidebar */}
                    <Grid size={{ xs: 12, md: 4 }} sx={{ bgcolor: '#f8fafc', p: 3, borderRight: '1px solid #e2e8f0' }}>
                        <Stack spacing={2.5}>
                            <MetricItem 
                                icon={<PersonIcon fontSize="small" />} 
                                label="Client" 
                                value={project.clientName || 'Internal Project'} 
                            />
                            <MetricItem 
                                icon={<CodeIcon fontSize="small" />} 
                                label="Type" 
                                value={project.project_type || 'Software Engineering'} 
                            />
                            <MetricItem 
                                icon={<CalendarTodayIcon fontSize="small" />} 
                                label="Date Created" 
                                value={formatHumanDate(project)} 
                            />
                            
                            {project.project_url && (
                                <Paper variant="outlined" sx={{ p: 1.5, mt: 1, borderRadius: '10px', borderColor: alpha(RUST, 0.2), bgcolor: alpha(RUST, 0.02) }}>
                                    <Link 
                                        href={project.project_url.startsWith('http') ? project.project_url : `https://${project.project_url}`} 
                                        target="_blank"
                                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: RUST, fontWeight: 800, textDecoration: 'none', fontSize: '0.75rem' }}
                                    >
                                        OPEN LIVE PREVIEW <LaunchIcon sx={{ fontSize: '0.9rem' }} />
                                    </Link>
                                </Paper>
                            )}
                        </Stack>
                    </Grid>

                    {/* Right Content */}
                    <Grid size={{ xs: 12, md: 8 }} sx={{ p: 4 }}>
                        <Stack spacing={3}>
                            {/* NEW: Project Stage Detail */}
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: DARK_NAVY, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SettingsSuggestIcon sx={{ fontSize: '1rem', color: RUST }} /> Current Stage
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ px: 2, py: 1, borderRadius: '8px', bgcolor: alpha(statusConfig.color, 0.1), border: `1px solid ${alpha(statusConfig.color, 0.2)}` }}>
                                        <Typography sx={{ color: statusConfig.color, fontWeight: 900, fontSize: '0.8rem' }}>
                                            {statusConfig.label}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: DARK_NAVY, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <DnsIcon sx={{ fontSize: '1rem', color: RUST }} /> Description
                                </Typography>
                                <Typography variant="body2" sx={{ color: SLATE, lineHeight: 1.6 }}>
                                    {project.description || 'No project description available.'}
                                </Typography>
                            </Box>

                            <Divider sx={{ borderStyle: 'dashed' }} />

                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: DARK_NAVY, mb: 1.5 }}>
                                    Development Notes
                                </Typography>
                                <Box sx={{ p: 2, bgcolor: '#fdfdfd', border: '1px solid #eee', borderLeft: `3px solid ${RUST}`, borderRadius: '4px' }}>
                                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#666' }}>
                                        {project.notes || 'No internal notes recorded.'}
                                    </Typography>
                                </Box>
                            </Box>

                            <Typography variant="caption" sx={{ color: '#cbd5e1', textAlign: 'right', mt: 2 }}>
                                System Data Reference • {new Date().getFullYear()}
                            </Typography>
                        </Stack>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

const MetricItem = ({ icon, label, value }: any) => (
    <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: RUST, border: '1px solid #edf2f7' }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="caption" sx={{ color: SLATE, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.6rem', display: 'block', lineHeight: 1 }}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: DARK_NAVY, fontSize: '0.85rem' }}>
                {value}
            </Typography>
        </Box>
    </Stack>
);