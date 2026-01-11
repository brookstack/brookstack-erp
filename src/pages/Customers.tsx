import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom'; // Added to read URL params
import {
    Box, Chip, alpha, Dialog, DialogContent, IconButton,
    Typography, Stack, CircularProgress, Snackbar, Alert, Button,
    DialogTitle, DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FilterListOffIcon from '@mui/icons-material/FilterListOff'; // For the clear filter button

// Components
import { DataTable } from '../components/DataTable';
import { AddCustomerForm } from '../components/Customers/AddCustomer';
import { ViewCustomer } from '../components/Customers/ViewCustomer';

const PRIMARY_RUST = '#b52841';
const DARK_NAVY = '#1a202c';
const SANS_STACK = 'ui-sans-serif, system-ui, sans-serif';

export const CustomersPage = () => {
    const [searchParams, setSearchParams] = useSearchParams(); // Hook for filtering
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

    // 1. Get the filter from the URL (?status=lead)
    const statusFilter = searchParams.get('status');

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/customers');
            const data = await response.json();
            setCustomers(data);
        } catch (error) {
            console.error("Fetch error:", error);
            setSnackbar({ open: true, message: 'Failed to fetch clients', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    // 2. Memoized Filter Logic: Only shows customers matching the URL param
    const filteredCustomers = useMemo(() => {
        if (!statusFilter) return customers;
        return customers.filter(c => c.status?.toLowerCase() === statusFilter.toLowerCase());
    }, [customers, statusFilter]);

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
            const response = await fetch(`http://localhost:5000/api/customers/${id}`, { method: 'DELETE' });
            const result = await response.json();

            if (response.ok) {
                setDeleteConfirm({ open: false, data: null });
                setSnackbar({ open: true, message: `Successfully removed "${companyName}"`, severity: 'success' });
                fetchCustomers();
            } else {
                const errorDetail = result.details?.includes('foreign key constraint fails') 
                    ? "Cannot delete client: Existing billing records are linked to this account."
                    : (result.details || result.error || 'Delete failed');

                setSnackbar({ open: true, message: errorDetail, severity: 'error' });
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
                    lead: { color: '#0ea5e9', bg: alpha('#0ea5e9', 0.1) }, // Updated to match LEAD_BLUE
                    inactive: { color: '#e74c3c', bg: alpha('#e74c3c', 0.1) },
                };
                const config = statusConfig[row.status?.toLowerCase()] || { color: '#8a92a6', bg: '#f1f1f1' };
                return <Chip label={row.status?.toUpperCase()} size="small" sx={{ fontWeight: 800, fontSize: '0.65rem', backgroundColor: config.bg, color: config.color, borderRadius: '4px' }} />;
            }
        },
        { id: 'created_at', label: 'CREATED', render: (row: any) => new Date(row.created_at).toLocaleDateString('en-GB') },
    ];

    return (
        <Box sx={{ width: '100%', p: viewMode ? 0 : 3 }}>
            {/* Header / Active Filter Display */}
            {!viewMode && statusFilter && (
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2, p: 1.5, bgcolor: alpha(PRIMARY_RUST, 0.05), borderRadius: '8px', border: `1px solid ${alpha(PRIMARY_RUST, 0.1)}` }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: DARK_NAVY }}>
                        Currently filtering by status: <span style={{ color: PRIMARY_RUST }}>{statusFilter.toUpperCase()}</span>
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
                    data={filteredCustomers} // Use filtered data here
                    primaryAction={{
                        label: 'Add Client',
                        onClick: () => { setEditData(null); setModalOpen(true); }
                    }}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={triggerDelete}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirm.open} onClose={() => !isDeleting && setDeleteConfirm({ open: false, data: null })} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#d32f2f', fontWeight: 800, fontFamily: SANS_STACK }}>
                    <WarningAmberIcon color="error" /> Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: '0.9rem', color: '#4b5563' }}>
                        Are you sure you want to delete <strong>{deleteConfirm.data?.companyName}</strong>? 
                        The system will verify dependencies before removal.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button disabled={isDeleting} onClick={() => setDeleteConfirm({ open: false, data: null })} variant="outlined" sx={{ color: DARK_NAVY, borderColor: '#e2e8f0', fontWeight: 700 }}>Cancel</Button>
                    <Button disabled={isDeleting} onClick={handleActualDelete} variant="contained" sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' }, fontWeight: 700 }}>
                        {isDeleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notifications */}
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: '100%', fontWeight: 600, borderRadius: '8px' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Add/Edit Modal */}
            <Dialog open={modalOpen} onClose={() => { setModalOpen(false); setEditData(null); }} fullWidth maxWidth="md">
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2, borderBottom: '1px solid #eee' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: DARK_NAVY, fontFamily: SANS_STACK }}>
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
                            setSnackbar({ open: true, message: editData ? 'Client updated' : 'Client onboarded', severity: 'success' });
                        }}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
};