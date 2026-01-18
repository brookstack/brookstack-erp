import React, { useEffect, useState, useCallback } from 'react';
import {
    Box, Chip, alpha, Dialog, DialogContent, IconButton,
    Typography, Stack, CircularProgress, Snackbar, Alert, Button,
    DialogTitle, DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// Components
import { DataTable } from '../components/DataTable';
import { AddStaffForm } from '../components/Users/AddUser';
import { API_BASE_URL } from '../config/api';

const PRIMARY_RUST = '#b52841';
const DARK_NAVY = '#1a202c';
const SANS_STACK = 'ui-sans-serif, system-ui, sans-serif';

interface User {
    id: number;
    full_name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    created_at?: string;
    createdAt?: string; // Added variation
    date_added?: string; // Added variation
}

export const StaffPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState<User | null>(null);

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success'
    });

    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; data: User | null }>({
        open: false, data: null
    });

    const fetchStaff = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            // Defensive check to ensure we set an array
            const actualData = Array.isArray(data) ? data : (data.users || data.data || []);
            setUsers(actualData);
        } catch (error) {
            setSnackbar({ open: true, message: 'Failed to fetch staff members', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchStaff(); }, [fetchStaff]);

    // Enhanced helper that tries multiple keys
    const formatHumanDate = (row: any) => {
        const rawDate = row.created_at || row.createdAt || row.date_added;
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

    const handleEdit = (id: any) => {
        const staff = users.find(u => u.id == id);
        if (staff) { setEditData(staff); setModalOpen(true); }
    };

    const triggerDelete = (id: any) => {
        const staffToDelete = users.find(u => u.id == id);
        if (staffToDelete) { setDeleteConfirm({ open: true, data: staffToDelete }); }
    };

    const handleActualDelete = async () => {
        if (!deleteConfirm.data) return;
        const { id, full_name } = deleteConfirm.data;
        setIsDeleting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/users/${id}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                setDeleteConfirm({ open: false, data: null });
                setSnackbar({ open: true, message: `Successfully removed ${full_name}`, severity: 'success' });
                fetchStaff();
            } else {
                setSnackbar({ open: true, message: 'Could not delete staff member', severity: 'error' });
            }
        } catch (error) {
            setSnackbar({ open: true, message: 'Connection error', severity: 'error' });
        } finally {
            setIsDeleting(false);
        }
    };

    const columns = [
        { 
            id: 'created_at', 
            label: 'ONBOARDED',
            render: (row: User) => (
                <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarMonthIcon sx={{ fontSize: '0.9rem', color: PRIMARY_RUST }} />
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: DARK_NAVY }}>
                        {formatHumanDate(row)}
                    </Typography>
                </Stack>
            )
        },
        { id: 'full_name', label: 'FULL NAME' },
        { 
            id: 'email', 
            label: 'EMAIL',
            render: (row: User) => (
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                    {row.email}
                </Typography>
            )
        },
        { 
            id: 'role', 
            label: 'SYSTEM ROLE',
            render: (row: User) => (
                <Typography sx={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 800, 
                    color: '#64748b', 
                    bgcolor: '#f8fafc', 
                    px: 1, py: 0.5, 
                    borderRadius: '4px', 
                    border: '1px solid #f1f5f9', 
                    display: 'inline-block' 
                }}>
                    {row.role?.toUpperCase()}
                </Typography>
            )
        },
        {
            id: 'status',
            label: 'STATUS',
            render: (row: User) => {
                const isActive = row.status?.toLowerCase() === 'active';
                return (
                    <Chip 
                        label={row.status?.toUpperCase()} 
                        size="small" 
                        sx={{ 
                            fontWeight: 800, 
                            fontSize: '0.6rem', 
                            backgroundColor: isActive ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1), 
                            color: isActive ? '#10b981' : '#ef4444',
                            borderRadius: '4px'
                        }} 
                    />
                );
            }
        }
    ];

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            {loading ? (
                <Stack alignItems="center" py={10}><CircularProgress sx={{ color: PRIMARY_RUST }} /></Stack>
            ) : (
                <DataTable
                    title="Staff Management"
                    columns={columns}
                    data={users}
                    primaryAction={{
                        label: 'Add Staff Member',
                        onClick: () => { setEditData(null); setModalOpen(true); }
                    }}
                    onEdit={handleEdit}
                    onDelete={triggerDelete}
                />
            )}

            <Dialog open={deleteConfirm.open} onClose={() => !isDeleting && setDeleteConfirm({ open: false, data: null })} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#d32f2f', fontWeight: 800, fontFamily: SANS_STACK }}>
                    <WarningAmberIcon color="error" /> Delete Staff Account
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: '0.9rem', color: '#4b5563' }}>
                        Are you sure you want to remove <strong>{deleteConfirm.data?.full_name}</strong>? 
                        Access will be revoked immediately.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button disabled={isDeleting} onClick={() => setDeleteConfirm({ open: false, data: null })} variant="outlined" sx={{ color: DARK_NAVY, fontWeight: 700 }}>Cancel</Button>
                    <Button disabled={isDeleting} onClick={handleActualDelete} variant="contained" sx={{ bgcolor: '#d32f2f', fontWeight: 700 }}>
                        {isDeleting ? <CircularProgress size={20} color="inherit" /> : 'Confirm Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: '100%', fontWeight: 600, borderRadius: '8px' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <Dialog open={modalOpen} onClose={() => { setModalOpen(false); setEditData(null); }} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '20px' } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2, borderBottom: '1px solid #f1f5f9' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: DARK_NAVY, fontFamily: SANS_STACK }}>
                        {editData ? `Update Profile: ${editData.full_name}` : 'Onboard New Staff'}
                    </Typography>
                    <IconButton onClick={() => { setModalOpen(false); setEditData(null); }}><CloseIcon /></IconButton>
                </Stack>
                <DialogContent sx={{ py: 3 }}>
                    <AddStaffForm
                        initialData={editData}
                        onSuccess={() => {
                            setModalOpen(false);
                            setEditData(null);
                            fetchStaff();
                            setSnackbar({ open: true, message: editData ? 'Account updated' : 'Staff account created', severity: 'success' });
                        }}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
};