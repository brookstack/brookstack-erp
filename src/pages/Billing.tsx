import { useState, useEffect, useCallback } from 'react';
import { 
  Box, Chip, alpha, Dialog, DialogContent, IconButton, 
  Typography, Stack, Snackbar, Alert, Button, CircularProgress 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DataTable } from '../components/DataTable';
import { AddBillingForm } from '../components/Billing/AddBilling';
import { ViewInvoice } from '../components/Billing/ViewBill';

const RUST = '#b7410e';
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
    if (!deleteConfirm.data) return;
    try {
      const response = await fetch(`http://localhost:5000/api/billing/${deleteConfirm.data.id}`, { method: 'DELETE' });
      if (response.ok) {
        setSnackbar({ open: true, message: `Record deleted successfully`, severity: 'success' });
        fetchBillingData();
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Delete failed', severity: 'error' });
    } finally {
      setDeleteConfirm({ open: false, data: null });
    }
  };

  // --- RELEVANT COLUMNS MAPPED TO YOUR SCHEMA ---
  const columns = [
    { 
      id: 'doc_no', 
      label: 'DOCUMENT NO', 
      render: (row: any) => (
        <Box>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: RUST }}>
            {row.doc_no || 'PENDING'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'textSecondary', fontSize: '0.65rem' }}>
            ID: #{row.id?.toString().padStart(4, '0')}
          </Typography>
        </Box>
      ) 
    },
    { 
      id: 'client', 
      label: 'CLIENT & TYPE',
      render: (row: any) => (
        <Box>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: DARK_NAVY }}>
            {row.clientName || 'Unknown Client'}
          </Typography>
          <Chip 
              label={row.type?.toUpperCase()} 
              size="small" 
              sx={{ 
                height: 18, fontSize: '0.6rem', fontWeight: 900, 
                bgcolor: row.type === 'invoice' ? alpha('#2980b9', 0.1) : alpha('#8e44ad', 0.1),
                color: row.type === 'invoice' ? '#2980b9' : '#8e44ad',
                borderRadius: '4px', mt: 0.5
              }} 
          />
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
                  <Typography variant="caption" sx={{ fontSize: '0.65rem', color: RUST, fontWeight: 600 }}>
                      VAT: {Number(row.vat_total).toLocaleString()}
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
          cancelled: { color: '#d32f2f', bg: alpha('#d32f2f', 0.1) },
        };
        const config = statusConfig[row.status?.toLowerCase()] || statusConfig.pending;
        return (
          <Chip 
            label={row.status?.toUpperCase() || 'PENDING'}
            size="small"
            sx={{ 
              bgcolor: config.bg, color: config.color, fontWeight: 800, fontSize: '0.65rem',
              border: `1px solid ${config.color}`, height: 20
            }}
          />
        );
      }
    },
    { 
      id: 'created_at', 
      label: 'DATE', 
      render: (row: any) => (
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          {row.created_at ? new Date(row.created_at).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
          }) : '---'}
        </Typography>
      )
    },
  ];

  return (
    <Box sx={{ width: '100%', p: viewMode ? 0 : 3 }}>
      {loading ? (
        <Stack alignItems="center" py={10}>
          <CircularProgress sx={{ color: RUST }} />
          <Typography sx={{ mt: 2, fontWeight: 700, color: RUST }}>Accessing Brookstack Ledger...</Typography>
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
            onClick: () => {
              setEditData(null);
              setModalOpen(true);
            }
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

      {/* --- CONFIRMATION DIALOGS --- */}
      <Snackbar open={deleteConfirm.open} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="warning" variant="filled" action={
            <Stack direction="row" spacing={1}>
              <Button color="inherit" size="small" onClick={() => setDeleteConfirm({ open: false, data: null })}>CANCEL</Button>
              <Button variant="contained" size="small" onClick={handleActualDelete} sx={{ bgcolor: '#fff', color: '#d32f2f', '&:hover': { bgcolor: '#eee' } }}>DELETE</Button>
            </Stack>
        }>
          Delete {deleteConfirm.data?.type} <strong>{deleteConfirm.data?.doc_no}</strong>?
        </Alert>
      </Snackbar>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: '8px' }}>{snackbar.message}</Alert>
      </Snackbar>

      <Dialog open={modalOpen} onClose={() => { setModalOpen(false); setEditData(null); }} fullWidth maxWidth="md">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2, borderBottom: '1px solid #eee' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: DARK_NAVY }}>
            {editData ? `Edit ${editData.doc_no}` : 'New Billing Document'}
          </Typography>
          <IconButton onClick={() => { setModalOpen(false); setEditData(null); }}><CloseIcon /></IconButton>
        </Stack>
        <DialogContent sx={{ p: 3 }}>
          <AddBillingForm 
            initialData={editData}
            customers={customers} 
            onSuccess={() => { 
              setModalOpen(false); 
              setEditData(null);
              setSnackbar({ open: true, message: 'Document saved successfully', severity: 'success' }); 
              fetchBillingData();
            }} 
            onError={(msg: string) => {
               setSnackbar({ open: true, message: msg, severity: 'error' });
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};