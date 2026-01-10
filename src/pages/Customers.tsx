import { useState, useEffect, useCallback } from 'react';
import {
    Box, Chip, alpha, Dialog, DialogContent, IconButton,
    Typography, Stack, CircularProgress, Snackbar, Alert, Button,
    DialogTitle, DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { DataTable } from '../components/DataTable';
import { AddCustomerForm } from '../components/Customers/AddCustomer';
import { ViewCustomer } from '../components/Customers/ViewCustomer';

const PRIMARY_RUST = '#b52841';
const DARK_NAVY = '#1a202c';

export const CustomersPage = () => {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    // View & Edit States
    const [viewMode, setViewMode] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
    const [editData, setEditData] = useState<any | null>(null);

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success'
    });

    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; data: any | null }>({
        open: false, data: null
    });

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/customers');
            const data = await response.json();
            setCustomers(data);
        } catch (error) {
            console.error("Fetch error:", error);
            setSnackbar({ open: true, message: 'Failed to fetch Brookstack clients', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

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
        try {
            const response = await fetch(`http://localhost:5000/api/customers/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setDeleteConfirm({ open: false, data: null });
                setSnackbar({ open: true, message: `Deleted "${companyName}"`, severity: 'success' });
                fetchCustomers();
            }
        } catch (error) {
            setSnackbar({ open: true, message: 'Delete failed', severity: 'error' });
        }
    };

    const columns = [
        { id: 'id', label: 'CLIENT ID' },
        { id: 'companyName', label: 'COMPANY NAME' },
        { id: 'clientType', label: 'CLIENT TYPE' },
        { id: 'serviceCategory', label: 'SERVICE CATEGORY' },
        { id: 'accountManager', label: 'ACC. MANAGER' },
        {
            id: 'status',
            label: 'STATUS',
            render: (row: any) => {
                const statusConfig: any = {
                    active: { color: '#2ecc71', bg: alpha('#2ecc71', 0.1) },
                    lead: { color: '#f1c40f', bg: alpha('#f1c40f', 0.1) },
                    inactive: { color: '#e74c3c', bg: alpha('#e74c3c', 0.1) },
                };
                const config = statusConfig[row.status?.toLowerCase()] || { color: '#8a92a6', bg: '#f1f1f1' };
                return <Chip label={row.status?.toUpperCase()} size="small" sx={{ fontWeight: 800, fontSize: '0.65rem', backgroundColor: config.bg, color: config.color }} />;
            }
        },
        { id: 'created_at', label: 'CREATED', render: (row: any) => new Date(row.created_at).toLocaleDateString('en-GB') },
    ];

    return (
        <Box sx={{ width: '100%', p: viewMode ? 0 : 3 }}>
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
                    data={customers}
                    primaryAction={{
                        label: 'Add Client',
                        onClick: () => { setEditData(null); setModalOpen(true); }
                    }}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={triggerDelete}
                />
            )}

            {/* --- REVISED DELETE CONFIRMATION DIALOG --- */}
            <Dialog
                open={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, data: null })}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#d32f2f', fontWeight: 800 }}>
                    <WarningAmberIcon color="error" /> Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>{deleteConfirm.data?.companyName}</strong>? 
                        This will remove all associated contact information from the database.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button 
                        onClick={() => setDeleteConfirm({ open: false, data: null })} 
                        variant="outlined" 
                        sx={{ color: DARK_NAVY, borderColor: DARK_NAVY }}
                    >
                        Keep Record
                    </Button>
                    <Button 
                        onClick={handleActualDelete} 
                        variant="contained" 
                        sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
                    >
                        Delete Permanently
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- NOTIFICATION SNACKBAR --- */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={5000} 
                onClose={() => setSnackbar({ ...snackbar, open: false })} 
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%', fontWeight: 600 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* --- Unified Add/Edit Modal --- */}
            <Dialog
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditData(null); }}
                fullWidth
                maxWidth="md"
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2, borderBottom: '1px solid #eee' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: DARK_NAVY }}>
                        {editData ? `Edit Client: ${editData.companyName}` : 'Onboard New Client'}
                    </Typography>
                    <IconButton onClick={() => { setModalOpen(false); setEditData(null); }}><CloseIcon /></IconButton>
                </Stack>
                <DialogContent sx={{ py: 4 }}>
                    <AddCustomerForm
                        initialData={editData}
                        onSuccess={() => {
                            setModalOpen(false);
                            setEditData(null);
                            fetchCustomers();
                            setSnackbar({
                                open: true,
                                message: editData ? 'Client details updated' : 'New client successfully onboarded',
                                severity: 'success'
                            });
                        }}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
};