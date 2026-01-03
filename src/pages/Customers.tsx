import { useState, useEffect, useCallback } from 'react';
import {
    Box, Chip, alpha, Dialog, DialogContent, IconButton,
    Typography, Stack, CircularProgress, Snackbar, Alert, Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DataTable } from '../components/DataTable';
import { AddCustomerForm } from '../components/Customers/AddCustomer';
import { ViewCustomer } from '../components/Customers/ViewCustomer';

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
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    // Handler for Viewing a Client
    const handleView = (id: any) => {
        const client = customers.find(c => c.id == id);
        if (client) {
            setSelectedCustomer(client);
            setViewMode(true);
        }
    };

    // Handler for Editing a Client
    const handleEdit = (id: any) => {
        const client = customers.find(c => c.id == id);
        if (client) {
            setEditData(client); // Set the specific record to be edited
            setModalOpen(true);   // Open the same modal used for Add
        }
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
        { id: 'created_at', label: 'CREATED', render: (row: any) => new Date(row.created_at).toLocaleDateString() },
    ];

    return (
        <Box sx={{ width: '100%', p: viewMode ? 0 : 3 }}>
            {loading ? (
                <Stack alignItems="center" py={10}><CircularProgress sx={{ color: '#b7410e' }} /></Stack>
            ) : viewMode && selectedCustomer ? (
                <ViewCustomer
                    customer={selectedCustomer}
                    onBack={() => {
                        setViewMode(false);
                        setSelectedCustomer(null);
                    }}
                />
            ) : (
                <>

                    <DataTable
                        title="Clients"
                        columns={columns}
                        data={customers}
                        primaryAction={{
                            label: 'Add Client',
                            onClick: () => {
                                setEditData(null); // Ensure no old data is present
                                setModalOpen(true);
                            }
                        }}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={triggerDelete}
                    />
                </>
            )}

            {/* --- SNACKBARS & ALERTS --- */}
            <Snackbar
                open={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, data: null })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity="error" variant="filled" action={
                    <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
                        <Button color="inherit" size="small" onClick={() => setDeleteConfirm({ open: false, data: null })}>CANCEL</Button>
                        <Button variant="contained" size="small" onClick={handleActualDelete} sx={{ bgcolor: 'white', color: '#d32f2f' }}>CONFIRM</Button>
                    </Stack>
                }>
                    Delete <strong>{deleteConfirm.data?.companyName}</strong>?
                </Alert>
            </Snackbar>

            <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
            </Snackbar>

            {/* --- Unified Add/Edit Modal --- */}
            <Dialog
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditData(null); }}
                fullWidth
                maxWidth="md"
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {editData ? `Edit: ${editData.companyName}` : 'Add New Client'}
                    </Typography>
                    <IconButton onClick={() => { setModalOpen(false); setEditData(null); }}><CloseIcon /></IconButton>
                </Stack>
                <DialogContent sx={{ pt: 0, pb: 4 }}>
                    <AddCustomerForm
                        initialData={editData} // Pass the customer if editing, or null if adding
                        onSuccess={() => {
                            setModalOpen(false);
                            setEditData(null);
                            fetchCustomers();
                            setSnackbar({
                                open: true,
                                message: editData ? 'Client updated successfully' : 'Client onboarded successfully',
                                severity: 'success'
                            });
                        }}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
};