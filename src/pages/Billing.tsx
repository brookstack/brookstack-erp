import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Chip, alpha, Dialog, DialogContent,
  Typography, Stack, Snackbar, Alert, Button, CircularProgress,
  DialogTitle, DialogActions, Grid, Paper
} from '@mui/material';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PaymentsIcon from '@mui/icons-material/Payments';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Components
import { DataTable } from '../components/DataTable';
import { AddBillingForm } from '../components/Billing/AddBilling';
import { ViewInvoice } from '../components/Billing/ViewBill';
import { AddPaymentForm } from '../components/Payments/PaymentsForm';
import { API_BASE_URL } from '../config/api';

const RUST = '#b52841';
const DARK_NAVY = '#1a202c';
const SUCCESS_GREEN = '#198754';
const WARNING_ORANGE = '#f39c12';
const INFO_BLUE = '#0288d1';

export const BillingPage = () => {
  const [billingRecords, setBillingRecords] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [editData, setEditData] = useState<any | null>(null);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<any | null>(null);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success'
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; data: any | null }>({
    open: false, data: null
  });

  const fetchBillingData = useCallback(async () => {
    setLoading(true);
    try {
      const [billingRes, customerRes] = await Promise.all([
        fetch(`${API_BASE_URL}/billing`),
        fetch(`${API_BASE_URL}/customers`)
      ]);
      const billingData = await billingRes.json();
      const customerData = await customerRes.json();
      setBillingRecords(Array.isArray(billingData) ? billingData : []);
      setCustomers(Array.isArray(customerData) ? customerData : []);
    } catch (error) {
      setSnackbar({ open: true, message: 'Connection Error', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBillingData(); }, [fetchBillingData]);

  // Statistics Calculation
  const stats = useMemo(() => {
    return {
      quotations: billingRecords.filter(r => r.type?.toLowerCase() === 'quotation').length,
      unpaid: billingRecords.filter(r => r.type?.toLowerCase() !== 'quotation' && Number(r.total_paid || 0) === 0).length,
      partial: billingRecords.filter(r => {
        const paid = Number(r.total_paid || 0);
        const total = Number(r.grand_total);
        return r.type?.toLowerCase() !== 'quotation' && paid > 0 && paid < total;
      }).length,
      paid: billingRecords.filter(r => {
        const paid = Number(r.total_paid || 0);
        const total = Number(r.grand_total);
        return r.type?.toLowerCase() !== 'quotation' && paid >= total && total > 0;
      }).length,
    };
  }, [billingRecords]);

  // Filtered Data Logic
  const filteredRecords = useMemo(() => {
    if (activeFilter === 'all') return billingRecords;
    return billingRecords.filter(r => {
      const paid = Number(r.total_paid || 0);
      const total = Number(r.grand_total);
      const type = r.type?.toLowerCase();

      if (activeFilter === 'quotation') return type === 'quotation';
      if (activeFilter === 'unpaid') return type !== 'quotation' && paid === 0;
      if (activeFilter === 'partial') return type !== 'quotation' && paid > 0 && paid < total;
      if (activeFilter === 'paid') return type !== 'quotation' && paid >= total && total > 0;
      return true;
    });
  }, [billingRecords, activeFilter]);

  const handleActualDelete = async () => {
    if (!deleteConfirm.data?.id) return;
    try {
      const response = await fetch(`${API_BASE_URL}/billing/${deleteConfirm.data.id}`, { method: 'DELETE' });
      if (response.ok) {
        setSnackbar({ open: true, message: 'Record deleted', severity: 'success' });
        fetchBillingData();
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: 'Delete failed', severity: 'error' });
    } finally {
      setDeleteConfirm({ open: false, data: null });
    }
  };

  const columns = [
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
          </Box>
        );
      }
    },
    {
      id: 'doc_no',
      label: 'DOCUMENT',
      render: (row: any) => (
        <Box>
          <Typography sx={{ fontSize: '0.75rem', color: RUST, fontWeight: 700 }}>{row.doc_no || 'Pending'}</Typography>
          <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase' }}>{row.type}</Typography>
        </Box>
      )
    },
    {
      id: 'client',
      label: 'CLIENT',
      render: (row: any) => (
        <Typography sx={{ fontSize: '0.8rem', color: DARK_NAVY, fontWeight: 600 }}>{row.clientName || '---'}</Typography>
      )
    },
    {
        id: 'financials',
        label: 'TOTAL',
        render: (row: any) => (
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>
            {row.currency} {Number(row.grand_total).toLocaleString()}
          </Typography>
        )
    },
    {
      id: 'status',
      label: 'STATUS',
      render: (row: any) => {
        const totalPaid = Number(row.total_paid || 0);
        const grandTotal = Number(row.grand_total);
        const isQuotation = row.type?.toLowerCase() === 'quotation';
        
        let label = 'Unpaid';
        let color = RUST;

        if (isQuotation) { label = 'Quotation'; color = INFO_BLUE; }
        else if (totalPaid >= grandTotal && grandTotal > 0) { label = 'Fully paid'; color = SUCCESS_GREEN; }
        else if (totalPaid > 0) { label = 'Partial'; color = WARNING_ORANGE; }

        return (
          <Chip label={label.toUpperCase()} size="small" sx={{ bgcolor: alpha(color, 0.1), color: color, fontSize: '0.6rem', fontWeight: 800, borderRadius: '4px' }} />
        );
      }
    }
  ];

  return (
    <Box sx={{ width: '100%', p: viewMode ? 0 : 3, bgcolor: '#fcfcfc', minHeight: '100vh' }}>
      
      {!viewMode && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <StatCard 
            label="Quotations" value={stats.quotations} icon={<RequestQuoteIcon sx={{fontSize:18}}/>} color={INFO_BLUE} 
            active={activeFilter === 'quotation'} onClick={() => setActiveFilter(activeFilter === 'quotation' ? 'all' : 'quotation')}
          />
          <StatCard 
            label="Unpaid Invoices" value={stats.unpaid} icon={<HourglassEmptyIcon sx={{fontSize:18}}/>} color={RUST} 
            active={activeFilter === 'unpaid'} onClick={() => setActiveFilter(activeFilter === 'unpaid' ? 'all' : 'unpaid')}
          />
          <StatCard 
            label="Partial Payments" value={stats.partial} icon={<PaymentsIcon sx={{fontSize:18}}/>} color={WARNING_ORANGE} 
            active={activeFilter === 'partial'} onClick={() => setActiveFilter(activeFilter === 'partial' ? 'all' : 'partial')}
          />
          <StatCard 
            label="Fully Paid" value={stats.paid} icon={<CheckCircleIcon sx={{fontSize:18}}/>} color={SUCCESS_GREEN} 
            active={activeFilter === 'paid'} onClick={() => setActiveFilter(activeFilter === 'paid' ? 'all' : 'paid')}
          />
        </Grid>
      )}

      {activeFilter !== 'all' && !viewMode && (
        <Box sx={{ mb: 2 }}>
            <Chip label={`VIEWING: ${activeFilter.toUpperCase()}`} size="small" onDelete={() => setActiveFilter('all')} sx={{ bgcolor: DARK_NAVY, color: '#fff', fontWeight: 700, fontSize: '0.65rem' }} />
        </Box>
      )}

      {loading ? (
        <Stack alignItems="center" py={10}><CircularProgress size={30} sx={{ color: RUST }} /></Stack>
      ) : viewMode && selectedInvoice ? (
        <ViewInvoice data={selectedInvoice} onBack={() => { setViewMode(false); setSelectedInvoice(null); }} />
      ) : (
        <DataTable
          title="Billing Ledger"
          columns={columns}
          data={filteredRecords}
          primaryAction={{ label: 'Generate Document', onClick: () => { setEditData(null); setModalOpen(true); } }}
          onView={(id) => {
            const record = billingRecords.find(r => r.id === id);
            if (record) { setSelectedInvoice(record); setViewMode(true); }
          }}
          onEdit={(id) => {
            const record = billingRecords.find(r => r.id === id);
            if (record) { setEditData(record); setModalOpen(true); }
          }}
          onDelete={(id) => {
            const record = billingRecords.find(r => r.id === id);
            setDeleteConfirm({ open: true, data: record });
          }}
          additionalActions={(row: any) => {
            const isPaid = Number(row.total_paid || 0) >= Number(row.grand_total);
            const isQuotation = row.type?.toLowerCase() === 'quotation';
            return !isQuotation && !isPaid ? ({
              label: 'Pay',  
              icon: <PaymentOutlinedIcon sx={{ fontSize: '1.1rem' }} />,   
              onClick: (row) => { setPaymentTarget(row); setPaymentModalOpen(true); }
            }) : null;
          }}
        />
      )}

      {/* Modals and Notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>

      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, data: null })} PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: RUST, fontWeight: 800 }}>
          <ReceiptLongIcon /> Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.85rem' }}>Permanently remove <strong>{deleteConfirm.data?.doc_no}</strong>?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirm({ open: false, data: null })}>Cancel</Button>
          <Button onClick={handleActualDelete} variant="contained" sx={{ bgcolor: RUST }}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogContent sx={{ p: 4 }}>
          <AddBillingForm initialData={editData} customers={customers} onSuccess={() => { setModalOpen(false); fetchBillingData(); }} onError={(msg) => setSnackbar({ open: true, message: msg, severity: 'error' })} />
        </DialogContent>
      </Dialog>

      <Dialog open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ borderBottom: '1px solid #eee', fontWeight: 600 }}>Record Payment</DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {paymentTarget && <AddPaymentForm billingRecord={paymentTarget} onSuccess={() => { setPaymentModalOpen(false); fetchBillingData(); setSnackbar({open:true, message:'Payment Recorded', severity:'success'}); }} onError={(msg) => setSnackbar({ open: true, message: msg, severity: 'error' })} />}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

const StatCard = ({ label, value, icon, color, active, onClick }: any) => (
    <Grid size={{ xs: 6, sm: 3 }}>
        <Paper 
            variant="outlined" onClick={onClick}
            sx={{ 
                p: 1.5, borderRadius: '10px', borderLeft: `3px solid ${color}`,
                bgcolor: active ? alpha(color, 0.08) : alpha(color, 0.02),
                cursor: 'pointer', transition: '0.2s',
                '&:hover': { bgcolor: alpha(color, 0.1), transform: 'translateY(-3px)' }
            }}
        >
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ p: 0.8, borderRadius: '8px', bgcolor: active ? color : alpha(color, 0.1), color: active ? '#fff' : color, display: 'flex' }}>
                    {icon}
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 800, color: DARK_NAVY, fontSize: '1rem', lineHeight: 1.1 }}>{value}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 800 }}>{label}</Typography>
                </Box>
            </Stack>
        </Paper>
    </Grid>
);