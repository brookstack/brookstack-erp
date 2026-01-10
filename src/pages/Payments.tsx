import { useState, useEffect, useCallback } from 'react';
import {
  Box, Chip, alpha, Dialog, DialogContent, IconButton,
  Typography, Stack, Snackbar, Alert, Button, CircularProgress,
  DialogTitle, DialogActions, Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Components
import { DataTable } from '../components/DataTable';
import { AddPaymentForm } from '../components/Payments/PaymentsForm';
import { ViewPayment } from '../components/Payments/ViewPayment';

const RUST = '#b52841';
const DARK_NAVY = '#1a202c';
const SUCCESS_GREEN = '#198754';
const WARNING_ORANGE = '#f39c12';

export const PaymentsPage = () => {
  const [paymentRecords, setPaymentRecords] = useState<any[]>([]);
  const [billingRecords, setBillingRecords] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; data: any | null }>({
    open: false, data: null
  });

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success'
  });

  const fetchPaymentData = useCallback(async () => {
    setLoading(true);
    try {
      const [paymentsRes, billingRes] = await Promise.all([
        fetch('http://localhost:5000/api/payments'),
        fetch('http://localhost:5000/api/billing') 
      ]);
      const paymentsData = await paymentsRes.json();
      const billingData = await billingRes.json();
      setPaymentRecords(paymentsData);
      setBillingRecords(billingData);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to connect to Revenue API', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentData();
  }, [fetchPaymentData]);

  const handleActualDelete = async () => {
    if (!deleteConfirm.data?.id) return;
    try {
      const response = await fetch(`http://localhost:5000/api/payments/${deleteConfirm.data.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSnackbar({ open: true, message: 'Payment reversed and ledger updated', severity: 'success' });
        fetchPaymentData();
      } else { throw new Error('Delete failed'); }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally { setDeleteConfirm({ open: false, data: null }); }
  };

  const columns = [
    {
      id: 'payment_date',
      label: 'DATE',
      render: (row: any) => (
        <Typography sx={{ fontSize: '0.8rem' }}>
          {new Date(row.payment_date).toLocaleDateString('en-GB')}
        </Typography>
      )
    },
    {
      id: 'doc_no',
      label: 'INVOICE & CLIENT',
      render: (row: any) => (
        <Stack spacing={0}>
          <Typography sx={{ fontSize: '0.85rem', color: DARK_NAVY }}>
            {row.doc_no}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            {row.clientName}
          </Typography>
        </Stack>
      )
    },
    {
      id: 'amount_paid',
      label: 'AMOUNT PAID',
      render: (row: any) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography sx={{ fontSize: '0.9rem', color: SUCCESS_GREEN }}>
            {row.currency} {Number(row.amount_paid).toLocaleString()}
          </Typography>
        </Stack>
      )
    },
    {
      id: 'billing_status',
      label: 'INVOICE STATUS',
      render: (row: any) => {
        const masterBilling = billingRecords.find(b => b.id === row.billing_id);
        const status = (masterBilling?.status || row.status || 'unpaid').toLowerCase();
        
        const config: any = {
            paid: { color: SUCCESS_GREEN, bg: alpha(SUCCESS_GREEN, 0.1) },
            partial: { color: WARNING_ORANGE, bg: alpha(WARNING_ORANGE, 0.1) },
            unpaid: { color: RUST, bg: alpha(RUST, 0.1) }
        };

        const style = config[status] || config.unpaid;

        return (
          <Chip
            label={status.toUpperCase()}
            size="small"
            sx={{ 
              fontSize: '0.65rem', 
              bgcolor: style.bg, 
              color: style.color,
              borderRadius: '4px'
            }}
          />
        );
      }
    }
  ];

  return (
    <Box sx={{ width: '100%', p: viewMode ? 0 : 3 }}>
      {loading ? (
        <Stack alignItems="center" py={10}>
          <CircularProgress size={24} sx={{ color: RUST }} />
          <Typography sx={{ mt: 2, color: RUST }}>Syncing Revenue Ledger...</Typography>
        </Stack>
      ) : viewMode && selectedPayment ? (
        <ViewPayment 
            data={selectedPayment} 
            onBack={() => {
                setViewMode(false);
                setSelectedPayment(null);
            }} 
        />
      ) : (
        <DataTable
          title="Payments"
          columns={columns}
          data={paymentRecords}
          primaryAction={{
            label: 'Record New Payment',
            onClick: () => { setEditData(null); setPaymentModalOpen(true); }
          }}
          onView={(id) => {
            const record = paymentRecords.find(p => p.id === id);
            if (record) { setSelectedPayment(record); setViewMode(true); }
          }}
          onEdit={(id) => {
            const record = paymentRecords.find(p => p.id === id);
            if (record) { setEditData(record); setPaymentModalOpen(true); }
          }}
          onDelete={(id) => {
            const record = paymentRecords.find(p => p.id === id);
            setDeleteConfirm({ open: true, data: record });
          }}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: '8px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, data: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: RUST }}>
          <WarningAmberIcon fontSize="small" /> Reverse Payment?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            Confirm reversal for invoice {deleteConfirm.data?.doc_no}? This will immediately restore the outstanding balance in the billing ledger.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setDeleteConfirm({ open: false, data: null })} sx={{ color: 'text.secondary', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleActualDelete} variant="contained" sx={{ bgcolor: RUST, '&:hover': { bgcolor: '#8e2133' }, textTransform: 'none', boxShadow: 'none' }}>Confirm Reversal</Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={paymentModalOpen} 
        onClose={() => setPaymentModalOpen(false)} 
        fullWidth 
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha(DARK_NAVY, 0.02) }}>
          <Typography variant="subtitle1" sx={{ color: DARK_NAVY }}>
            {editData ? `Edit Payment Record: ${editData.doc_no}` : 'Record New Payment'}
          </Typography>
          <IconButton size="small" onClick={() => setPaymentModalOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </Stack>
        <DialogContent sx={{ p: 0 }}>
            <Box sx={{ p: 3 }}>
                <AddPaymentForm
                    initialData={editData}
                    availableInvoices={billingRecords} 
                    onSuccess={() => {
                        setPaymentModalOpen(false);
                        setSnackbar({ open: true, message: 'Ledger updated successfully', severity: 'success' });
                        fetchPaymentData();
                    }}
                    onError={(msg: string) => setSnackbar({ open: true, message: msg, severity: 'error' })}
                />
            </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};