import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Stack, Chip, Tabs, Tab,
    Paper, alpha, Button, CircularProgress,
    Dialog, DialogContent,  Grid, Snackbar, Alert,
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
import { AddPaymentForm } from '../Payments/PaymentsForm';
import { DataTable } from '../DataTable';

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
    const [loading, setLoading] = useState(false);

    // Invoice States
    const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [editInvoiceData, setEditInvoiceData] = useState<any | null>(null);

    // Payment States
    const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [editPaymentData, setEditPaymentData] = useState<any | null>(null);
    const [paymentTargetInvoice, setPaymentTargetInvoice] = useState<any | null>(null);

    // Delete States
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; type: 'billing' | 'payment'; data: any | null }>({
        open: false,
        type: 'billing',
        data: null
    });

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });

    const fetchClientData = useCallback(async () => {
        setLoading(true);
        try {
            const [billRes, payRes] = await Promise.all([
                fetch('http://localhost:5000/api/billing'),
                fetch('http://localhost:5000/api/payments')
            ]);

            const billData = await billRes.json();
            const payData = await payRes.json();

            // Filter data for this specific customer
            const filteredBills = billData.filter((b: any) => Number(b.client_id) === Number(customer.id));
            setBillingRecords(filteredBills);

            const billIds = new Set(filteredBills.map((b: any) => b.id));
            const filteredPayments = payData.filter((p: any) => billIds.has(p.billing_id));
            setPaymentRecords(filteredPayments);

        } catch (error) {
            setSnackbar({ open: true, message: 'Sync failed', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [customer.id]);

    useEffect(() => {
        fetchClientData();
    }, [fetchClientData]);

    const handleActualDelete = async () => {
        if (!deleteConfirm.data?.id) return;
        const endpoint = deleteConfirm.type === 'billing' ? 'billing' : 'payments';
        
        try {
            const response = await fetch(`http://localhost:5000/api/${endpoint}/${deleteConfirm.data.id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setSnackbar({ open: true, message: 'Record deleted successfully', severity: 'success' });
                fetchClientData();
            } else {
                throw new Error('Delete failed');
            }
        } catch (err: any) {
            setSnackbar({ open: true, message: err.message, severity: 'error' });
        } finally {
            setDeleteConfirm({ open: false, type: 'billing', data: null });
        }
    };

    const billingColumns = [
        {
            id: 'doc_no',
            label: 'DOCUMENT',
            render: (row: any) => (
                <Box>
                    <Typography sx={{ fontSize: '0.75rem', color: RUST_COLOR, fontWeight: 700 }}>{row.doc_no}</Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{row.type}</Typography>
                </Box>
            )
        },
        {
            id: 'grand_total',
            label: 'BILL AMOUNT',
            render: (row: any) => (
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                    {row.currency} {Number(row.grand_total).toLocaleString()}
                </Typography>
            )
        },
        {
            id: 'total_paid',
            label: 'TOTAL PAID',
            render: (row: any) => (
                <Typography sx={{ fontSize: '0.85rem', color: SUCCESS_COLOR, fontWeight: 600 }}>
                    {row.currency} {Number(row.total_paid || 0).toLocaleString()}
                </Typography>
            )
        },
        {
            id: 'balance',
            label: 'OUTSTANDING',
            render: (row: any) => {
                const balance = Number(row.grand_total) - Number(row.total_paid || 0);
                return (
                    <Typography sx={{
                        fontSize: '0.85rem',
                        color: balance > 0 ? RUST_COLOR : SUCCESS_COLOR,
                        fontWeight: 700
                    }}>
                        {row.currency} {balance.toLocaleString()}
                    </Typography>
                );
            }
        },
        {
            id: 'status',
            label: 'STATUS',
            render: (row: any) => {
                const totalPaid = Number(row.total_paid || 0);
                const grandTotal = Number(row.grand_total);
                let label = totalPaid >= grandTotal ? 'FULLY PAID' : totalPaid > 0 ? 'PARTIAL' : 'UNPAID';
                let color = label === 'FULLY PAID' ? SUCCESS_COLOR : label === 'PARTIAL' ? WARNING_COLOR : RUST_COLOR;

                return (
                    <Chip
                        label={label}
                        size="small"
                        sx={{ bgcolor: alpha(color, 0.1), color, fontSize: '0.6rem', fontWeight: 700, borderRadius: '4px' }}
                    />
                );
            }
        }
    ];

    const paymentColumns = [
        { id: 'date', label: 'DATE', render: (row: any) => <Typography sx={{ fontSize: '0.8rem' }}>{new Date(row.payment_date).toLocaleDateString('en-GB')}</Typography> },
        { id: 'invoice', label: 'INVOICE REF', render: (row: any) => <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{row.doc_no}</Typography> },
        { id: 'method', label: 'METHOD', render: (row: any) => <Typography sx={{ fontSize: '0.75rem' }}>{row.payment_method}</Typography> },
        { id: 'ref', label: 'REFERENCE', render: (row: any) => <Typography sx={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{row.transaction_reference || 'N/A'}</Typography> },
        { id: 'amount', label: 'AMOUNT', render: (row: any) => <Typography sx={{ fontSize: '0.85rem', color: SUCCESS_COLOR, fontWeight: 700 }}>{row.currency || 'KES'} {Number(row.amount_paid).toLocaleString()}</Typography> }
    ];

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fcfcfc', minHeight: '100vh' }}>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ color: '#666', mb: 3, textTransform: 'none', fontWeight: 600 }}>
                Back to Clients
            </Button>

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Stack spacing={0.5}>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: DARK_NAVY, letterSpacing: '-0.02em' }}>{customer.companyName}</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Chip label={customer.status?.toUpperCase() || 'ACTIVE'} size="small" sx={{ fontWeight: 800, borderRadius: '6px', bgcolor: alpha(DARK_NAVY, 0.05) }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>ID: BRK-{customer.id?.toString().padStart(4, '0')}</Typography>
                    </Stack>
                </Stack>
            </Stack>

            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', '& .Mui-selected': { color: RUST_COLOR } }} TabIndicatorProps={{ sx: { bgcolor: RUST_COLOR } }}>
                <Tab label="Overview" sx={{ textTransform: 'none', fontWeight: 700 }} />
                <Tab label="Invoices" sx={{ textTransform: 'none', fontWeight: 700 }} />
                <Tab label="Payments" sx={{ textTransform: 'none', fontWeight: 700 }} />
            </Tabs>

            {loading ? (
                <Stack alignItems="center" py={10}><CircularProgress size={30} sx={{ color: RUST_COLOR }} /></Stack>
            ) : (
                <Box>
                    {activeTab === 0 && (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <InfoCard title="Client Identity" icon={<ContactPageIcon sx={{ color: RUST_COLOR }} />}>
                                    <DetailItem label="Primary Contact" value={customer.contactPerson} />
                                    <DetailItem label="Business Type" value={customer.clientType} />
                                </InfoCard>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <InfoCard title="Communications" icon={<SupportAgentIcon sx={{ color: RUST_COLOR }} />}>
                                    <DetailItem label="Email Address" value={customer.email} highlight />
                                    <DetailItem label="Mobile Number" value={customer.mobile} />
                                </InfoCard>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <InfoCard title="Location" icon={<LocationOnIcon sx={{ color: RUST_COLOR }} />}>
                                    <DetailItem label="City / Region" value={customer.city} />
                                    <DetailItem label="Office / Building" value={customer.building} />
                                </InfoCard>
                            </Grid>
                        </Grid>
                    )}

                    {activeTab === 1 && (
                        selectedInvoice ? (
                            <ViewInvoice data={selectedInvoice} onBack={() => setSelectedInvoice(null)} />
                        ) : (
                            <DataTable
                                title="Client Billing History"
                                columns={billingColumns}
                                data={billingRecords}
                                primaryAction={{ label: 'New Invoice', onClick: () => { setEditInvoiceData(null); setIsInvoiceModalOpen(true); } }}
                                onView={(id) => setSelectedInvoice(billingRecords.find(r => r.id === id))}
                                onEdit={(id) => { setEditInvoiceData(billingRecords.find(r => r.id === id)); setIsInvoiceModalOpen(true); }}
                                onDelete={(id) => setDeleteConfirm({ open: true, type: 'billing', data: billingRecords.find(r => r.id === id) })}
                                additionalActions={(row: any) => {
                                    const balance = Number(row.grand_total) - Number(row.total_paid || 0);
                                    return balance > 0 ? {
                                        label: 'Pay',
                                        icon: <PaymentOutlinedIcon sx={{ fontSize: '1.1rem' }} />,
                                        onClick: (r) => { setPaymentTargetInvoice(r); setEditPaymentData(null); setIsPaymentModalOpen(true); }
                                    } : null;
                                }}
                            />
                        )
                    )}

                    {activeTab === 2 && (
                        selectedPayment ? (
                            <ViewPayment data={selectedPayment} onBack={() => setSelectedPayment(null)} />
                        ) : (
                            <DataTable
                                title="Transaction History"
                                columns={paymentColumns}
                                data={paymentRecords}
                                onView={(id) => setSelectedPayment(paymentRecords.find(p => p.id === id))}
                                onEdit={(id) => { setEditPaymentData(paymentRecords.find(p => p.id === id)); setIsPaymentModalOpen(true); }}
                                onDelete={(id) => setDeleteConfirm({ open: true, type: 'payment', data: paymentRecords.find(p => p.id === id) })}
                            />
                        )
                    )}
                </Box>
            )}

            {/* Billing Modal */}
            <Dialog open={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogContent sx={{ p: 4 }}>
                    <AddBillingForm
                        initialData={editInvoiceData}
                        selectedClient={customer}
                        customers={[customer]}
                        onSuccess={() => { setIsInvoiceModalOpen(false); fetchClientData(); setSnackbar({ open: true, message: 'Ledger Updated', severity: 'success' }); }}
                        onError={(msg) => setSnackbar({ open: true, message: msg, severity: 'error' })}
                    />
                </DialogContent>
            </Dialog>

            {/* Payment Modal */}
            <Dialog open={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ borderBottom: '1px solid #eee', fontWeight: 800 }}>
                    {editPaymentData ? 'Edit Payment Record' : 'Record Payment Collection'}
                </DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                    <AddPaymentForm
                        initialData={editPaymentData}
                        billingRecord={paymentTargetInvoice || (editPaymentData ? billingRecords.find(b => b.id === editPaymentData.billing_id) : null)}
                        onSuccess={() => { setIsPaymentModalOpen(false); fetchClientData(); setSnackbar({ open: true, message: 'Payment recorded', severity: 'success' }); }}
                        onError={(msg) => setSnackbar({ open: true, message: msg, severity: 'error' })}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ ...deleteConfirm, open: false })} PaperProps={{ sx: { borderRadius: '12px' } }}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReceiptLongIcon color="error" /> Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: '0.9rem' }}>
                        Are you sure you want to permanently remove this <strong>{deleteConfirm.type}</strong> record?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setDeleteConfirm({ ...deleteConfirm, open: false })} color="inherit">Cancel</Button>
                    <Button onClick={handleActualDelete} color="error" variant="contained" sx={{ bgcolor: RUST_COLOR }}>Delete Record</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

const InfoCard = ({ title, icon, children }: any) => (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: '16px', height: '100%', borderColor: alpha(DARK_NAVY, 0.1) }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
            {icon}
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: DARK_NAVY }}>{title}</Typography>
        </Stack>
        <Stack spacing={2.5}>{children}</Stack>
    </Paper>
);

const DetailItem = ({ label, value, highlight }: any) => (
    <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem' }}>{label}</Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, color: highlight ? RUST_COLOR : DARK_NAVY }}>{value || 'Not Specified'}</Typography>
    </Box>
);