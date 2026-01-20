import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box, Chip, alpha, Dialog, DialogContent, IconButton,
    Typography, Stack, CircularProgress, Snackbar, Alert, Button,
    Link, DialogTitle, DialogActions, Grid, Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LaunchIcon from '@mui/icons-material/Launch';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CodeIcon from '@mui/icons-material/Code';
import BugReportIcon from '@mui/icons-material/BugReport';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import axios from 'axios';

// Components
import { DataTable } from '../components/DataTable';
import { API_BASE_URL } from '../config/api';
import { AddProjectForm } from '../components/Projects/AddProject';
import { ViewProject } from '../components/Projects/ViewProject';

const PRIMARY_RUST = '#b52841';
const DARK_NAVY = '#1a202c';
const SUCCESS_GREEN = '#10b981';
const INFO_BLUE = '#0ea5e9';
const WARNING_ORANGE = '#f59e0b';
const SANS_STACK = 'ui-sans-serif, system-ui, sans-serif';

export const ProjectsPage = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Filtering State
    const [activeFilter, setActiveFilter] = useState<string>('all');

    const [modalOpen, setModalOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [editData, setEditData] = useState<any | null>(null);
    const [selectedProject, setSelectedProject] = useState<any | null>(null);

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success'
    });

    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; data: any | null }>({
        open: false, data: null
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/projects`);
            setProjects(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            setSnackbar({ open: true, message: 'Failed to fetch dashboard data', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Statistics Calculation
    const stats = useMemo(() => {
        return {
            devCount: projects.filter(p => ['design', 'development', 'discovery'].includes(p.status?.toLowerCase())).length,
            qaCount: projects.filter(p => ['uat', 'testing'].includes(p.status?.toLowerCase())).length,
            completedCount: projects.filter(p => p.status?.toLowerCase() === 'completed').length,
            retiredCount: projects.filter(p => p.status?.toLowerCase() === 'retired').length,
        };
    }, [projects]);

    // Filter Logic
    const filteredProjects = useMemo(() => {
        const filter = activeFilter.toLowerCase();
        if (filter === 'all') return projects;
        if (filter === 'dev') return projects.filter(p => ['design', 'development', 'discovery'].includes(p.status?.toLowerCase()));
        if (filter === 'qa') return projects.filter(p => ['uat', 'testing'].includes(p.status?.toLowerCase()));
        return projects.filter(p => p.status?.toLowerCase() === filter);
    }, [projects, activeFilter]);

    const handleActualDelete = async () => {
        if (!deleteConfirm.data) return;
        setIsDeleting(true);
        try {
            await axios.delete(`${API_BASE_URL}/projects/${deleteConfirm.data.id}`);
            setDeleteConfirm({ open: false, data: null });
            setSnackbar({ open: true, message: `Successfully removed project`, severity: 'success' });
            fetchData();
        } catch (error) {
            setSnackbar({ open: true, message: 'Delete failed', severity: 'error' });
        } finally { setIsDeleting(false); }
    };

    const columns = [
        { 
            id: 'created_at', 
            label: 'DATE INITIATED',
            render: (row: any) => (
                <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarMonthIcon sx={{ fontSize: '0.9rem', color: PRIMARY_RUST }} />
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: DARK_NAVY }}>
                        {new Date(row.created_at || row.start_date).toLocaleDateString('en-GB')}
                    </Typography>
                </Stack>
            )
        },
        { id: 'project_name', label: 'PROJECT NAME' },
        { id: 'clientName', label: 'CLIENT' }, 
        {
            id: 'status',
            label: 'STAGE',
            render: (row: any) => {
                const stageConfig: any = {
                    discovery: { color: '#64748b', bg: '#f1f5f9' },
                    design: { color: '#8b5cf6', bg: alpha('#8b5cf6', 0.1) },
                    development: { color: INFO_BLUE, bg: alpha(INFO_BLUE, 0.1) },
                    uat: { color: WARNING_ORANGE, bg: alpha(WARNING_ORANGE, 0.1) },
                    completed: { color: SUCCESS_GREEN, bg: alpha(SUCCESS_GREEN, 0.1) },
                    retired: { color: PRIMARY_RUST, bg: alpha(PRIMARY_RUST, 0.1) },
                };
                const config = stageConfig[row.status?.toLowerCase()] || { color: '#8a92a6', bg: '#f1f1f1' };
                return (
                    <Chip 
                        label={row.status?.toUpperCase()} 
                        size="small" 
                        sx={{ fontWeight: 800, fontSize: '0.6rem', backgroundColor: config.bg, color: config.color, borderRadius: '4px' }} 
                    />
                );
            }
        },
        {
            id: 'project_url',
            label: 'URL',
            render: (row: any) => row.project_url ? (
                <Link href={row.project_url} target="_blank" sx={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 0.5, color: PRIMARY_RUST, textDecoration: 'none', fontWeight: 600 }}>
                    LINK <LaunchIcon sx={{ fontSize: '0.8rem' }} />
                </Link>
            ) : '-'
        }
    ];

    return (
        <Box sx={{ width: '100%', p: 3, bgcolor: '#fcfcfc', minHeight: '100vh' }}>
            
            {/* Clickable Stat Cards Row */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <StatCard 
                    label="Design & Development" 
                    value={stats.devCount} 
                    icon={<CodeIcon sx={{fontSize: 18}}/>} 
                    color={INFO_BLUE} 
                    active={activeFilter === 'dev'}
                    onClick={() => setActiveFilter(activeFilter === 'dev' ? 'all' : 'dev')}
                />
                <StatCard 
                    label="QA / UAT / Testing" 
                    value={stats.qaCount} 
                    icon={<BugReportIcon sx={{fontSize: 18}}/>} 
                    color={WARNING_ORANGE} 
                    active={activeFilter === 'qa'}
                    onClick={() => setActiveFilter(activeFilter === 'qa' ? 'all' : 'qa')}
                />
                <StatCard 
                    label="Completed" 
                    value={stats.completedCount} 
                    icon={<CheckCircleIcon sx={{fontSize: 18}}/>} 
                    color={SUCCESS_GREEN} 
                    active={activeFilter === 'completed'}
                    onClick={() => setActiveFilter(activeFilter === 'completed' ? 'all' : 'completed')}
                />
                <StatCard 
                    label="Retired" 
                    value={stats.retiredCount} 
                    icon={<DeleteSweepIcon sx={{fontSize: 18}}/>} 
                    color={PRIMARY_RUST} 
                    active={activeFilter === 'retired'}
                    onClick={() => setActiveFilter(activeFilter === 'retired' ? 'all' : 'retired')}
                />
            </Grid>

            {activeFilter !== 'all' && (
                <Box sx={{ mb: 2 }}>
                    <Chip 
                        label={`FILTER: ${activeFilter.toUpperCase()}`} 
                        size="small" onDelete={() => setActiveFilter('all')}
                        sx={{ bgcolor: DARK_NAVY, color: '#fff', fontWeight: 700, fontSize: '0.65rem' }}
                    />
                </Box>
            )}

            {loading ? (
                <Stack alignItems="center" py={10}><CircularProgress sx={{ color: PRIMARY_RUST }} /></Stack>
            ) : (
                <DataTable
                    title="Software Projects Ledger"
                    columns={columns}
                    data={filteredProjects}
                    primaryAction={{
                        label: 'New Project',
                        onClick: () => { setEditData(null); setModalOpen(true); }
                    }}
                    onView={(id) => {
                        const project = projects.find(p => String(p.id) === String(id));
                        if (project) { setSelectedProject(project); setViewOpen(true); }
                    }}
                    onEdit={(id) => {
                        const project = projects.find(p => String(p.id) === String(id));
                        if (project) { setEditData(project); setModalOpen(true); }
                    }}
                    onDelete={(id) => {
                        const project = projects.find(p => String(p.id) === String(id));
                        if (project) setDeleteConfirm({ open: true, data: project });
                    }}
                />
            )}

            {/* Modals and Dialogs remain same as previous version */}
            <ViewProject open={viewOpen} onClose={() => setViewOpen(false)} project={selectedProject} />
            
            <Dialog open={deleteConfirm.open} onClose={() => !isDeleting && setDeleteConfirm({ open: false, data: null })} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '15px' } }}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: PRIMARY_RUST, fontWeight: 800 }}>
                    <WarningAmberIcon color="error" /> Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: '0.9rem' }}>Are you sure you want to delete project: <strong>{deleteConfirm.data?.project_name}</strong>?</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteConfirm({ open: false, data: null })}>Cancel</Button>
                    <Button onClick={handleActualDelete} variant="contained" sx={{ bgcolor: PRIMARY_RUST }}>Delete</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: '20px' } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2, borderBottom: '1px solid #f1f5f9' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{editData ? 'Update Project' : 'Initiate New Project'}</Typography>
                    <IconButton onClick={() => setModalOpen(false)}><CloseIcon /></IconButton>
                </Stack>
                <DialogContent sx={{ py: 3 }}>
                    <AddProjectForm initialData={editData} onSuccess={() => { setModalOpen(false); fetchData(); }} />
                </DialogContent>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

const StatCard = ({ label, value, icon, color, active, onClick }: any) => (
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Paper 
            variant="outlined" onClick={onClick}
            sx={{ 
                p: 2, borderRadius: '12px', borderLeft: `3px solid ${color}`,
                bgcolor: active ? alpha(color, 0.08) : alpha(color, 0.02),
                cursor: 'pointer', transition: '0.2s',
                '&:hover': { bgcolor: alpha(color, 0.1), transform: 'translateY(-3px)' }
            }}
        >
            <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: active ? color : alpha(color, 0.1), color: active ? '#fff' : color, display: 'flex' }}>
                    {icon}
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 800, color: DARK_NAVY, fontSize: '1.1rem', lineHeight: 1 }}>{value}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 800 }}>{label}</Typography>
                </Box>
            </Stack>
        </Paper>
    </Grid>
);