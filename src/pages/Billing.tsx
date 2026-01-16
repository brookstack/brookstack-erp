import { useState, useEffect, useCallback } from 'react';
import {
  Box, Chip, alpha, Dialog, DialogContent,
  Typography, Stack, Snackbar, Alert, Button, CircularProgress,
  DialogTitle, DialogActions
} from '@mui/material';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

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
        fetch(`${API_BASE_URL}/billing`),
        fetch(`${API_BASE_URL}/customers`)
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
      const response = await fetch(`${API_BASE_URL}api/billing/${deleteConfirm.data.id}`, {
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
          <Typography sx={{ fontSize: '0.75rem', color: RUST, fontWeight: 700 }}>
            {row.doc_no || 'PENDING'}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
            {row.type?.toUpperCase()}
          </Typography>
        </Box>
      )
    },
    {
      id: 'client',
      label: 'CLIENT',
      render: (row: any) => (
        <Typography sx={{ fontSize: '0.85rem', color: DARK_NAVY, fontWeight: 500 }}>
          {row.clientName || '---'}
        </Typography>
      )
    },
    {
  id: 'services',
  label: 'SERVICE ITEMS',
  render: (row: any) => {
    // 1. Determine if the data is in row.items, row.services, or row.service_items
    // 2. Parse it if it's currently a string
    let items = [];
    try {
      const rawData = row.items || row.services || row.service_items || [];
      items = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    } catch (e) {
      items = [];
    }

    if (!Array.isArray(items) || items.length === 0) {
      return <Typography sx={{ fontSize: '0.8rem', color: 'text.disabled' }}>---</Typography>;
    }

    return (
      <Stack spacing={0.5} sx={{ py: 1 }}>
        {items.map((item: any, index: number) => (
          <Typography 
            key={index} 
            sx={{ 
              fontSize: '0.75rem', 
              color: DARK_NAVY,
              display: 'flex',
              alignItems: 'center',
              '&::before': {
                content: '"•"',
                marginRight: '8px',
                color: alpha(RUST, 0.5)
              }
            }}
          >
            {item.description}
          </Typography>
        ))}
      </Stack>
    );
  }
},
    {
      id: 'financials',
      label: 'BILL TOTAL',
      render: (row: any) => (
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 400 }}>
          {row.currency} {Number(row.grand_total).toLocaleString()}
        </Typography>
      )
    },
    {
      id: 'paid',
      label: 'PAID',
      render: (row: any) => (
        <Typography sx={{ fontSize: '0.85rem', color: SUCCESS_GREEN, fontWeight: 400 }}>
          {Number(row.total_paid || 0).toLocaleString()}
        </Typography>
      )
    },
    {
      id: 'balance',
      label: 'OUTSTANDING',
      render: (row: any) => {
        const balance = Number(row.grand_total) - Number(row.total_paid || 0);
        return (
          <Typography sx={{ fontSize: '0.85rem', color: balance > 0 ? RUST : SUCCESS_GREEN, fontWeight: 400 }}>
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
        
        let label = 'UNPAID';
        let color = RUST;

        if (totalPaid >= grandTotal && grandTotal > 0) {
          label = 'FULLY PAID';
          color = SUCCESS_GREEN;
        } else if (totalPaid > 0) {
          label = 'PARTIAL';
          color = WARNING_ORANGE;
        }

        return (
          <Chip
            label={label}
            size="small"
            sx={{ 
                bgcolor: alpha(color, 0.1), 
                color: color, 
                fontSize: '0.65rem',
                fontWeight: 800,
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
          <CircularProgress size={30} sx={{ color: RUST }} />
          <Typography sx={{ mt: 2, color: RUST, fontWeight: 600 }}>Syncing Ledger...</Typography>
        </Stack>
      ) : viewMode && selectedInvoice ? (
        <ViewInvoice data={selectedInvoice} onBack={() => { setViewMode(false); setSelectedInvoice(null); }} />
      ) : (
        <DataTable
          title="Billing"
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
              label: 'Pay',  
              icon: <PaymentOutlinedIcon sx={{ fontSize: '1.1rem' }} />,   
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* --- DELETE DIALOG --- */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, data: null })} PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptLongIcon color="error" /> Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.9rem' }}>
            Are you sure you want to permanently remove document <strong>{deleteConfirm.data?.doc_no}</strong>? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteConfirm({ open: false, data: null })} color="inherit">Cancel</Button>
          <Button onClick={handleActualDelete} color="error" variant="contained" sx={{ bgcolor: RUST }}>Delete Record</Button>
        </DialogActions>
      </Dialog>

      {/* --- FORM MODAL --- */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogContent sx={{ p: 4 }}>
          <AddBillingForm
            initialData={editData}
            customers={customers}
            onSuccess={() => { setModalOpen(false); fetchBillingData(); }}
            onError={(msg) => setSnackbar({ open: true, message: msg, severity: 'error' })}
          />
        </DialogContent>
      </Dialog>

      {/* --- PAYMENT MODAL --- */}
      <Dialog open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ borderBottom: '1px solid #eee', fontWeight: 500 }}>
          Record Payment Collection
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {paymentTarget && (
            <AddPaymentForm
              billingRecord={paymentTarget}
              onSuccess={() => {
                setPaymentModalOpen(false);
                setSnackbar({ open: true, message: 'Payment recorded successfully', severity: 'success' });
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