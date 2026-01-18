import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Stack, Chip, Tabs, Tab, Link,
    Paper, alpha, Button, CircularProgress,
    Dialog, DialogContent, Grid, Snackbar, Alert,
    DialogTitle, DialogActions, IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import LaunchIcon from '@mui/icons-material/Launch';
import CloseIcon from '@mui/icons-material/Close';

// Components
import { AddBillingForm } from '../Billing/AddBilling';
import { ViewInvoice } from '../Billing/ViewBill';
import { ViewPayment } from '../Payments/ViewPayment';
import { AddPaymentForm } from '../Payments/PaymentsForm';
import { AddProjectForm } from '../Projects/AddProject'; 
import { ViewProject } from '../Projects/ViewProject';
import { DataTable } from '../DataTable';
import { API_BASE_URL } from '../../config/api';

const RUST = '#b52841';
const MAROON = '#800000';
const DARK_NAVY = '#1a202c';
const SUCCESS_GREEN = '#198754';
const WARNING_ORANGE = '#f39c12';
const LEAD_BLUE = '#0ea5e9';

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
    const [isViewProjectOpen, setIsViewProjectOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Selection States
    const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
    const [selectedProject, setSelectedProject] = useState<any | null>(null);
    const [paymentTarget, setPaymentTarget] = useState<any | null>(null);
    const [editData, setEditData] = useState<any | null>(null);

    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; type: string; data: any | null }>({
        open: false, type: 'billing', data: null
    });

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ 
        open: false, message: '', severity: 'success' 
    });

    // --- Helper for Customer Status Colors ---
    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'active') return SUCCESS_GREEN;
        if (s === 'lead') return LEAD_BLUE;
        return MAROON;
    };

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
        const endpoint = deleteConfirm.type === 'payments' ? 'payments' : deleteConfirm.type;
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}/${deleteConfirm.data.id}`, { method: 'DELETE' });
            if (response.ok) {
                setSnackbar({ open: true, message: 'Record updated successfully', severity: 'success' });
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
        {
            id: 'created_at',
            label: 'DATE',
            render: (row: any) => {
                const date = new Date(row.created_at);
                return (
                    <Box>
                        <Typography sx={{ fontSize: '0.8rem', color: DARK_NAVY, fontWeight: 700 }}>
                            {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                            {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                    </Box>
                );
            }
        },
        { id: 'doc_no', label: 'DOCUMENT', render: (row: any) => <Box><Typography sx={{ fontSize: '0.75rem', color: RUST, fontWeight: 700 }}>{row.doc_no}</Typography><Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'capitalize' }}>{row.type?.toLowerCase()}</Typography></Box> },
        {
            id: 'services',
            label: 'SERVICE ITEMS',
            render: (row: any) => {
                let items = [];
                try {
                    const rawData = row.items || row.services || row.service_items || [];
                    items = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
                } catch (e) { items = []; }
                return (
                    <Stack spacing={0.5} sx={{ py: 1 }}>
                        {items.slice(0, 2).map((item: any, idx: number) => (
                            <Typography key={idx} sx={{ fontSize: '0.7rem', color: DARK_NAVY, display: 'flex', alignItems: 'center', '&::before': { content: '"•"', marginRight: '4px', color: RUST } }}>
                                {item.description}
                            </Typography>
                        ))}
                    </Stack>
                );
            }
        },
        { id: 'grand_total', label: 'TOTAL', render: (row: any) => <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>{row.currency} {(Number(row.grand_total) || 0).toLocaleString()}</Typography> },
        { 
            id: 'status', label: 'STATUS',
            render: (row: any) => {
                // Check if type is quotation first
                if (row.type?.toLowerCase() === 'quotation') {
                    return <Chip label="Quotation" size="small" sx={{ bgcolor: alpha('#0ea5e9', 0.1), color: "#0ea5e9", fontSize: '0.6rem', fontWeight: 800, borderRadius: '4px' }} />;
                }

                const totalPaid = Number(row.total_paid || 0);
                const grandTotal = Number(row.grand_total);
                let label = 'Unpaid', color = RUST;
                if (totalPaid >= grandTotal && grandTotal > 0) { label = 'Fully paid'; color = SUCCESS_GREEN; }
                else if (totalPaid > 0) { label = 'Partial'; color = WARNING_ORANGE; }
                return <Chip label={label} size="small" sx={{ bgcolor: alpha(color, 0.1), color, fontSize: '0.6rem', fontWeight: 800, borderRadius: '4px' }} />;
            }
        }
    ];

    const paymentColumns = [
        {
            id: 'payment_date',
            label: 'DATE',
            render: (row: any) => {
                const date = new Date(row.payment_date);
                return (
                    <Box>
                        <Typography sx={{ fontSize: '0.8rem', color: DARK_NAVY, fontWeight: 700 }}>
                            {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                            {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                    </Box>
                );
            }
        },
        { id: 'doc_no', label: 'INVOICE', render: (row: any) => <Typography sx={{ fontSize: '0.75rem', color: RUST, fontWeight: 700 }}>{row.doc_no}</Typography> },
        {
            id: 'service_items',
            label: 'SERVICE ITEMS',
            render: (row: any) => {
                const masterBilling = billingRecords.find(b => b.id === row.billing_id);
                const servicesRaw = row.billing_services_json || masterBilling?.services;
                let items = [];
                try { items = typeof servicesRaw === 'string' ? JSON.parse(servicesRaw) : (servicesRaw || []); } catch (e) { items = []; }
                return (
                    <Stack spacing={0.5} sx={{ py: 1 }}>
                        {items.slice(0, 2).map((item: any, idx: number) => (
                            <Typography key={idx} sx={{ fontSize: '0.7rem', color: DARK_NAVY, display: 'flex', alignItems: 'center', '&::before': { content: '"•"', marginRight: '4px', color: RUST } }}>
                                {item.description || item.item_name}
                            </Typography>
                        ))}
                    </Stack>
                );
            }
        },
        { id: 'amount', label: 'AMOUNT PAID', render: (row: any) => <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: SUCCESS_GREEN }}>{row.currency || 'KES'} {(Number(row.amount_paid) || 0).toLocaleString()}</Typography> },
        {
            id: 'billing_status', label: 'INVOICE STATUS',
            render: (row: any) => {
                const masterBilling = billingRecords.find(b => b.id === row.billing_id);
                const status = (masterBilling?.status || row.billing_status || 'unpaid').toLowerCase();
                const config: any = { 
                    paid: { label: 'Fully paid', color: SUCCESS_GREEN, bg: alpha(SUCCESS_GREEN, 0.1) }, 
                    partial: { label: 'Partial', color: WARNING_ORANGE, bg: alpha(WARNING_ORANGE, 0.1) }, 
                    unpaid: { label: 'Unpaid', color: RUST, bg: alpha(RUST, 0.1) } 
                };
                const style = config[status] || config.unpaid;
                return <Chip label={style.label} size="small" sx={{ fontSize: '0.6rem', bgcolor: style.bg, color: style.color, borderRadius: '4px', fontWeight: 800 }} />;
            }
        }
    ];

    const projectColumns = [
        {
            id: 'created_at',
            label: 'LAUNCH DATE',
            render: (row: any) => {
                const date = new Date(row.created_at);
                return (
                    <Box>
                        <Typography sx={{ fontSize: '0.8rem', color: DARK_NAVY, fontWeight: 700 }}>
                            {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                            {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                    </Box>
                );
            }
        },
        { id: 'project_name', label: 'PROJECT NAME', render: (row: any) => <Box><Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: DARK_NAVY }}>{row.project_name}</Typography><Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{row.project_type}</Typography></Box> },
        {
            id: 'status',
            label: 'STAGE',
            render: (row: any) => {
                const colors: any = { discovery: '#64748b', design: '#7c3aed', development: '#0ea5e9', completed: SUCCESS_GREEN };
                const color = colors[row.status?.toLowerCase()] || WARNING_ORANGE;
                return <Chip label={row.status} size="small" sx={{ bgcolor: alpha(color, 0.1), color, fontWeight: 800, fontSize: '0.6rem', borderRadius: '4px', textTransform: 'capitalize' }} />;
            }
        },
        { 
            id: 'project_url', 
            label: 'PROJECT URL', 
            render: (row: any) => row.project_url ? (
                <Link 
                    href={row.project_url.startsWith('http') ? row.project_url : `https://${row.project_url}`} 
                    target="_blank" rel="noopener" 
                    sx={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 0.5, color: RUST, textDecoration: 'none', fontWeight: 700 }}
                >
                    {row.project_url.replace(/(^\w+:|^)\/\//, '').substring(0, 20)}... <LaunchIcon sx={{ fontSize: '0.85rem' }} />
                </Link>
            ) : <Typography variant="caption" sx={{ color: 'text.disabled' }}>-</Typography>
        }
    ];

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fcfcfc', minHeight: '100vh' }}>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ color: '#666', mb: 3, textTransform: 'none', fontWeight: 600 }}>Back to Clients</Button>

            <Stack spacing={0.5} sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: DARK_NAVY }}>{customer.companyName}</Typography>
                <Chip 
                    label={customer.status || 'Active'} 
                    size="small" 
                    sx={{ 
                        width: 'fit-content', 
                        fontWeight: 800, 
                        borderRadius: '6px',
                        textTransform: 'capitalize',
                        bgcolor: alpha(getStatusColor(customer.status), 0.1),
                        color: getStatusColor(customer.status)
                    }} 
                />
            </Stack>

            <Tabs value={activeTab} onChange={(_, v: number) => setActiveTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', '& .Mui-selected': { color: RUST } }} TabIndicatorProps={{ sx: { bgcolor: RUST } }}>
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
                            title="Billing History" columns={billingColumns} data={billingRecords}
                            primaryAction={{ label: 'New Invoice', onClick: () => { setEditData(null); setIsInvoiceModalOpen(true); } }}
                            onView={(id) => setSelectedInvoice(billingRecords.find(r => r.id === id))}
                            onEdit={(id) => { setEditData(billingRecords.find(r => r.id === id)); setIsInvoiceModalOpen(true); }}
                            onDelete={(id) => setDeleteConfirm({ open: true, type: 'billing', data: billingRecords.find(r => r.id === id) })}
                            additionalActions={(row: any) => {
                                const isPaid = Number(row.total_paid || 0) >= Number(row.grand_total);
                                return row.type === 'invoice' && !isPaid ? ({
                                    label: 'Pay', icon: <PaymentOutlinedIcon sx={{ fontSize: '1.1rem' }} />,
                                    onClick: (row) => { setPaymentTarget(row); setIsPaymentModalOpen(true); }
                                }) : null;
                            }}
                        />
                    )}

                    {activeTab === 2 && (
                         selectedPayment ? <ViewPayment data={selectedPayment} onBack={() => setSelectedPayment(null)} /> :
                         <DataTable
                             title="Payment Collection" columns={paymentColumns} data={paymentRecords}
                             onView={(id) => {
                                 const record = paymentRecords.find(p => p.id === id);
                                 if (record) {
                                     const masterBilling = billingRecords.find(b => b.id === record.billing_id);
                                     setSelectedPayment({ ...record, billing_services_json: masterBilling?.services || record.billing_services_json });
                                 }
                             }}
                             onEdit={(id) => { setEditData(paymentRecords.find(p => p.id === id)); setIsPaymentModalOpen(true); }}
                             onDelete={(id) => setDeleteConfirm({ open: true, type: 'payments', data: paymentRecords.find(p => p.id === id) })}
                         />
                    )}

                    {activeTab === 3 && (
                        <DataTable
                            title="Software Projects" columns={projectColumns} data={projectRecords}
                            primaryAction={{ label: 'New Project', onClick: () => { setEditData(null); setIsProjectModalOpen(true); } }}
                            onView={(id) => {
                                const project = projectRecords.find(p => p.id === id);
                                if (project) { setSelectedProject(project); setIsViewProjectOpen(true); }
                            }}
                            onEdit={(id) => { setEditData(projectRecords.find(p => p.id === id)); setIsProjectModalOpen(true); }}
                            onDelete={(id) => setDeleteConfirm({ open: true, type: 'projects', data: projectRecords.find(p => p.id === id) })}
                        />
                    )}
                </Box>
            )}

            {/* --- MODALS --- */}
            <ViewProject open={isViewProjectOpen} onClose={() => setIsViewProjectOpen(false)} project={selectedProject} />

            <Dialog open={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} fullWidth maxWidth="md">
                <DialogContent sx={{ p: 4 }}>
                    <AddProjectForm initialData={editData} selectedClient={customer} onSuccess={() => { setIsProjectModalOpen(false); fetchClientData(); }} onError={(msg: string) => setSnackbar({ open: true, message: msg, severity: 'error' })} />
                </DialogContent>
            </Dialog>

            <Dialog open={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} fullWidth maxWidth="md">
                <DialogContent sx={{ p: 4 }}>
                    <AddBillingForm initialData={editData} selectedClient={customer} customers={[customer]} onSuccess={() => { setIsInvoiceModalOpen(false); fetchClientData(); }} onError={(msg: string) => setSnackbar({ open: true, message: msg, severity: 'error' })} />
                </DialogContent>
            </Dialog>

            <Dialog open={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} fullWidth maxWidth="md">
                 <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2, borderBottom: '1px solid #eee' }}>
                    <Typography sx={{ color: DARK_NAVY, fontWeight: 700 }}>Record Payment</Typography>
                    <IconButton size="small" onClick={() => setIsPaymentModalOpen(false)}><CloseIcon fontSize="small" /></IconButton>
                </Stack>
                <DialogContent sx={{ p: 3 }}>
                    <AddPaymentForm initialData={editData} billingRecord={paymentTarget} availableInvoices={billingRecords} onSuccess={() => { setIsPaymentModalOpen(false); fetchClientData(); }} onError={(msg: string) => setSnackbar({ open: true, message: msg, severity: 'error' })} />
                </DialogContent>
            </Dialog>

            <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ ...deleteConfirm, open: false })}>
                <DialogTitle sx={{ fontWeight: 700, color: RUST }}>Confirm Delete</DialogTitle>
                <DialogContent><Typography variant="body2">Are you sure? This action will immediately update the software ledger and cannot be undone.</Typography></DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteConfirm({ ...deleteConfirm, open: false })}>Cancel</Button>
                    <Button onClick={handleActualDelete} variant="contained" sx={{ bgcolor: RUST }}>Confirm</Button>
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