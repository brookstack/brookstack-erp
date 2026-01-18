import  { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box, Chip, alpha, Dialog, DialogContent, IconButton,
    Typography, Stack, CircularProgress, Snackbar, Alert, Button,
    DialogTitle, DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// Components
import { DataTable } from '../components/DataTable';
import { AddCustomerForm } from '../components/Customers/AddCustomer';
import { ViewCustomer } from '../components/Customers/ViewCustomer';

// --- DYNAMIC API CONFIGURATION ---
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://os.brookstack.com/api';

const PRIMARY_RUST = '#b52841';
const DARK_NAVY = '#1a202c';
const SANS_STACK = 'ui-sans-serif, system-ui, sans-serif';

export const CustomersPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const [viewMode, setViewMode] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
    const [editData, setEditData] = useState<any | null>(null);

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success'
    });

    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; data: any | null }>({
        open: false, data: null
    });

    const statusFilter = searchParams.get('status');

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/customers`);
            const data = await response.json();
            setCustomers(data);
        } catch (error) {
            setSnackbar({ open: true, message: 'Failed to fetch clients', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    const filteredCustomers = useMemo(() => {
        if (!statusFilter) return customers;
        return customers.filter(c => c.status?.toLowerCase() === statusFilter.toLowerCase());
    }, [customers, statusFilter]);

    // Helper for Human-Readable Date
    const formatHumanDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(new Date(dateString));
    };

    const handleView = (id: any) => {
        const client = customers.find(c => c.id == id);
        if (client) { setSelectedCustomer(client); setViewMode(true); }
    };

    const handleEdit = (id: any) => {
        const client = customers.find(c => c.id == id);
        if (client) { setEditData(client); setModalOpen(true); }
    };

    const triggerDelete = (id: any) => {
        const clientToDelete = customers.find(c => c.id == id);
        setDeleteConfirm({ open: true, data: clientToDelete });
    };

    const handleActualDelete = async () => {
        if (!deleteConfirm.data) return;
        const { id, companyName } = deleteConfirm.data;
        setIsDeleting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/customers/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setDeleteConfirm({ open: false, data: null });
                setSnackbar({ open: true, message: `Successfully removed "${companyName}"`, severity: 'success' });
                fetchCustomers();
            } else {
                setSnackbar({ open: true, message: 'Failed to delete client. Linked records may exist.', severity: 'error' });
                setDeleteConfirm({ open: false, data: null });
            }
        } catch (error) {
            setSnackbar({ open: true, message: 'Connection error', severity: 'error' });
            setDeleteConfirm({ open: false, data: null });
        } finally {
            setIsDeleting(false);
        }
    };

    const columns = [
        { 
            id: 'created_at', 
            label: 'ONBOARDED', 
            render: (row: any) => (
                <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarMonthIcon sx={{ fontSize: '0.9rem', color: PRIMARY_RUST }} />
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: DARK_NAVY }}>
                        {formatHumanDate(row.created_at)}
                    </Typography>
                </Stack>
            ) 
        },
        { id: 'companyName', label: 'COMPANY NAME' },
        { 
            id: 'clientType', 
            label: 'CLIENT TYPE',
            render: (row: any) => (
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>
                    {row.clientType}
                </Typography>
            )
        },
        { 
            id: 'serviceCategory', 
            label: 'CATEGORY',
            render: (row: any) => (
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>
                    {row.serviceCategory}
                </Typography>
            )
        },
        { id: 'accountManager', label: 'MANAGER' },
        {
            id: 'status',
            label: 'STATUS',
            render: (row: any) => {
                const statusConfig: any = {
                    active: { color: '#2ecc71', bg: alpha('#2ecc71', 0.1) },
                    lead: { color: '#0ea5e9', bg: alpha('#0ea5e9', 0.1) },
                };
                const config = statusConfig[row.status?.toLowerCase()] || { color: '#8a92a6', bg: '#f1f1f1' };
                return <Chip label={row.status?.toUpperCase()} size="small" sx={{ fontWeight: 800, fontSize: '0.6rem', backgroundColor: config.bg, color: config.color, borderRadius: '4px' }} />;
            }
        },
    ];

    return (
        <Box sx={{ width: '100%', p: viewMode ? 0 : 3 }}>
            {!viewMode && statusFilter && (
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2, p: 1.5, bgcolor: alpha(PRIMARY_RUST, 0.05), borderRadius: '8px', border: `1px solid ${alpha(PRIMARY_RUST, 0.1)}` }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: DARK_NAVY }}>
                        Filtering by: <span style={{ color: PRIMARY_RUST }}>{statusFilter.toUpperCase()}</span>
                    </Typography>
                    <Button 
                        size="small" 
                        startIcon={<FilterListOffIcon />} 
                        onClick={() => setSearchParams({})} 
                        sx={{ color: PRIMARY_RUST, textTransform: 'none', fontWeight: 700 }}
                    >
                        Clear Filter
                    </Button>
                </Stack>
            )}

            {loading ? (
                <Stack alignItems="center" py={10}><CircularProgress sx={{ color: PRIMARY_RUST }} /></Stack>
            ) : viewMode && selectedCustomer ? (
                <ViewCustomer
                    customer={selectedCustomer}
                    onBack={() => { setViewMode(false); setSelectedCustomer(null); }}
                />
            ) : (
                <DataTable
                    title="Clients"
                    columns={columns}
                    data={filteredCustomers}
                    primaryAction={{
                        label: 'Add Client',
                        onClick: () => { setEditData(null); setModalOpen(true); }
                    }}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={triggerDelete}
                />
            )}

            {/* Delete Confirmation */}
            <Dialog open={deleteConfirm.open} onClose={() => !isDeleting && setDeleteConfirm({ open: false, data: null })} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#d32f2f', fontWeight: 800, fontFamily: SANS_STACK }}>
                    <WarningAmberIcon color="error" /> Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: '0.9rem', color: '#4b5563' }}>
                        Are you sure you want to delete <strong>{deleteConfirm.data?.companyName}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button disabled={isDeleting} onClick={() => setDeleteConfirm({ open: false, data: null })} variant="outlined" sx={{ color: DARK_NAVY, fontWeight: 700 }}>Cancel</Button>
                    <Button disabled={isDeleting} onClick={handleActualDelete} variant="contained" sx={{ bgcolor: '#d32f2f', fontWeight: 700 }}>
                        {isDeleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Feedback Notifications */}
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: '100%', fontWeight: 600 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Add/Edit Modal */}
            <Dialog open={modalOpen} onClose={() => { setModalOpen(false); setEditData(null); }} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: '20px' } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2, borderBottom: '1px solid #f1f5f9' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: DARK_NAVY, fontFamily: SANS_STACK }}>
                        {editData ? `Edit Client: ${editData.companyName}` : 'Onboard New Client'}
                    </Typography>
                    <IconButton onClick={() => { setModalOpen(false); setEditData(null); }}><CloseIcon /></IconButton>
                </Stack>
                <DialogContent sx={{ py: 3 }}>
                    <AddCustomerForm
                        initialData={editData}
                        onSuccess={() => {
                            setModalOpen(false);
                            setEditData(null);
                            fetchCustomers();
                            setSnackbar({ open: true, message: editData ? 'Client details updated' : 'New client onboarded', severity: 'success' });
                        }}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
};