import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box, Chip, alpha, Dialog, DialogContent, IconButton,
    Typography, Stack, CircularProgress, Snackbar, Alert, Button,
    Link
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LaunchIcon from '@mui/icons-material/Launch';

// Components
import { DataTable } from '../components/DataTable';
import { API_BASE_URL } from '../config/api';
import { AddProjectForm } from '../components/Projects/AddProject';
import { ViewProject } from '../components/Projects/ViewProject'; // Import the new design

const PRIMARY_RUST = '#b52841';
const DARK_NAVY = '#1a202c';
const SANS_STACK = 'ui-sans-serif, system-ui, sans-serif';

export const ProjectsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal States
    const [modalOpen, setModalOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    
    // Data States
    const [editData, setEditData] = useState<any | null>(null);
    const [selectedProject, setSelectedProject] = useState<any | null>(null);

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success'
    });

    const statusFilter = searchParams.get('status');

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/projects`);
            const data = await response.json();
            setProjects(data);
        } catch (error) {
            setSnackbar({ open: true, message: 'Failed to fetch projects', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);

    const filteredProjects = useMemo(() => {
        if (!statusFilter) return projects;
        return projects.filter(p => p.status?.toLowerCase() === statusFilter.toLowerCase());
    }, [projects, statusFilter]);

    const columns = [
        { id: 'project_name', label: 'PROJECT NAME' },
        { id: 'clientName', label: 'CLIENT' }, 
        { 
            id: 'project_type', 
            label: 'TYPE',
            render: (row: any) => (
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                    {row.project_type}
                </Typography>
            )
        },
        {
            id: 'status',
            label: 'STAGE',
            render: (row: any) => {
                const stageConfig: any = {
                    discovery: { color: '#64748b', bg: '#f1f5f9' },
                    design: { color: '#8b5cf6', bg: alpha('#8b5cf6', 0.1) },
                    development: { color: '#0ea5e9', bg: alpha('#0ea5e9', 0.1) },
                    uat: { color: '#f59e0b', bg: alpha('#f59e0b', 0.1) },
                    deployment: { color: '#2ecc71', bg: alpha('#2ecc71', 0.1) },
                    completed: { color: '#10b981', bg: alpha('#10b981', 0.1) },
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
            render: (row: any) => {
                if (!row.project_url) return <Typography variant="caption" sx={{ color: 'text.disabled' }}>-</Typography>;
                const href = row.project_url.startsWith('http') ? row.project_url : `https://${row.project_url}`;
                return (
                    <Link 
                        href={href} target="_blank" rel="noopener" 
                        sx={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 0.5, color: PRIMARY_RUST, textDecoration: 'none', fontWeight: 600 }}
                    >
                        {row.project_url.replace(/(^\w+:|^)\/\//, '').substring(0, 15)}...
                        <LaunchIcon sx={{ fontSize: '0.85rem' }} />
                    </Link>
                );
            }
        }
    ];

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            {/* Active Filter UI */}
            {statusFilter && (
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2, p: 1.5, bgcolor: alpha(PRIMARY_RUST, 0.05), borderRadius: '8px', border: `1px solid ${alpha(PRIMARY_RUST, 0.1)}` }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: SANS_STACK }}>
                        Filtering Stage: <span style={{ color: PRIMARY_RUST }}>{statusFilter.toUpperCase()}</span>
                    </Typography>
                    <Button size="small" variant="text" onClick={() => setSearchParams({})} sx={{ color: PRIMARY_RUST, textTransform: 'none', fontWeight: 700 }}>Clear</Button>
                </Stack>
            )}

            {loading ? (
                <Stack alignItems="center" py={10}><CircularProgress sx={{ color: PRIMARY_RUST }} /></Stack>
            ) : (
                <DataTable
                    title="Software Projects"
                    columns={columns}
                    data={filteredProjects}
                    primaryAction={{
                        label: 'New Project',
                        onClick: () => { setEditData(null); setModalOpen(true); }
                    }}
                    onView={(id) => {
                        const project = projects.find(p => p.id === id);
                        if (project) {
                            setSelectedProject(project);
                            setViewOpen(true);
                        }
                    }}
                    onEdit={(id) => {
                        const project = projects.find(p => p.id === id);
                        if (project) { setEditData(project); setModalOpen(true); }
                    }}
                />
            )}

            {/* Contemporary View Popup */}
            <ViewProject 
                open={viewOpen} 
                onClose={() => setViewOpen(false)} 
                project={selectedProject} 
            />

            {/* Add/Edit Modal */}
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: '12px' } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2, borderBottom: '1px solid #eee' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: DARK_NAVY, fontFamily: SANS_STACK }}>
                        {editData ? `Update: ${editData.project_name}` : 'Initiate New Project'}
                    </Typography>
                    <IconButton onClick={() => setModalOpen(false)}><CloseIcon /></IconButton>
                </Stack>
                <DialogContent sx={{ py: 4 }}>
                    <AddProjectForm
                        initialData={editData}
                        onSuccess={() => {
                            setModalOpen(false);
                            fetchProjects();
                            setSnackbar({ open: true, message: editData ? 'Project updated' : 'Project initiated successfully', severity: 'success' });
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Snackbar 
                open={snackbar.open} autoHideDuration={4000} 
                onClose={() => setSnackbar({ ...snackbar, open: false })} 
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%', fontWeight: 600 }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};