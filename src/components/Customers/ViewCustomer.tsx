import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Stack, Chip, Tabs, Tab,
    Divider, Paper, alpha, Button,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, CircularProgress, Dialog, DialogContent, IconButton,
    Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaymentsIcon from '@mui/icons-material/Payments';

import { AddBillingForm } from '../Billing/AddBilling';

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
    const [loadingBilling, setLoadingBilling] = useState(false);
    const [loadingPayments, setLoadingPayments] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

    const fetchClientBilling = useCallback(async () => {
        setLoadingBilling(true);
        try {
            const response = await fetch('http://localhost:5000/api/billing');
            const data = await response.json();
            const filtered = data.filter((record: any) => record.client_id === customer.id);
            setBillingRecords(filtered);
        } catch (error) { console.error("Billing Fetch Error:", error); }
        finally { setLoadingBilling(false); }
    }, [customer.id]);

    const fetchClientPayments = useCallback(async () => {
        setLoadingPayments(true);
        try {
            const response = await fetch('http://localhost:5000/api/payments');
            const data = await response.json();
            const filtered = data.filter((p: any) => p.clientName === customer.companyName);
            setPaymentRecords(filtered);
        } catch (error) { console.error("Payment Fetch Error:", error); }
        finally { setLoadingPayments(false); }
    }, [customer.companyName]);

    useEffect(() => {
        if (activeTab === 2) fetchClientBilling();
        if (activeTab === 3) fetchClientPayments();
    }, [activeTab, fetchClientBilling, fetchClientPayments]);

    // Financial Status Color Mapping
    const getStatusStyle = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'paid') return { color: SUCCESS_COLOR, bg: alpha(SUCCESS_COLOR, 0.1) };
        if (s === 'partial') return { color: WARNING_COLOR, bg: alpha(WARNING_COLOR, 0.1) };
        return { color: RUST_COLOR, bg: alpha(RUST_COLOR, 0.1) };
    };

    const clientStatusColors: any = {
        active: { color: '#2ecc71', bg: alpha('#2ecc71', 0.1) },
        lead: { color: '#f1c40f', bg: alpha('#f1c40f', 0.1) },
        inactive: { color: '#e74c3c', bg: alpha('#e74c3c', 0.1) },
    };

    const currentClientStatus = clientStatusColors[customer.status?.toLowerCase()] || { color: '#8a92a6', bg: '#f1f1f1' };

    return (
        <Box sx={{ p: 4, bgcolor: '#fcfcfc', minHeight: '100vh' }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={onBack}
                sx={{ color: '#666', mb: 3, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: 'transparent', color: '#000' } }}
            >
                Back to Clients
            </Button>

            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
                <Stack spacing={0.5}>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.02em' }}>
                        {customer.companyName}
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <BusinessIcon sx={{ fontSize: 18, color: RUST_COLOR }} /> {customer.clientType}
                        </Typography>
                        <Divider orientation="vertical" flexItem sx={{ height: 15, alignSelf: 'center' }} />
                        <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                            ID: BRK-{customer.id?.toString().padStart(4, '0')}
                        </Typography>
                        <Chip label={customer.status?.toUpperCase()} sx={{ bgcolor: currentClientStatus.bg, color: currentClientStatus.color, fontWeight: 900, borderRadius: '8px', px: 1, height: 32 }} />
                    </Stack>
                </Stack>
            </Stack>

            <Box sx={{ mb: 4 }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    TabIndicatorProps={{ sx: { bgcolor: RUST_COLOR, height: 3, borderRadius: '3px 3px 0 0' } }}
                    sx={{
                        '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, minWidth: 100, fontSize: '0.95rem', color: '#888', mr: 2 },
                        '& .Mui-selected': { color: `${RUST_COLOR} !important` }
                    }}
                >
                    <Tab label="Overview" />
                    <Tab label="Services" />
                    <Tab label="Billing & Invoices" />
                    <Tab label="Payments" />
                    <Tab label="Support" />
                </Tabs>
                <Divider sx={{ mt: '-1px', opacity: 0.6 }} />
            </Box>

            <Box>
                {/* OVERVIEW & SERVICES (Omitted for brevity, kept same as original) */}
                {activeTab === 0 && (
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 4 }}><InfoCard title="Identity" icon={<ContactPageIcon sx={{ color: RUST_COLOR }} />}><DetailItem label="Full Company Name" value={customer.companyName} /><DetailItem label="Client Category" value={customer.clientType} /><DetailItem label="Primary Contact" value={customer.contactPerson} /></InfoCard></Grid>
                        <Grid size={{ xs: 12, md: 4 }}><InfoCard title="Communication" icon={<SupportAgentIcon sx={{ color: RUST_COLOR }} />}><DetailItem label="Email Address" value={customer.email} highlight /><DetailItem label="Mobile Number" value={customer.mobile} /><DetailItem label="Account Manager" value={customer.accountManager} /></InfoCard></Grid>
                        <Grid size={{ xs: 12, md: 4 }}><InfoCard title="Location Details" icon={<LocationOnIcon sx={{ color: RUST_COLOR }} />}><DetailItem label="Country / City" value={`${customer.location || 'Kenya'}, ${customer.city}`} /><DetailItem label="Building / Office" value={customer.building} /><DetailItem label="Onboarding Date" value={new Date(customer.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} /></InfoCard></Grid>
                    </Grid>
                )}

                {/* BILLING TAB - STATUS STRICTLY FROM DB */}
                {activeTab === 2 && (
                    <Paper variant="outlined" sx={{ borderRadius: '16px', borderColor: '#eee', overflow: 'hidden' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 3, borderBottom: '1px solid #eee', bgcolor: alpha(DARK_NAVY, 0.02) }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: DARK_NAVY }}>Financial Ledger</Typography>
                            <Button variant="contained" startIcon={<AddIcon />} size="small" onClick={() => setIsInvoiceModalOpen(true)} sx={{ bgcolor: RUST_COLOR, borderRadius: '8px', textTransform: 'none', fontWeight: 700, px: 2 }}>Add Invoice</Button>
                        </Stack>
                        
                        {loadingBilling ? (
                            <Stack alignItems="center" py={10}><CircularProgress size={30} sx={{ color: RUST_COLOR }} /></Stack>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#fcfcfc' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 800, color: '#888', fontSize: '0.7rem' }}>DOC NO</TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: '#888', fontSize: '0.7rem' }}>DATE</TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: '#888', fontSize: '0.7rem' }} align="right">INVOICE TOTAL</TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: '#888', fontSize: '0.7rem' }} align="right">TOTAL PAID</TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: '#888', fontSize: '0.7rem' }} align="right">OUTSTANDING</TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: '#888', fontSize: '0.7rem' }} align="center">PAYMENT STATUS</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {billingRecords.map((row) => {
                                            const statusStyle = getStatusStyle(row.status);
                                            return (
                                                <TableRow key={row.id} hover>
                                                    <TableCell sx={{ fontWeight: 700, color: RUST_COLOR }}>{row.doc_no}</TableCell>
                                                    <TableCell sx={{ color: '#666', fontSize: '0.85rem' }}>{new Date(row.created_at).toLocaleDateString('en-GB')}</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700 }}>{row.currency} {Number(row.grand_total).toLocaleString()}</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700, color: SUCCESS_COLOR }}>{row.currency} {Number(row.total_paid || 0).toLocaleString()}</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 900, color: Number(row.outstanding_balance) > 0 ? RUST_COLOR : SUCCESS_COLOR }}>
                                                        {row.currency} {Number(row.outstanding_balance || 0).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip 
                                                            label={row.status?.toUpperCase() || 'UNPAID'} 
                                                            size="small" 
                                                            sx={{ 
                                                                fontWeight: 900, 
                                                                fontSize: '0.65rem', 
                                                                bgcolor: statusStyle.bg, 
                                                                color: statusStyle.color,
                                                                borderRadius: '6px'
                                                            }} 
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                )}

                {/* PAYMENTS TAB */}
                {activeTab === 3 && (
                    <Paper variant="outlined" sx={{ borderRadius: '16px', borderColor: '#eee', overflow: 'hidden' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 3, borderBottom: '1px solid #eee', bgcolor: alpha(SUCCESS_COLOR, 0.02) }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <PaymentsIcon sx={{ color: SUCCESS_COLOR }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: DARK_NAVY }}>Payment History</Typography>
                            </Stack>
                        </Stack>
                        {loadingPayments ? (
                            <Stack alignItems="center" py={10}><CircularProgress size={30} sx={{ color: SUCCESS_COLOR }} /></Stack>
                        ) : paymentRecords.length > 0 ? (
                            <TableContainer><Table><TableHead sx={{ bgcolor: '#fcfcfc' }}><TableRow>
                                <TableCell sx={{ fontWeight: 800, color: '#888', fontSize: '0.7rem' }}>DATE</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#888', fontSize: '0.7rem' }}>INVOICE REF</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#888', fontSize: '0.7rem' }}>METHOD</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#888', fontSize: '0.7rem' }}>TRANSACTION ID</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#888', fontSize: '0.7rem' }} align="right">AMOUNT PAID</TableCell>
                            </TableRow></TableHead><TableBody>
                                {paymentRecords.map((row) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell sx={{ color: '#666', fontSize: '0.85rem' }}>{new Date(row.payment_date).toLocaleDateString('en-GB')}</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: DARK_NAVY }}>{row.doc_no}</TableCell>
                                        <TableCell><Chip label={row.payment_method} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha(DARK_NAVY, 0.05) }} /></TableCell>
                                        <TableCell sx={{ color: '#666', fontSize: '0.85rem', fontFamily: 'monospace' }}>{row.transaction_reference || 'N/A'}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 900, color: SUCCESS_COLOR }}>{row.currency || 'KES'} {Number(row.amount_paid).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody></Table></TableContainer>
                        ) : <Box sx={{ py: 12, textAlign: 'center' }}><AccountBalanceWalletIcon sx={{ fontSize: 48, color: '#eee', mb: 2 }} /><Typography variant="h6" sx={{ color: '#bbb', fontWeight: 700 }}>No payments received yet</Typography></Box>}
                    </Paper>
                )}
            </Box>

            {/* Invoice Generation Modal */}
            <Dialog open={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: '16px' } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2, borderBottom: '1px solid #eee' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: DARK_NAVY }}>Generate Invoice for {customer.companyName}</Typography>
                    <IconButton onClick={() => setIsInvoiceModalOpen(false)}><CloseIcon /></IconButton>
                </Stack>
                <DialogContent sx={{ p: 3 }}>
                    <AddBillingForm 
                        selectedClient={customer} 
                        customers={[customer]} 
                        onError={(msg) => alert(msg)} 
                        onSuccess={() => { setIsInvoiceModalOpen(false); fetchClientBilling(); }}
                        onCancel={() => setIsInvoiceModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
};

// --- Helper Components ---
const InfoCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: '16px', height: '100%', borderColor: '#eee', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>{icon}<Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#333' }}>{title}</Typography></Stack>
        <Stack spacing={2.5}>{children}</Stack>
    </Paper>
);

const DetailItem = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
    <Box>
        <Typography variant="caption" sx={{ color: '#999', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>{label}</Typography>
        <Typography variant="body1" sx={{ fontWeight: 600, color: highlight ? RUST_COLOR : '#2c3e50', fontSize: '0.95rem' }}>{value || 'Not Provided'}</Typography>
    </Box>
);