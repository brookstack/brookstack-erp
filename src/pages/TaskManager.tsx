import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Typography, Stack, Checkbox, 
    Dialog, DialogContent, Snackbar, Alert, Paper, alpha,
    DialogTitle, DialogActions, Button,
    Grid,
    Chip
} from '@mui/material';

// Icons
import AssignmentCheckIcon from '@mui/icons-material/AssignmentTurnedIn';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import SpeedIcon from '@mui/icons-material/Speed';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// Components
import { DataTable } from '../components/DataTable';
import { AddTaskForm } from '../components/TaskManager/AddTaskForm';
import { ViewTask } from '../components/TaskManager/ViewTask';
import { API_BASE_URL } from '../config/api';

const PRIMARY_RUST = '#b52841';
const DARK_NAVY = '#1a202c';
const SUCCESS_GREEN = '#10b981';
const WARNING_ORANGE = '#f59e0b';
const CURRENT_USER = "Admin User"; 

export const TasksPage = () => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [editData, setEditData] = useState<any | null>(null);
    
    // Filtering State
    const [activeFilter, setActiveFilter] = useState<string>('all');

    // UI Feedback States
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; data: any | null }>({ open: false, data: null });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const showMessage = (msg: string, sev: 'success' | 'error' = 'success') => {
        setSnackbar({ open: true, message: msg, severity: sev });
    };

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/tasks`);
            setTasks(res.data);
        } catch (err) {
            showMessage('Connection to ERP Server failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTasks(); }, []);

    const handleToggleStatus = async (task: any) => {
        const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
        try {
            await axios.put(`${API_BASE_URL}/tasks/${task.id}`, { status: newStatus });
            fetchTasks();
            showMessage(`Task marked as ${newStatus}`);
        } catch (err) {
            showMessage('Status update failed', 'error');
        }
    };

    const handleFormSubmit = async (formData: any) => {
        try {
            if (editData) {
                await axios.put(`${API_BASE_URL}/tasks/${editData.id}`, formData);
                showMessage('Task updated successfully');
            } else {
                await axios.post(`${API_BASE_URL}/tasks`, { ...formData, owner: CURRENT_USER });
                showMessage('New task added to ledger');
            }
            setModalOpen(false);
            fetchTasks();
        } catch (err) {
            showMessage('Operation failed: Check server logs', 'error');
        }
    };

    const handleConfirmDelete = async () => {
        if (deleteConfirm.data) {
            try {
                await axios.delete(`${API_BASE_URL}/tasks/${deleteConfirm.data.id}`);
                fetchTasks();
                showMessage('Task permanently removed');
            } catch (err) {
                showMessage('Delete failed: Item not found', 'error');
            }
        }
        setDeleteConfirm({ open: false, data: null });
    };

    const stats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return {
            total: tasks.length,
            completed: tasks.filter(t => t.status === 'Completed').length,
            pending: tasks.filter(t => t.status === 'Pending').length,
            overdue: tasks.filter(t => t.status === 'Pending' && new Date(t.due_date) < today).length,
            onTrack: tasks.filter(t => t.status === 'Pending' && new Date(t.due_date) >= today).length,
        };
    }, [tasks]);

    // Filtered Data Logic
    const filteredTasks = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        switch(activeFilter) {
            case 'completed': return tasks.filter(t => t.status === 'Completed');
            case 'pending': return tasks.filter(t => t.status === 'Pending');
            case 'overdue': return tasks.filter(t => t.status === 'Pending' && new Date(t.due_date) < today);
            case 'onTrack': return tasks.filter(t => t.status === 'Pending' && new Date(t.due_date) >= today);
            default: return tasks;
        }
    }, [tasks, activeFilter]);

    const columns = [
        { 
            id: 'status', 
            label: 'DONE',
            render: (row: any) => (
                <Checkbox 
                    checked={row.status === 'Completed'}
                    onChange={() => handleToggleStatus(row)}
                    sx={{ color: '#cbd5e1', '&.Mui-checked': { color: SUCCESS_GREEN }, p: 0.5 }}
                />
            )
        },
        { 
            id: 'task_name', 
            label: 'TASK DESCRIPTION',
            render: (row: any) => (
                <Typography sx={{ 
                    fontSize: '0.8rem', fontWeight: 600, color: DARK_NAVY,
                    textDecoration: row.status === 'Completed' ? 'line-through' : 'none',
                    opacity: row.status === 'Completed' ? 0.5 : 1,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden', lineHeight: 1.3
                }}>
                    {row.task_name}
                </Typography>
            )
        },
        { id: 'category', label: 'CATEGORY', render: (row: any) => <Typography sx={{ color: PRIMARY_RUST, fontWeight: 700, fontSize: '0.65rem' }}>{row.category.toUpperCase()}</Typography> },
        { id: 'due_date', label: 'DUE DATE', render: (row: any) => <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{new Date(row.due_date).toLocaleDateString('en-GB')}</Typography> },
        { id: 'owner', label: 'OWNER', render: (row: any) => <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{row.owner}</Typography> }
    ];

    return (
        <Box sx={{ p: 2, bgcolor: '#fcfcfc', minHeight: '100vh' }}>
            {/* Clickable Stat Cards Row */}
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
                <StatCard 
                    label="Completed" 
                    value={stats.completed} 
                    icon={<AssignmentCheckIcon sx={{fontSize: 18}}/>} 
                    color={SUCCESS_GREEN} 
                    active={activeFilter === 'completed'}
                    onClick={() => setActiveFilter(activeFilter === 'completed' ? 'all' : 'completed')}
                />
                <StatCard 
                    label="Pending" 
                    value={stats.pending} 
                    icon={<PendingActionsIcon sx={{fontSize: 18}}/>} 
                    color={DARK_NAVY} 
                    active={activeFilter === 'pending'}
                    onClick={() => setActiveFilter(activeFilter === 'pending' ? 'all' : 'pending')}
                />
                <StatCard 
                    label="Overdue" 
                    value={stats.overdue} 
                    icon={<EventBusyIcon sx={{fontSize: 18}}/>} 
                    color={PRIMARY_RUST} 
                    active={activeFilter === 'overdue'}
                    onClick={() => setActiveFilter(activeFilter === 'overdue' ? 'all' : 'overdue')}
                />
                <StatCard 
                    label="On Track" 
                    value={stats.onTrack} 
                    icon={<SpeedIcon sx={{fontSize: 18}}/>} 
                    color={WARNING_ORANGE} 
                    active={activeFilter === 'onTrack'}
                    onClick={() => setActiveFilter(activeFilter === 'onTrack' ? 'all' : 'onTrack')}
                />
            </Grid>

            {activeFilter !== 'all' && (
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                        label={`SHOWING: ${activeFilter.toUpperCase()}`} 
                        size="small" 
                        onDelete={() => setActiveFilter('all')}
                        sx={{ bgcolor: DARK_NAVY, color: '#fff', fontWeight: 700, fontSize: '0.65rem', '& .MuiChip-deleteIcon': { color: '#fff' } }}
                    />
                </Box>
            )}

            <DataTable
                title="Task Ledger"
                columns={columns}
                data={filteredTasks}
                primaryAction={{ label: 'New Task', onClick: () => { setEditData(null); setModalOpen(true); } }}
                onView={(id) => { setSelectedTask(tasks.find(t => t.id === id)); setViewOpen(true); }}
                onEdit={(id) => { setEditData(tasks.find(t => t.id === id)); setModalOpen(true); }}
                onDelete={(id) => setDeleteConfirm({ open: true, data: tasks.find(t => t.id === id) })}
            />

            {/* Modals & Dialogs */}
            <ViewTask open={viewOpen} onClose={() => setViewOpen(false)} data={selectedTask} />

            <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, data: null })} PaperProps={{ sx: { borderRadius: '12px', width: '350px' } }}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700, color: PRIMARY_RUST, pb: 1 }}>
                    <WarningAmberIcon /> Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        Remove <strong>{deleteConfirm.data?.task_name}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setDeleteConfirm({ open: false, data: null })} sx={{ color: 'text.secondary', textTransform: 'none' }}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} variant="contained" sx={{ bgcolor: PRIMARY_RUST, textTransform: 'none' }}>Delete Task</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '12px' } }}>
                <Box sx={{ p: 3 }}>
                    <Typography sx={{ fontWeight: 700, color: DARK_NAVY, mb: 2, fontSize: '1.1rem' }}>
                        {editData ? 'Update Task Details' : 'Create New Task'}
                    </Typography>
                    <AddTaskForm initialData={editData} onSuccess={handleFormSubmit} onClose={() => setModalOpen(false)} />
                </Box>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ borderRadius: '8px', fontWeight: 600 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

// StatCard with Click functionality and persistent coloring
const StatCard = ({ label, value, icon, color, active, onClick }: any) => (
    <Grid size={{ xs: 6, sm: 3 }}>
        <Paper 
            variant="outlined" 
            onClick={onClick}
            sx={{ 
                p: 1.5, 
                borderRadius: '10px', 
                borderLeft: `3px solid ${color}`,
                bgcolor: active ? alpha(color, 0.08) : alpha(color, 0.02),
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease-in-out',
                transform: active ? 'translateY(-2px)' : 'none',
                boxShadow: active ? `0 4px 12px ${alpha(color, 0.1)}` : 'none',
                '&:hover': onClick ? {
                    bgcolor: alpha(color, 0.1),
                    transform: 'translateY(-3px)',
                    boxShadow: `0 4px 12px ${alpha(color, 0.08)}`
                } : {}
            }}
        >
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ 
                    p: 0.8, 
                    borderRadius: '8px', 
                    bgcolor: active ? color : alpha(color, 0.1), 
                    color: active ? '#fff' : color, 
                    display: 'flex',
                    transition: '0.3s'
                }}>
                    {icon}
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 800, color: DARK_NAVY, fontSize: '0.95rem', lineHeight: 1.1 }}>
                        {value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: 0.5 }}>
                        {label}
                    </Typography>
                </Box>
            </Stack>
        </Paper>
    </Grid>
);