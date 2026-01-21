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
import AssignmentIcon from '@mui/icons-material/Assignment';
import axios from 'axios';

// Components
import { DataTable } from '../components/DataTable';
import { API_BASE_URL } from '../config/api';
import { AddProjectForm } from '../components/Projects/AddProject';
import { ViewProject } from '../components/Projects/ViewProject';

const PRIMARY_RUST = '#b52841';
const DARK_NAVY = '#1a202c';
const TOTAL_NAVY = '#446dbfff';
const SUCCESS_GREEN = '#10b981';
const INFO_BLUE = '#0ea5e9';
const WARNING_ORANGE = '#f59e0b';

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
            setSnackbar({ open: true, message: 'Failed to fetch project data', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Status Configuration
    const stageConfig: any = {
        all: { color: TOTAL_NAVY, label: 'Total Projects', icon: <AssignmentIcon sx={{fontSize: 18}}/> },
        development: { color: INFO_BLUE, label: 'Design & Development', icon: <CodeIcon sx={{fontSize: 18}}/> },
        uat: { color: WARNING_ORANGE, label: 'UATs', icon: <BugReportIcon sx={{fontSize: 18}}/> },
        completed: { color: SUCCESS_GREEN, label: 'Completed', icon: <CheckCircleIcon sx={{fontSize: 18}}/> },
        retired: { color: PRIMARY_RUST, label: 'Retired', icon: <DeleteSweepIcon sx={{fontSize: 18}}/> },
    };

    // Statistics Calculation
    const stats = useMemo(() => {
        const counts: any = { all: projects.length, development: 0, uat: 0, completed: 0, retired: 0 };
        projects.forEach(p => {
            const status = p.status?.toLowerCase();
            if (status === 'design' || status === 'development' || status === 'design & development') {
                counts.development++;
            } else if (status === 'uat' || status === 'testing' || status === 'qa') {
                counts.uat++;
            } else if (status === 'completed') {
                counts.completed++;
            } else if (status === 'retired') {
                counts.retired++;
            }
        });
        return counts;
    }, [projects]);

    // Filter Logic
    const filteredProjects = useMemo(() => {
        if (activeFilter === 'all') return projects;
        return projects.filter(p => {
            const status = p.status?.toLowerCase();
            if (activeFilter === 'development') 
                return status === 'design' || status === 'development' || status === 'design & development';
            if (activeFilter === 'uat') 
                return status === 'uat' || status === 'testing' || status === 'qa';
            return status === activeFilter;
        });
    }, [projects, activeFilter]);

    const handleActualDelete = async () => {
        if (!deleteConfirm.data) return;
        setIsDeleting(true);
        try {
            await axios.delete(`${API_BASE_URL}/projects/${deleteConfirm.data.id}`);
            setDeleteConfirm({ open: false, data: null });
            setSnackbar({ open: true, message: `Project removed successfully`, severity: 'success' });
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
        { 
            id: 'project_type', 
            label: 'TYPE',
            render: (row: any) => (
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                    {row.project_type || 'N/A'}
                </Typography>
            )
        },
        { id: 'clientName', label: 'CLIENT' }, 
        {
            id: 'status',
            label: 'STAGE',
            render: (row: any) => {
                const statusKey = row.status?.toLowerCase();
                let config = stageConfig.development;
                
                if (statusKey === 'uat' || statusKey === 'testing' || statusKey === 'qa') config = stageConfig.uat;
                else if (statusKey === 'completed') config = stageConfig.completed;
                else if (statusKey === 'retired') config = stageConfig.retired;

                return (
                    <Chip 
                        label={config.label.toUpperCase()} 
                        size="small" 
                        sx={{ 
                            fontWeight: 800, fontSize: '0.6rem', borderRadius: '4px',
                            backgroundColor: alpha(config.color, 0.1), color: config.color, 
                        }} 
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
            
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {Object.keys(stageConfig).map((key) => (
                    <StatCard 
                        key={key}
                        label={stageConfig[key].label} 
                        value={stats[key]} 
                        icon={stageConfig[key].icon} 
                        color={stageConfig[key].color} 
                        active={activeFilter === key}
                        onClick={() => setActiveFilter(key)}
                    />
                ))}
            </Grid>

            {activeFilter !== 'all' && (
                <Box sx={{ mb: 2 }}>
                    <Chip 
                        label={`FILTER: ${stageConfig[activeFilter]?.label.toUpperCase()}`} 
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

            <ViewProject open={viewOpen} onClose={() => setViewOpen(false)} project={selectedProject} />
            
            <Dialog open={deleteConfirm.open} onClose={() => !isDeleting && setDeleteConfirm({ open: false, data: null })} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '15px' } }}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: PRIMARY_RUST, fontWeight: 800 }}>
                    <WarningAmberIcon color="error" /> Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: '0.9rem' }}>Permanently remove <strong>{deleteConfirm.data?.project_name}</strong>?</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteConfirm({ open: false, data: null })}>Cancel</Button>
                    <Button disabled={isDeleting} onClick={handleActualDelete} variant="contained" sx={{ bgcolor: PRIMARY_RUST }}>
                        {isDeleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: '20px' } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2, borderBottom: '1px solid #f1f5f9' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: DARK_NAVY }}>{editData ? 'Update Project' : 'Initiate New Project'}</Typography>
                    <IconButton onClick={() => setModalOpen(false)}><CloseIcon /></IconButton>
                </Stack>
                <DialogContent sx={{ py: 3 }}>
                    <AddProjectForm initialData={editData} onSuccess={() => { setModalOpen(false); fetchData(); }} />
                </DialogContent>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} variant="filled" sx={{ fontWeight: 600 }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

const StatCard = ({ label, value, icon, color, active, onClick }: any) => (
    <Grid size={{xs: 12, sm:6}}>
        <Paper 
            variant="outlined" onClick={onClick}
            sx={{ 
                p: 2, borderRadius: '12px', borderLeft: `3px solid ${color}`,
                bgcolor: active ? alpha(color, 0.08) : alpha(color, 0.02),
                cursor: 'pointer', transition: '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { bgcolor: alpha(color, 0.1), transform: 'translateY(-3px)' }
            }}
        >
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ 
                    p: 1, borderRadius: '8px', bgcolor: active ? color : alpha(color, 0.1), 
                    color: active ? '#fff' : color, display: 'flex'
                }}>
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