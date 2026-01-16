import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Stack, Chip, Tabs, Tab, Link,
    Paper, alpha, Button, CircularProgress,
    Dialog, DialogContent, Grid, Snackbar, Alert,
    DialogTitle, DialogActions, Tooltip, IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import CloseIcon from '@mui/icons-material/Close';
import LaunchIcon from '@mui/icons-material/Launch';

// Components
import { AddBillingForm } from '../Billing/AddBilling';
import { ViewInvoice } from '../Billing/ViewBill';
import { ViewPayment } from '../Payments/ViewPayment';
import { AddPaymentForm } from '../Payments/PaymentsForm';
import { AddProjectForm } from '../Projects/AddProject'; 
import { DataTable } from '../DataTable';
import { API_BASE_URL } from '../../config/api';

const RUST = '#b52841';
const DARK_NAVY = '#1a202c';
const SUCCESS_GREEN = '#198754';
const WARNING_ORANGE = '#f39c12';

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
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Selection States
    const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
    const [paymentTarget, setPaymentTarget] = useState<any | null>(null);
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

            const filteredBills = billData.filter((b: any) => Number(b.client_id) === Number(customer.id));
            const filteredProjs = projData.filter((p: any) => Number(p.client_id) === Number(customer.id));
            setBillingRecords(filteredBills);
            setProjectRecords(filteredProjs);

            const clientBillIds = new Set(filteredBills.map((b: any) => Number(b.id)));
            const filteredPayments = payData.filter((p: any) => clientBillIds.has(Number(p.billing_id)));
            setPaymentRecords(filteredPayments);

        } catch (error) {
            setSnackbar({ open: true, message: 'Data sync failed', severity: 'error' });
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
                setSnackbar({ open: true, message: 'Record deleted', severity: 'success' });
                fetchClientData();
            } else throw new Error('Delete failed');
        } catch (err: any) {
            setSnackbar({ open: true, message: err.message, severity: 'error' });
        } finally {
            setDeleteConfirm({ ...deleteConfirm, open: false });
        }
    };

    // --- TAB COLUMNS ---

    const billingColumns = [
        { id: 'doc_no', label: 'DOCUMENT', render: (row: any) => <Box><Typography sx={{ fontSize: '0.75rem', color: RUST, fontWeight: 700 }}>{row.doc_no}</Typography><Typography variant="caption">{row.type?.toUpperCase()}</Typography></Box> },
        { id: 'grand_total', label: 'TOTAL', render: (row: any) => <Typography sx={{ fontSize: '0.85rem' }}>{row.currency} {(Number(row.grand_total) || 0).toLocaleString()}</Typography> },
        { id: 'balance', label: 'BALANCE', render: (row: any) => {
            const balance = (Number(row.grand_total) || 0) - (Number(row.total_paid) || 0);
            return <Typography sx={{ fontSize: '0.85rem', color: balance > 0 ? RUST : SUCCESS_GREEN, fontWeight: 700 }}>{row.currency} {balance.toLocaleString()}</Typography>;
        }}
    ];

    const paymentColumns = [
        { id: 'payment_date', label: 'DATE', render: (row: any) => new Date(row.payment_date).toLocaleDateString('en-GB') },
        { id: 'doc_ref', label: 'INVOICE', render: (row: any) => <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{row.doc_no || '---'}</Typography> },
        { id: 'amount', label: 'AMOUNT PAID', render: (row: any) => <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: SUCCESS_GREEN }}>{row.currency || 'KES'} {(Number(row.amount_paid) || 0).toLocaleString()}</Typography> },
        { id: 'method', label: 'METHOD', render: (row: any) => <Chip label={row.payment_method || 'CASH'} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} /> }
    ];

    const projectColumns = [
        { id: 'project_name', label: 'PROJECT NAME', render: (row: any) => <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>{row.project_name}</Typography> },
        { id: 'project_type', label: 'TYPE', render: (row: any) => <Chip label={row.project_type || 'Software'} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} /> },
        {
            id: 'status',
            label: 'STAGE',
            render: (row: any) => {
                const colors: any = { discovery: '#64748b', development: '#0ea5e9', completed: SUCCESS_GREEN };
                const color = colors[row.status?.toLowerCase()] || WARNING_ORANGE;
                return <Chip label={row.status?.toUpperCase()} size="small" sx={{ bgcolor: alpha(color, 0.1), color, fontWeight: 800, fontSize: '0.6rem' }} />;
            }
        },
        { 
            id: 'project_url', 
            label: 'PROJECT URL', 
            render: (row: any) => row.project_url ? (
                <Link 
                    href={row.project_url.startsWith('http') ? row.project_url : `https://${row.project_url}`} 
                    target="_blank" 
                    rel="noopener" 
                    sx={{ 
                        fontSize: '0.75rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 0.5, 
                        color: RUST, 
                        textDecoration: 'none', 
                        fontWeight: 600,
                        '&:hover': { textDecoration: 'underline' }
                    }}
                >
                    {row.project_url.replace(/(^\w+:|^)\/\//, '').substring(0, 25)}{row.project_url.length > 25 ? '...' : ''}
                    <LaunchIcon sx={{ fontSize: '0.85rem' }} />
                </Link>
            ) : (
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>No set yet</Typography>
            )
        }
    ];

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fcfcfc', minHeight: '100vh' }}>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ color: '#666', mb: 3, textTransform: 'none', fontWeight: 600 }}>Back to Clients</Button>

            <Stack spacing={0.5} sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: DARK_NAVY }}>{customer.companyName}</Typography>
                <Chip label={customer.status?.toUpperCase() || 'ACTIVE'} size="small" sx={{ width: 'fit-content', fontWeight: 800, borderRadius: '6px' }} />
            </Stack>

            <Tabs 
                value={activeTab} 
                onChange={(_, v: number) => setActiveTab(v)} 
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', '& .Mui-selected': { color: RUST } }} 
                TabIndicatorProps={{ sx: { bgcolor: RUST } }}
            >
                <Tab label="Overview" sx={{ textTransform: 'none', fontWeight: 700 }} />
                <Tab label="Invoices" sx={{ textTransform: 'none', fontWeight: 700 }} />
                <Tab label="Payments" sx={{ textTransform: 'none', fontWeight: 700 }} />
                <Tab label="Projects" sx={{ textTransform: 'none', fontWeight: 700 }} />
            </Tabs>

            {loading ? <Stack alignItems="center" py={10}><CircularProgress size={30} sx={{ color: RUST }} /></Stack> : (
                <Box>
                    {activeTab === 0 && (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 4 }}><InfoCard title="Identity" icon={<ContactPageIcon sx={{ color: RUST }} />}><DetailItem label="Contact" value={customer.contactPerson} /><DetailItem label="Business Type" value={customer.clientType} /></InfoCard></Grid>
                            <Grid size={{ xs: 12, md: 4 }}><InfoCard title="Communication" icon={<SupportAgentIcon sx={{ color: RUST }} />}><DetailItem label="Email" value={customer.email} highlight /><DetailItem label="Mobile" value={customer.mobile} /></InfoCard></Grid>
                            <Grid size={{ xs: 12, md: 4 }}><InfoCard title="Location" icon={<LocationOnIcon sx={{ color: RUST }} />}><DetailItem label="City" value={customer.city} /><DetailItem label="Building" value={customer.building} /></InfoCard></Grid>
                        </Grid>
                    )}

                    {activeTab === 1 && (
                        selectedInvoice ? <ViewInvoice data={selectedInvoice} onBack={() => setSelectedInvoice(null)} /> :
                        <DataTable
                            title="Billing History"
                            columns={billingColumns}
                            data={billingRecords}
                            primaryAction={{ label: 'New Invoice', onClick: () => { setEditData(null); setIsInvoiceModalOpen(true); } }}
                            onView={(id: any) => setSelectedInvoice(billingRecords.find(r => r.id === id))}
                            onEdit={(id: any) => { setEditData(billingRecords.find(r => r.id === id)); setIsInvoiceModalOpen(true); }}
                            onDelete={(id: any) => setDeleteConfirm({ open: true, type: 'billing', data: billingRecords.find(r => r.id === id) })}
                            additionalActions={(row: any) => {
                                const isPaid = (Number(row.total_paid) || 0) >= (Number(row.grand_total) || 0);
                                return row.type === 'invoice' && !isPaid ? ({
                                    label: 'Pay',
                                    icon: <PaymentOutlinedIcon sx={{ fontSize: '1.1rem' }} />,
                                    onClick: (row) => { setPaymentTarget(row); setIsPaymentModalOpen(true); }
                                }) : null;
                            }}
                        />
                    )}

                    {activeTab === 2 && (
                        selectedPayment ? <ViewPayment data={selectedPayment} onBack={() => setSelectedPayment(null)} /> :
                        <DataTable
                            title="Payment Collection"
                            columns={paymentColumns}
                            data={paymentRecords}
                            onView={(id: any) => setSelectedPayment(paymentRecords.find(p => p.id === id))}
                            onDelete={(id: any) => setDeleteConfirm({ open: true, type: 'payments', data: paymentRecords.find(p => p.id === id) })}
                        />
                    )}

                    {activeTab === 3 && (
                        <DataTable
                            title="Software Projects"
                            columns={projectColumns}
                            data={projectRecords}
                            primaryAction={{ label: 'New Project', onClick: () => { setEditData(null); setIsProjectModalOpen(true); } }}
                            onEdit={(id: any) => { setEditData(projectRecords.find(p => p.id === id)); setIsProjectModalOpen(true); }}
                            onDelete={(id: any) => setDeleteConfirm({ open: true, type: 'projects', data: projectRecords.find(p => p.id === id) })}
                        />
                    )}
                </Box>
            )}

            {/* --- MODALS --- */}
            
            <Dialog open={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} fullWidth maxWidth="md">
                <DialogContent sx={{ p: 4 }}>
                    <AddProjectForm 
                        initialData={editData} 
                        selectedClient={customer} 
                        onSuccess={() => { setIsProjectModalOpen(false); fetchClientData(); setSnackbar({ open: true, message: 'Project Saved', severity: 'success' }); }} 
                        onError={(msg: string) => setSnackbar({ open: true, message: msg, severity: 'error' })} 
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} fullWidth maxWidth="md">
                <DialogContent sx={{ p: 4 }}>
                    <AddBillingForm initialData={editData} selectedClient={customer} customers={[customer]} onSuccess={() => { setIsInvoiceModalOpen(false); fetchClientData(); }} onError={(msg: string) => setSnackbar({ open: true, message: msg, severity: 'error' })} />
                </DialogContent>
            </Dialog>

            <Dialog open={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} fullWidth maxWidth="sm">
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2, borderBottom: '1px solid #eee' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Record Payment Collection</Typography>
                    <IconButton size="small" onClick={() => setIsPaymentModalOpen(false)}><CloseIcon fontSize="small" /></IconButton>
                </Stack>
                <DialogContent sx={{ p: 3 }}>
                    {paymentTarget && (
                        <AddPaymentForm
                            billingRecord={paymentTarget}
                            onSuccess={() => { setIsPaymentModalOpen(false); fetchClientData(); setSnackbar({ open: true, message: 'Ledger updated', severity: 'success' }); }}
                            onError={(msg: string) => setSnackbar({ open: true, message: msg, severity: 'error' })}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ ...deleteConfirm, open: false })}>
                <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
                <DialogContent><Typography variant="body2">Are you sure you want to remove this {deleteConfirm.type} record?</Typography></DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteConfirm({ ...deleteConfirm, open: false })}>Cancel</Button>
                    <Button onClick={handleActualDelete} variant="contained" sx={{ bgcolor: RUST }}>Delete</Button>
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
    <Box><Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem' }}>{label}</Typography><Typography variant="body2" sx={{ fontWeight: 600, color: highlight ? RUST : DARK_NAVY }}>{value || '---'}</Typography></Box>
);