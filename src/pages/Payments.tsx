import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Chip, alpha, Dialog, DialogContent, IconButton,
  Typography, Stack, Snackbar, Alert, Button, CircularProgress,
  DialogTitle, DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// Components
import { DataTable } from '../components/DataTable';
import { AddPaymentForm } from '../components/Payments/PaymentsForm';
import { ViewPayment } from '../components/Payments/ViewPayment';
import { API_BASE_URL } from '../config/api';

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
        fetch(`${API_BASE_URL}/payments`),
        fetch(`${API_BASE_URL}/billing`) 
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
      const response = await fetch(`${API_BASE_URL}/payments/${deleteConfirm.data.id}`, {
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
      render: (row: any) => {
        if (!row.payment_date) return '---';
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
    {
      id: 'doc_no',
      label: 'INVOICE & CLIENT',
      render: (row: any) => (
        <Stack spacing={0}>
          <Typography sx={{ fontSize: '0.75rem', color: RUST, fontWeight: 700 }}>
            {row.doc_no}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary' }}>
            {row.clientName?.toUpperCase()}
          </Typography>
        </Stack>
      )
    },
    {
      id: 'services',
      label: 'SERVICES',
      render: (row: any) => {
        const masterBilling = billingRecords.find(b => b.id === row.billing_id);
        const servicesRaw = row.billing_services_json || masterBilling?.services;
        
        let servicesList = [];
        try {
            servicesList = typeof servicesRaw === 'string' ? JSON.parse(servicesRaw) : (servicesRaw || []);
        } catch (e) { servicesList = []; }

        if (servicesList.length === 0) return <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>---</Typography>;

        return (
          <Box sx={{ py: 0.5 }}>
            {servicesList.slice(0, 2).map((s: any, i: number) => (
              <Typography key={i} sx={{ fontSize: '0.7rem', color: DARK_NAVY, display: 'flex', alignItems: 'center', '&::before': { content: '"•"', marginRight: '4px', color: RUST } }}>
                {s.description || s.item_name}
              </Typography>
            ))}
            {servicesList.length > 2 && (
              <Typography variant="caption" sx={{ color: RUST, fontSize: '0.65rem', fontStyle: 'italic' }}>
                + {servicesList.length - 2} more
              </Typography>
            )}
          </Box>
        );
      }
    },
    {
      id: 'amount_paid',
      label: 'AMOUNT PAID',
      render: (row: any) => (
        <Typography sx={{ fontSize: '0.85rem', color: SUCCESS_GREEN, fontWeight: 700 }}>
          {row.currency || 'KES'} {Number(row.amount_paid).toLocaleString()}
        </Typography>
      )
    },
    {
      id: 'billing_status',
      label: 'INVOICE STATUS',
      render: (row: any) => {
        const masterBilling = billingRecords.find(b => b.id === row.billing_id);
        const status = (masterBilling?.status || row.billing_status || 'unpaid').toLowerCase();
        
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
              fontSize: '0.6rem', 
              bgcolor: style.bg, 
              color: style.color, 
              borderRadius: '4px', 
              fontWeight: 800 
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
          <Typography variant="body2" sx={{ mt: 2, color: RUST, fontWeight: 600 }}>
            Syncing Revenue Ledger...
          </Typography>
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
          onView={(id) => {
            const record = paymentRecords.find(p => p.id === id);
            if (record) {
              const masterBilling = billingRecords.find(b => b.id === record.billing_id);
              const allPaymentsForThisInvoice = paymentRecords
                .filter(p => p.billing_id === record.billing_id)
                .sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime());

              const currentIndex = allPaymentsForThisInvoice.findIndex(p => p.id === record.id);
              const paymentsBeforeThis = allPaymentsForThisInvoice.slice(0, currentIndex);
              const sumPrevious = paymentsBeforeThis.reduce((sum, p) => sum + Number(p.amount_paid), 0);
              
              const grandTotal = Number(masterBilling?.grand_total || record.billing_grand_total || 0);
              const paidNow = Number(record.amount_paid || 0);
              const outstandingAfterThis = grandTotal - (sumPrevious + paidNow);

              const enrichedData = {
                ...record,
                billing_services_json: masterBilling?.services || record.billing_services_json,
                billing_grand_total: grandTotal,
                billing_total_paid_before: sumPrevious,
                billing_outstanding: outstandingAfterThis,
                currency: masterBilling?.currency || record.currency || 'KES'
              };

              setSelectedPayment(enrichedData); 
              setViewMode(true); 
            }
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

      {/* Snackbar and Dialogs */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: '8px', fontFamily: 'inherit' }}>{snackbar.message}</Alert>
      </Snackbar>

      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, data: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: RUST, fontWeight: 700 }}>
          <WarningAmberIcon fontSize="small" /> Reverse Payment?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            Confirm reversal for invoice {deleteConfirm.data?.doc_no}? This will immediately restore the outstanding balance in the billing ledger.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setDeleteConfirm({ open: false, data: null })} sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleActualDelete} variant="contained" sx={{ bgcolor: RUST, '&:hover': { bgcolor: '#8e2133' }, textTransform: 'none', boxShadow: 'none', fontWeight: 600 }}>Confirm Reversal</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: '16px' } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha(DARK_NAVY, 0.02) }}>
          <Typography sx={{ color: DARK_NAVY, fontWeight: 700, fontSize: '0.9rem' }}>
            {editData ? `Edit Payment: ${editData.doc_no}` : 'Record New Payment'}
          </Typography>
          <IconButton size="small" onClick={() => setPaymentModalOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </Stack>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            <AddPaymentForm 
              initialData={editData} 
              availableInvoices={billingRecords} 
              onSuccess={() => { setPaymentModalOpen(false); fetchPaymentData(); }} 
              onError={(msg: string) => setSnackbar({ open: true, message: msg, severity: 'error' })} 
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};