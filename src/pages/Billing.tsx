import { useState, useEffect, useCallback } from 'react';
import { 
  Box, Chip, alpha, Dialog, DialogContent, IconButton, 
  Typography, Stack, Snackbar, Alert, Button, CircularProgress,
  DialogTitle, DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { DataTable } from '../components/DataTable';
import { AddBillingForm } from '../components/Billing/AddBilling';
import { ViewInvoice } from '../components/Billing/ViewBill';

const RUST = '#b52841';
const DARK_NAVY = '#1a202c';

export const BillingPage = () => {
  const [billingRecords, setBillingRecords] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [editData, setEditData] = useState<any | null>(null);

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
      setSnackbar({ open: true, message: 'Failed to connect to Brookstack API', severity: 'error' });
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
        setSnackbar({ 
            open: true, 
            message: `Record ${deleteConfirm.data.doc_no} deleted successfully`, 
            severity: 'success' 
        });
        fetchBillingData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
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
      label: 'DOCUMENT NO', 
      render: (row: any) => (
        <Box>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: RUST }}>
            {row.doc_no || 'PENDING'}
          </Typography>
          <Chip 
              label={row.type?.toUpperCase()} 
              size="small" 
              sx={{ 
                height: 16, fontSize: '0.55rem', fontWeight: 900, 
                bgcolor: row.type === 'invoice' ? alpha('#2980b9', 0.1) : alpha('#8e44ad', 0.1),
                color: row.type === 'invoice' ? '#2980b9' : '#8e44ad',
                borderRadius: '4px', mt: 0.5
              }} 
          />
        </Box>
      ) 
    },
    { 
      id: 'client', 
      label: 'CLIENT CONTACT',
      render: (row: any) => (
        <Box>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: DARK_NAVY }}>
            {row.clientName || 'Unknown Client'}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: 'textSecondary', lineHeight: 1.2 }}>
            📧 {row.email || 'N/A'}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: 'textSecondary' }}>
            📞 {row.phone || 'N/A'}
          </Typography>
        </Box>
      )
    },
    { 
        id: 'financials', 
        label: 'FINANCIAL SUMMARY',
        render: (row: any) => (
            <Box>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 800 }}>
                    {row.currency} {Number(row.grand_total).toLocaleString()}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem' }}>
                      Sub: {Number(row.subtotal).toLocaleString()}
                  </Typography>
                </Stack>
            </Box>
        )
    },
    { 
      id: 'status', 
      label: 'STATUS',
      render: (row: any) => {
        const statusConfig: any = {
          paid: { color: '#198754', bg: alpha('#198754', 0.1) },
          pending: { color: '#f39c12', bg: alpha('#f39c12', 0.1) },
        };
        const config = statusConfig[row.status?.toLowerCase()] || statusConfig.pending;
        return (
          <Chip 
            label={row.status?.toUpperCase() || 'PENDING'}
            size="small"
            sx={{ bgcolor: config.bg, color: config.color, fontWeight: 800, fontSize: '0.65rem' }}
          />
        );
      }
    }
  ];

  return (
    <Box sx={{ width: '100%', p: viewMode ? 0 : 3 }}>
      {loading ? (
        <Stack alignItems="center" py={10}>
          <CircularProgress sx={{ color: RUST }} />
          <Typography sx={{ mt: 2, fontWeight: 700, color: RUST }}>Accessing Ledger...</Typography>
        </Stack>
      ) : viewMode && selectedInvoice ? (
        <ViewInvoice 
          data={selectedInvoice} 
          onBack={() => {
            setViewMode(false);
            setSelectedInvoice(null);
          }} 
        />
      ) : (
        <DataTable 
          title="Billing & Revenue" 
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
            const recordToDelete = billingRecords.find(r => r.id === id);
            setDeleteConfirm({ open: true, data: recordToDelete });
          }}
        />
      )}

      {/* --- DELETE CONFIRMATION DIALOG --- */}
      <Dialog 
        open={deleteConfirm.open} 
        onClose={() => setDeleteConfirm({ open: false, data: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800, color: '#d32f2f' }}>
          <WarningAmberIcon color="error" /> Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteConfirm.data?.doc_no}</strong>? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirm({ open: false, data: null })} variant="outlined" sx={{ color: DARK_NAVY, borderColor: DARK_NAVY }}>
            Cancel
          </Button>
          <Button 
            onClick={handleActualDelete} 
            variant="contained" 
            sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- TOP-RIGHT SUCCESS/ERROR NOTIFICATION --- */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })} 
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 2 }} // Added small top margin for spacing
      >
        <Alert 
            severity={snackbar.severity} 
            variant="filled" 
            sx={{ borderRadius: '8px', fontWeight: 600, width: '100%' }}
        >
            {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="md">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2, borderBottom: '1px solid #eee' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: DARK_NAVY }}>
            {editData ? `Edit ${editData.doc_no}` : 'New Billing Document'}
          </Typography>
          <IconButton onClick={() => setModalOpen(false)}><CloseIcon /></IconButton>
        </Stack>
        <DialogContent sx={{ p: 3 }}>
          <AddBillingForm 
            initialData={editData}
            customers={customers} 
            onSuccess={() => { 
              setModalOpen(false); 
              setSnackbar({ open: true, message: 'Billing generated successfully', severity: 'success' }); 
              fetchBillingData();
            }} 
            onError={(msg: string) => setSnackbar({ open: true, message: msg, severity: 'error' })}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};