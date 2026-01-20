import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Typography, Stack, Checkbox, 
    Dialog, DialogContent, Snackbar, Alert, Paper, alpha,
    DialogTitle, DialogActions, Button,
    Grid
} from '@mui/material';
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
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; data: any | null }>({ open: false, data: null });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const fetchTasks = async () => {
        try {
            const res = await axios.get(API_BASE_URL);
            setTasks(res.data);
        } catch (err) {
            setSnackbar({ open: true, message: 'Server Connection Error', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTasks(); }, []);

    const handleToggleStatus = async (task: any) => {
        const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
        try {
            await axios.put(`${API_BASE_URL}/${task.id}`, { status: newStatus });
            fetchTasks();
        } catch (err) {
            setSnackbar({ open: true, message: 'Update failed', severity: 'error' });
        }
    };

    const handleFormSubmit = async (formData: any) => {
        try {
            if (editData) {
                await axios.put(`${API_BASE_URL}/${editData.id}`, formData);
            } else {
                await axios.post(API_BASE_URL, { ...formData, owner: CURRENT_USER });
            }
            setModalOpen(false);
            fetchTasks();
            setSnackbar({ open: true, message: 'Task Updated', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, message: 'Error saving task', severity: 'error' });
        }
    };

    const handleConfirmDelete = async () => {
        if (deleteConfirm.data) {
            try {
                await axios.delete(`${API_BASE_URL}/${deleteConfirm.data.id}`);
                fetchTasks();
                setSnackbar({ open: true, message: 'Task removed', severity: 'success' });
            } catch (err) {
                setSnackbar({ open: true, message: 'Delete failed', severity: 'error' });
            }
        }
        setDeleteConfirm({ open: false, data: null });
    };

    const stats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return {
            completed: tasks.filter(t => t.status === 'Completed').length,
            pending: tasks.filter(t => t.status === 'Pending').length,
            overdue: tasks.filter(t => t.status === 'Pending' && new Date(t.due_date) < today).length,
            onTrack: tasks.filter(t => t.status === 'Completed' || (t.status === 'Pending' && new Date(t.due_date) >= today)).length,
        };
    }, [tasks]);

    const columns = [
        { 
            id: 'status', 
            label: 'DONE',
            render: (row: any) => (
                <Checkbox 
                    checked={row.status === 'Completed'}
                    onChange={() => handleToggleStatus(row)}
                    sx={{ color: '#cbd5e1', '&.Mui-checked': { color: SUCCESS_GREEN } }}
                />
            )
        },
        { 
            id: 'task_name', 
            label: 'TASK DESCRIPTION',
            render: (row: any) => (
                <Typography sx={{ 
                    fontSize: '0.85rem', fontWeight: 500, color: DARK_NAVY,
                    textDecoration: row.status === 'Completed' ? 'line-through' : 'none',
                    opacity: row.status === 'Completed' ? 0.5 : 1,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.4, maxWidth: '400px'
                }}>
                    {row.task_name}
                </Typography>
            )
        },
        { id: 'category', label: 'CATEGORY', render: (row: any) => <Typography sx={{ color: PRIMARY_RUST, fontWeight: 800, fontSize: '0.65rem' }}>{row.category.toUpperCase()}</Typography> },
        { id: 'due_date', label: 'DUE DATE', render: (row: any) => <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{new Date(row.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</Typography> },
        { id: 'owner', label: 'OWNER', render: (row: any) => <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: 'text.secondary' }}>{row.owner}</Typography> }
    ];

    return (
        <Box sx={{ p: 3, bgcolor: '#fcfcfc', minHeight: '100vh' }}>
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <StatCard label="Completed" value={stats.completed} icon={<AssignmentCheckIcon />} color={SUCCESS_GREEN} />
                <StatCard label="Incomplete" value={stats.pending} icon={<PendingActionsIcon />} color={DARK_NAVY} />
                <StatCard label="Overdue" value={stats.overdue} icon={<EventBusyIcon />} color={PRIMARY_RUST} />
                <StatCard label="On Track" value={stats.onTrack} icon={<SpeedIcon />} color={WARNING_ORANGE} />
            </Grid>

            <DataTable
                title="Task Ledger"
                columns={columns}
                data={tasks}
                primaryAction={{ label: 'New Task', onClick: () => { setEditData(null); setModalOpen(true); } }}
                onView={(id) => { setSelectedTask(tasks.find(t => t.id === id)); setViewOpen(true); }}
                onEdit={(id) => { setEditData(tasks.find(t => t.id === id)); setModalOpen(true); }}
                onDelete={(id) => setDeleteConfirm({ open: true, data: tasks.find(t => t.id === id) })}
            />

            <ViewTask open={viewOpen} onClose={() => setViewOpen(false)} data={selectedTask} />

            <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, data: null })}>
                <DialogTitle sx={{ fontWeight: 800, color: PRIMARY_RUST }}><WarningAmberIcon sx={{ mr: 1 }} /> Delete Task?</DialogTitle>
                <DialogContent><Typography variant="body2">Remove <strong>{deleteConfirm.data?.task_name}</strong>?</Typography></DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteConfirm({ open: false, data: null })}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} variant="contained" sx={{ bgcolor: PRIMARY_RUST }}>Delete</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="xs">
                <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>{editData ? 'Edit Task' : 'New Task'}</Typography>
                    <AddTaskForm initialData={editData} onSuccess={handleFormSubmit} />
                </Box>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

const StatCard = ({ label, value, icon, color }: any) => (
    <Grid size={{ xs: 6, sm: 3 }}>
        <Paper variant="outlined" sx={{ 
            p: 2, borderRadius: '12px', 
            border: `1.5px solid ${alpha(color, 0.45)}`, // Sharper/Darker outline
            bgcolor: '#fff',
            '&:hover': { transform: 'translateY(-2px)', transition: '0.2s' }
        }}>
            <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: alpha(color, 0.1), color: color, display: 'flex' }}>{icon}</Box>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1 }}>{value}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.6rem' }}>{label}</Typography>
                </Box>
            </Stack>
        </Paper>
    </Grid>
);