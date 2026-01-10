import { useState, useEffect, useCallback } from 'react';
import {
  Box, Chip, alpha, Dialog, DialogContent, IconButton,
  Typography, Stack, Snackbar, Alert, Button, CircularProgress,
  DialogTitle, DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';

// Components
import { DataTable } from '../components/DataTable';
import { AddBillingForm } from '../components/Billing/AddBilling';
import { ViewInvoice } from '../components/Billing/ViewBill';
import { AddPaymentForm } from '../components/Payments/PaymentsForm';

const RUST = '#b52841';
const DARK_NAVY = '#1a202c';
const SUCCESS_GREEN = '#198754';
const WARNING_ORANGE = '#f39c12';

export const BillingPage = () => {
  const [billingRecords, setBillingRecords] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
        fetch('http://localhost:5000/api/billing'),
        fetch('http://localhost:5000/api/customers')
      ]);

      const billingData = await billingRes.json();
      const customerData = await customerRes.json();

      setBillingRecords(billingData);
      setCustomers(customerData);
    } catch (error) {
      setSnackbar({ open: true, message: 'Connection Error', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  const handleActualDelete = async () => {
    if (!deleteConfirm.data?.id) return;
    try {
      const response = await fetch(`http://localhost:5000/api/billing/${deleteConfirm.data.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSnackbar({ open: true, message: 'Record deleted', severity: 'success' });
        fetchBillingData();
      } else {
        throw new Error('Delete failed');
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setDeleteConfirm({ open: false, data: null });
    }
  };

  const columns = [
    {
      id: 'doc_no',
      label: 'DOCUMENT',
      render: (row: any) => (
        <Box>
          <Typography sx={{ fontSize: '0.75rem', color: RUST }}>
            {row.doc_no || 'PENDING'}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'textSecondary' }}>
            {row.type?.toUpperCase()}
          </Typography>
        </Box>
      )
    },
    {
      id: 'client',
      label: 'CLIENT',
      render: (row: any) => (
        <Typography sx={{ fontSize: '0.85rem', color: DARK_NAVY }}>
          {row.clientName || '---'}
        </Typography>
      )
    },
    {
      id: 'financials',
      label: 'INVOICE TOTAL',
      render: (row: any) => (
        <Typography sx={{ fontSize: '0.85rem' }}>
          {row.currency} {Number(row.grand_total).toLocaleString()}
        </Typography>
      )
    },
    {
      id: 'paid',
      label: 'TOTAL PAID',
      render: (row: any) => (
        <Typography sx={{ fontSize: '0.85rem', color: SUCCESS_GREEN }}>
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
          <Typography sx={{ fontSize: '0.85rem', color: balance > 0 ? RUST : SUCCESS_GREEN }}>
            {row.currency} {balance.toLocaleString()}
          </Typography>
        );
      }
    },
    {
      id: 'status',
      label: 'PAYMENT STATUS',
      render: (row: any) => {
        const totalPaid = Number(row.total_paid || 0);
        const grandTotal = Number(row.grand_total);
        
        let label = 'PENDING';
        let color = WARNING_ORANGE;

        if (totalPaid >= grandTotal && grandTotal > 0) {
          label = 'FULLY PAID';
          color = SUCCESS_GREEN;
        } else if (totalPaid > 0) {
          label = 'PARTIAL';
          color = '#2980b9';
        }

        return (
          <Chip
            label={label}
            size="small"
            sx={{ 
                bgcolor: alpha(color, 0.1), 
                color: color, 
                fontSize: '0.65rem',
                borderRadius: '6px' 
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
          <CircularProgress size={30} sx={{ color: RUST }} />
          <Typography sx={{ mt: 2, color: RUST }}>Syncing Ledger...</Typography>
        </Stack>
      ) : viewMode && selectedInvoice ? (
        <ViewInvoice data={selectedInvoice} onBack={() => { setViewMode(false); setSelectedInvoice(null); }} />
      ) : (
        <DataTable
          title="Billing & Invoice"
          columns={columns}
          data={billingRecords}
          primaryAction={{
            label: 'Generate Document',
            onClick: () => { setEditData(null); setModalOpen(true); }
          }}
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
            return row.type === 'invoice' && !isPaid ? ({
              label: 'Record Payment',  
              icon: <PaymentOutlinedIcon sx={{ fontSize: '1.2rem' }} />,   
              color: DARK_NAVY,
              onClick: (row) => { setPaymentTarget(row); setPaymentModalOpen(true); }
            }) : null;
          }}
        />
      )}

      {/* --- NOTIFICATIONS --- */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* --- DELETE DIALOG --- */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, data: null })}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.9rem' }}>
            Are you sure you want to remove {deleteConfirm.data?.doc_no}?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirm({ open: false, data: null })}>Cancel</Button>
          <Button onClick={handleActualDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* --- FORM MODAL --- */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="md">
        <DialogContent>
          <AddBillingForm
            initialData={editData}
            customers={customers}
            onSuccess={() => { setModalOpen(false); fetchBillingData(); }}
            onError={(msg) => setSnackbar({ open: true, message: msg, severity: 'error' })}
          />
        </DialogContent>
      </Dialog>

      {/* --- PAYMENT MODAL --- */}
      <Dialog open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ borderBottom: '1px solid #eee' }}>
          Receive Payment
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {paymentTarget && (
            <AddPaymentForm
              billingRecord={paymentTarget}
              onSuccess={() => {
                setPaymentModalOpen(false);
                setSnackbar({ open: true, message: 'Payment Updated', severity: 'success' });
                fetchBillingData();
              }}
              onError={(msg) => setSnackbar({ open: true, message: msg, severity: 'error' })}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};