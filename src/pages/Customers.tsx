import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box, Chip, alpha, Dialog, DialogContent, IconButton,
    Typography, Stack, CircularProgress, Snackbar, Alert, Button,
    DialogTitle, DialogActions, Grid, Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import HubIcon from '@mui/icons-material/Hub';
import PersonOffIcon from '@mui/icons-material/PersonOff';

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
const CUSTOMER_NAVY = '#365fb3ff';
const SUCCESS_GREEN = '#2ecc71';
const LEAD_BLUE = '#0ea5e9';
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
            setCustomers(Array.isArray(data) ? data : []);
        } catch (error) {
            setSnackbar({ open: true, message: 'Failed to fetch clients', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    // Statistics Calculation for Cards
    const stats = useMemo(() => {
        return {
            total: customers.length,
            active: customers.filter(c => c.status?.toLowerCase() === 'active').length,
            leads: customers.filter(c => c.status?.toLowerCase() === 'lead').length,
            inactive: customers.filter(c => c.status?.toLowerCase() === 'inactive').length,
        };
    }, [customers]);

    const filteredCustomers = useMemo(() => {
        if (!statusFilter) return customers;
        return customers.filter(c => c.status?.toLowerCase() === statusFilter.toLowerCase());
    }, [customers, statusFilter]);

    const formatHumanDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
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
        setIsDeleting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/customers/${deleteConfirm.data.id}`, { method: 'DELETE' });
            if (response.ok) {
                setDeleteConfirm({ open: false, data: null });
                setSnackbar({ open: true, message: `Successfully removed client`, severity: 'success' });
                fetchCustomers();
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
        { id: 'clientType', label: 'CLIENT TYPE' },
        { id: 'accountManager', label: 'MANAGER' },
        {
            id: 'status',
            label: 'STATUS',
            render: (row: any) => {
                const statusConfig: any = {
                    active: { color: SUCCESS_GREEN, bg: alpha(SUCCESS_GREEN, 0.1) },
                    lead: { color: LEAD_BLUE, bg: alpha(LEAD_BLUE, 0.1) },
                    inactive: { color: PRIMARY_RUST, bg: alpha(PRIMARY_RUST, 0.1) },
                };
                const config = statusConfig[row.status?.toLowerCase()] || { color: '#8a92a6', bg: '#f1f1f1' };
                return <Chip label={row.status?.toUpperCase()} size="small" sx={{ fontWeight: 800, fontSize: '0.6rem', backgroundColor: config.bg, color: config.color, borderRadius: '4px' }} />;
            }
        },
    ];

    return (
        <Box sx={{ width: '100%', p: viewMode ? 0 : 3, bgcolor: '#fcfcfc', minHeight: '100vh' }}>
            
            {!viewMode && (
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <StatCard 
                        label="Total Clients" value={stats.total} icon={<GroupsIcon sx={{fontSize: 18}}/>} color={CUSTOMER_NAVY} 
                        active={!statusFilter} onClick={() => setSearchParams({})}
                    />
                    <StatCard 
                        label="Active Clients" value={stats.active} icon={<ToggleOnIcon sx={{fontSize: 18}}/>} color={SUCCESS_GREEN} 
                        active={statusFilter === 'active'} onClick={() => setSearchParams({status: 'active'})}
                    />
                    <StatCard 
                        label="Client Leads" value={stats.leads} icon={<HubIcon sx={{fontSize: 18}}/>} color={LEAD_BLUE} 
                        active={statusFilter === 'lead'} onClick={() => setSearchParams({status: 'lead'})}
                    />
                    <StatCard 
                        label="Inactive" value={stats.inactive} icon={<PersonOffIcon sx={{fontSize: 18}}/>} color={PRIMARY_RUST} 
                        active={statusFilter === 'inactive'} onClick={() => setSearchParams({status: 'inactive'})}
                    />
                </Grid>
            )}

            {!viewMode && statusFilter && (
                <Box sx={{ mb: 2 }}>
                    <Chip 
                        label={`FILTER: ${statusFilter.toUpperCase()}`} 
                        size="small" onDelete={() => setSearchParams({})}
                        sx={{ bgcolor: DARK_NAVY, color: '#fff', fontWeight: 700, fontSize: '0.65rem' }}
                    />
                </Box>
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
                    title="Clients Ledger"
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

            {/* Modals & Dialogs */}
            <Dialog open={deleteConfirm.open} onClose={() => !isDeleting && setDeleteConfirm({ open: false, data: null })} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '15px' } }}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: PRIMARY_RUST, fontWeight: 800 }}>
                    <WarningAmberIcon color="error" /> Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: '0.9rem' }}>Are you sure you want to delete <strong>{deleteConfirm.data?.companyName}</strong>?</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button disabled={isDeleting} onClick={() => setDeleteConfirm({ open: false, data: null })}>Cancel</Button>
                    <Button disabled={isDeleting} onClick={handleActualDelete} variant="contained" sx={{ bgcolor: PRIMARY_RUST }}>Delete</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={modalOpen} onClose={() => { setModalOpen(false); setEditData(null); }} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: '20px' } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2, borderBottom: '1px solid #f1f5f9' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: DARK_NAVY }}>
                        {editData ? 'Edit Client Details' : 'Onboard New Client'}
                    </Typography>
                    <IconButton onClick={() => { setModalOpen(false); setEditData(null); }}><CloseIcon /></IconButton>
                </Stack>
                <DialogContent sx={{ py: 3 }}>
                    <AddCustomerForm initialData={editData} onSuccess={() => { setModalOpen(false); setEditData(null); fetchCustomers(); }} />
                </DialogContent>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} variant="filled" sx={{ fontWeight: 600 }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

const StatCard = ({ label, value, icon, color, active, onClick }: any) => (
    <Grid size={{ xs: 6, sm: 3 }}>
        <Paper 
            variant="outlined" onClick={onClick}
            sx={{ 
                p: 2, borderRadius: '12px', borderLeft: `4px solid ${color}`,
                bgcolor: active ? alpha(color, 0.08) : alpha(color, 0.02),
                cursor: 'pointer', transition: 'all 0.2s ease',
                transform: active ? 'translateY(-2px)' : 'none',
                boxShadow: active ? `0 4px 12px ${alpha(color, 0.1)}` : 'none',
                '&:hover': { bgcolor: alpha(color, 0.1), transform: 'translateY(-3px)' }
            }}
        >
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: active ? color : alpha(color, 0.1), color: active ? '#fff' : color, display: 'flex' }}>
                    {icon}
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 800, color: DARK_NAVY, fontSize: '1.1rem', lineHeight: 1 }}>{value}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: 0.5 }}>{label}</Typography>
                </Box>
            </Stack>
        </Paper>
    </Grid>
);