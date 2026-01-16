import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Stack, Chip, Tabs, Tab,
    Paper, alpha, Button, CircularProgress,
    Dialog, DialogContent, Grid, Snackbar, Alert,
    DialogTitle, DialogActions
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

// Components
import { AddBillingForm } from '../Billing/AddBilling';
import { ViewInvoice } from '../Billing/ViewBill';
import { ViewPayment } from '../Payments/ViewPayment';
import { AddProjectForm } from '../Projects/AddProject'; 
import { DataTable } from '../DataTable';
import { API_BASE_URL } from '../../config/api';

const RUST_COLOR = '#b52841';
const DARK_NAVY = '#1a202c';
const SUCCESS_COLOR = '#198754';
const WARNING_COLOR = '#f39c12';

interface ViewCustomerProps {
    customer: any;
    onBack: () => void;
}

export const ViewCustomer: React.FC<ViewCustomerProps> = ({ customer, onBack }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [billingRecords, setBillingRecords] = useState<any[]>([]);
    const [paymentRecords, setPaymentRecords] = useState<any[]>([]);
    const [projectRecords, setProjectRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal States
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

    // Selected Data for View/Edit
    const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
    const [editData, setEditData] = useState<any | null>(null);

    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; type: 'billing' | 'payments' | 'projects'; data: any | null }>({
        open: false, type: 'billing', data: null
    });

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const fetchClientData = useCallback(async () => {
        setLoading(true);
        try {
            const [billRes, payRes, projRes] = await Promise.all([
                fetch(`${API_BASE_URL}/billing`),
                fetch(`${API_BASE_URL}/payments`),
                fetch(`${API_BASE_URL}/projects`)
            ]);

            const billData = await billRes.json();
            const payData = await payRes.json();
            const projData = await projRes.json();

            // 1. Filter Projects and Invoices by Customer ID
            const filteredBills = billData.filter((b: any) => Number(b.client_id) === Number(customer.id));
            const filteredProjs = projData.filter((p: any) => Number(p.client_id) === Number(customer.id));

            setBillingRecords(filteredBills);
            setProjectRecords(filteredProjs);

            // 2. Filter Payments linked to this customer's Invoices
            const customerBillIds = new Set(filteredBills.map((b: any) => Number(b.id)));
            const filteredPayments = payData.filter((p: any) => customerBillIds.has(Number(p.billing_id)));
            
            setPaymentRecords(filteredPayments);

        } catch (error) {
            setSnackbar({ open: true, message: 'Sync failed', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [customer.id]);

    useEffect(() => { fetchClientData(); }, [fetchClientData]);

    const handleActualDelete = async () => {
        if (!deleteConfirm.data?.id) return;
        try {
            const response = await fetch(`${API_BASE_URL}/${deleteConfirm.type}/${deleteConfirm.data.id}`, { method: 'DELETE' });
            if (response.ok) {
                setSnackbar({ open: true, message: 'Deleted successfully', severity: 'success' });
                fetchClientData();
            } else throw new Error('Delete failed');
        } catch (err: any) {
            setSnackbar({ open: true, message: err.message, severity: 'error' });
        } finally {
            setDeleteConfirm({ ...deleteConfirm, open: false });
        }
    };

    // Columns Definitions
    const projectColumns = [
        { id: 'project_name', label: 'PROJECT NAME', render: (row: any) => <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>{row.project_name}</Typography> },
        { id: 'project_type', label: 'TECH TYPE', render: (row: any) => <Chip label={row.project_type} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} /> },
        {
            id: 'status',
            label: 'STAGE',
            render: (row: any) => {
                const colors: any = { discovery: '#64748b', development: '#0ea5e9', completed: SUCCESS_COLOR };
                const color = colors[row.status?.toLowerCase()] || WARNING_COLOR;
                return <Chip label={row.status?.toUpperCase()} size="small" sx={{ bgcolor: alpha(color, 0.1), color, fontWeight: 800, fontSize: '0.6rem' }} />;
            }
        },
        { id: 'lead', label: 'LEAD', render: (row: any) => <Typography sx={{ fontSize: '0.8rem' }}>{row.leadStaffName || 'Unassigned'}</Typography> }
    ];

    const billingColumns = [
        { id: 'doc_no', label: 'DOCUMENT', render: (row: any) => <Box><Typography sx={{ fontSize: '0.75rem', color: RUST_COLOR, fontWeight: 700 }}>{row.doc_no}</Typography><Typography variant="caption">{row.type}</Typography></Box> },
        { id: 'grand_total', label: 'TOTAL', render: (row: any) => <Typography sx={{ fontSize: '0.85rem' }}>{row.currency} {Number(row.grand_total).toLocaleString()}</Typography> },
        { id: 'balance', label: 'BALANCE', render: (row: any) => <Typography sx={{ fontSize: '0.85rem', color: RUST_COLOR, fontWeight: 700 }}>{row.currency} {(Number(row.grand_total) - Number(row.total_paid || 0)).toLocaleString()}</Typography> }
    ];

    const paymentColumns = [
        { id: 'payment_date', label: 'DATE', render: (row: any) => new Date(row.payment_date).toLocaleDateString() },
        { id: 'amount', label: 'AMOUNT PAID', render: (row: any) => <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: SUCCESS_COLOR }}>{row.currency} {Number(row.amount).toLocaleString()}</Typography> },
        { id: 'method', label: 'METHOD', render: (row: any) => <Chip label={row.payment_method} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} /> },
        { id: 'ref', label: 'REFERENCE', render: (row: any) => <Typography variant="caption">{row.reference_no || '-'}</Typography> }
    ];

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fcfcfc', minHeight: '100vh' }}>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ color: '#666', mb: 3, textTransform: 'none', fontWeight: 600 }}>Back to Clients</Button>

            <Stack spacing={0.5} sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: DARK_NAVY }}>{customer.companyName}</Typography>
                <Chip label={customer.status?.toUpperCase() || 'ACTIVE'} size="small" sx={{ width: 'fit-content', fontWeight: 800, borderRadius: '6px' }} />
            </Stack>

            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', '& .Mui-selected': { color: RUST_COLOR } }} TabIndicatorProps={{ sx: { bgcolor: RUST_COLOR } }}>
                <Tab label="Overview" sx={{ textTransform: 'none', fontWeight: 700 }} />
                <Tab label="Projects" sx={{ textTransform: 'none', fontWeight: 700 }} />
                <Tab label="Invoices" sx={{ textTransform: 'none', fontWeight: 700 }} />
                <Tab label="Payments" sx={{ textTransform: 'none', fontWeight: 700 }} />
            </Tabs>

            {loading ? <Stack alignItems="center" py={10}><CircularProgress size={30} sx={{ color: RUST_COLOR }} /></Stack> : (
                <Box>
                    {activeTab === 0 && (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 4 }}><InfoCard title="Identity" icon={<ContactPageIcon sx={{ color: RUST_COLOR }} />}><DetailItem label="Contact" value={customer.contactPerson} /><DetailItem label="Type" value={customer.clientType} /></InfoCard></Grid>
                            <Grid size={{ xs: 12, md: 4 }}><InfoCard title="Comms" icon={<SupportAgentIcon sx={{ color: RUST_COLOR }} />}><DetailItem label="Email" value={customer.email} highlight /><DetailItem label="Mobile" value={customer.mobile} /></InfoCard></Grid>
                            <Grid size={{ xs: 12, md: 4 }}><InfoCard title="Location" icon={<LocationOnIcon sx={{ color: RUST_COLOR }} />}><DetailItem label="City" value={customer.city} /><DetailItem label="Building" value={customer.building} /></InfoCard></Grid>
                        </Grid>
                    )}

                    {activeTab === 1 && (
                        <DataTable
                            title="Client Projects"
                            columns={projectColumns}
                            data={projectRecords}
                            primaryAction={{ label: 'New Project', onClick: () => { setEditData(null); setIsProjectModalOpen(true); } }}
                            onEdit={(id) => { setEditData(projectRecords.find(p => p.id === id)); setIsProjectModalOpen(true); }}
                            onDelete={(id) => setDeleteConfirm({ open: true, type: 'projects', data: projectRecords.find(p => p.id === id) })}
                        />
                    )}

                    {activeTab === 2 && (
                        selectedInvoice ? <ViewInvoice data={selectedInvoice} onBack={() => setSelectedInvoice(null)} /> :
                            <DataTable
                                title="Billing History"
                                columns={billingColumns}
                                data={billingRecords}
                                primaryAction={{ label: 'New Invoice', onClick: () => { setEditData(null); setIsInvoiceModalOpen(true); } }}
                                onView={(id) => setSelectedInvoice(billingRecords.find(r => r.id === id))}
                                onEdit={(id) => { setEditData(billingRecords.find(r => r.id === id)); setIsInvoiceModalOpen(true); }}
                                onDelete={(id) => setDeleteConfirm({ open: true, type: 'billing', data: billingRecords.find(r => r.id === id) })}
                            />
                    )}

                    {activeTab === 3 && (
                        selectedPayment ? <ViewPayment data={selectedPayment} onBack={() => setSelectedPayment(null)} /> :
                            <DataTable
                                title="Transactions"
                                columns={paymentColumns}
                                data={paymentRecords}
                                onView={(id) => setSelectedPayment(paymentRecords.find(p => p.id === id))}
                                onDelete={(id) => setDeleteConfirm({ open: true, type: 'payments', data: paymentRecords.find(p => p.id === id) })}
                            />
                    )}
                </Box>
            )}

            {/* --- PROJECT MODAL --- */}
            <Dialog open={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} fullWidth maxWidth="md">
                <DialogContent sx={{ p: 4 }}>
                    <AddProjectForm
                        initialData={editData}
                        selectedClient={customer}
                        onSuccess={() => { setIsProjectModalOpen(false); fetchClientData(); setSnackbar({ open: true, message: 'Project Updated', severity: 'success' }); }}
                        onError={(msg) => setSnackbar({ open: true, message: msg, severity: 'error' })}
                    />
                </DialogContent>
            </Dialog>

            {/* --- INVOICE MODAL --- */}
            <Dialog open={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} fullWidth maxWidth="md">
                <DialogContent sx={{ p: 4 }}>
                    <AddBillingForm
                        initialData={editData}
                        selectedClient={customer}
                        customers={[customer]}
                        onSuccess={() => { setIsInvoiceModalOpen(false); fetchClientData(); setSnackbar({ open: true, message: 'Ledger Updated', severity: 'success' }); }}
                        onError={(msg) => setSnackbar({ open: true, message: msg, severity: 'error' })}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ ...deleteConfirm, open: false })}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent><Typography>Remove this {deleteConfirm.type} record permanently?</Typography></DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteConfirm({ ...deleteConfirm, open: false })}>Cancel</Button>
                    <Button onClick={handleActualDelete} variant="contained" sx={{ bgcolor: RUST_COLOR }}>Delete</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

const InfoCard = ({ title, icon, children }: any) => (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: '16px', height: '100%', borderColor: alpha(DARK_NAVY, 0.1) }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>{icon}<Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{title}</Typography></Stack>
        <Stack spacing={2.5}>{children}</Stack>
    </Paper>
);

const DetailItem = ({ label, value, highlight }: any) => (
    <Box><Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem' }}>{label}</Typography><Typography variant="body2" sx={{ fontWeight: 600, color: highlight ? RUST_COLOR : DARK_NAVY }}>{value || 'Not Specified'}</Typography></Box>
);