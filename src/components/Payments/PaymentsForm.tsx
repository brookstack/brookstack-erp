import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, TextField, Button, Stack, MenuItem, Typography, 
  InputAdornment, CircularProgress, alpha, Divider, Grid
} from '@mui/material';
import { AccountBalanceWallet, Business, Call, Email } from '@mui/icons-material';
import axios from 'axios';

const RUST = '#b52841';
const DARK_NAVY = '#1a202c';
const API_BASE_URL = 'http://localhost:5000/api';
const SUCCESS = '#198754';

interface AddPaymentFormProps {
  initialData?: any;          
  availableInvoices?: any[];  
  billingRecord?: any;        
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export const AddPaymentForm: React.FC<AddPaymentFormProps> = ({
  initialData,
  availableInvoices = [],
  billingRecord,
  onSuccess,
  onError
}) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    billing_id: '',
    amount: 0,
    payment_method: 'Bank Transfer',
    payment_date: new Date().toISOString().split('T')[0],
    reference_no: '',
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        billing_id: initialData.billing_id,
        amount: Number(initialData.amount_paid || 0),
        payment_method: initialData.payment_method || 'Bank Transfer',
        payment_date: new Date(initialData.payment_date).toISOString().split('T')[0],
        reference_no: initialData.transaction_reference || '',
        notes: initialData.notes || ''
      });
    } else if (billingRecord) {
      setForm(prev => ({
        ...prev,
        billing_id: billingRecord.id,
        amount: Number(billingRecord.outstanding_balance || 0)
      }));
    }
  }, [initialData, billingRecord]);

  const selectedInvoice = useMemo(() => {
    if (billingRecord) return billingRecord;
    return availableInvoices.find(inv => inv.id === form.billing_id);
  }, [billingRecord, availableInvoices, form.billing_id]);

  /** * FINANCIAL CALCULATIONS
   * Standardized to pull strictly from Billing Table columns
   */
  const grandTotal = Number(selectedInvoice?.grand_total || 0);
  const totalPaidInDB = Number(selectedInvoice?.total_paid || 0);

  // If editing, we calculate the "Paid to Date" excluding the current record's old value
  const basePaid = initialData 
    ? totalPaidInDB - Number(initialData.amount_paid || 0) 
    : totalPaidInDB;

  // Projection logic: Adding the form input to the already paid amount
  const projectedTotalPaid = basePaid + Number(form.amount || 0);
  const projectedBalance = grandTotal - projectedTotalPaid;

  const handleSubmit = async () => {
    if (form.amount <= 0) return onError("Amount must be greater than 0");
    if (!form.billing_id) return onError("Please select an invoice");
    
    setLoading(true);
    try {
      const url = initialData ? `${API_BASE_URL}/payments/${initialData.id}` : `${API_BASE_URL}/payments`;
      const method = initialData ? 'put' : 'post';

      await axios[method](url, {
        billing_id: form.billing_id,
        payment_date: form.payment_date,
        amount_paid: form.amount,
        payment_method: form.payment_method,
        transaction_reference: form.reference_no,
        notes: form.notes
      });
      
      onSuccess();
    } catch (err: any) {
      onError(err.response?.data?.error || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    slotProps: { input: { sx: { borderRadius: '8px', fontSize: '0.9rem' } } }
  };

  return (
    <Stack spacing={3} sx={{ p: 1 }}>
      {selectedInvoice && (
        <Box sx={{ 
          p: 2.5, bgcolor: alpha(DARK_NAVY, 0.02), borderRadius: '12px', border: '1px solid', borderColor: alpha(DARK_NAVY, 0.08)
        }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: RUST, letterSpacing: 1, mb: 2, display: 'block' }}>
            {initialData ? 'EDITING TRANSACTION' : 'FINANCIAL SUMMARY'}
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <MetaItem icon={<Business fontSize="small" />} label="Client" value={selectedInvoice.clientName || '---'} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <MetaItem icon={<Call fontSize="small" />} label="Phone" value={selectedInvoice.clientPhone || '---'} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <MetaItem icon={<Email fontSize="small" />} label="Email" value={selectedInvoice.email || '---'} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 1.5, opacity: 0.5 }} />

          {/* FINANCIAL GRID: Showing the calculation from Already Paid */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <MetaItem label="Invoice No" value={selectedInvoice.doc_no} highlight={DARK_NAVY} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <MetaItem label="Invoice Total" value={`${selectedInvoice.currency} ${grandTotal.toLocaleString()}`} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <MetaItem 
                label="New Total Paid" 
                value={`${selectedInvoice.currency} ${projectedTotalPaid.toLocaleString()}`} 
                highlight={SUCCESS} 
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <MetaItem 
                label="New Balance" 
                value={`${selectedInvoice.currency} ${projectedBalance.toLocaleString()}`} 
                highlight={projectedBalance > 0 ? RUST : SUCCESS} 
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed #ccc' }}>
             <Typography variant="caption" sx={{ color: '#666', fontStyle: 'italic' }}>
                Note: This invoice has <strong>{selectedInvoice.currency} {totalPaidInDB.toLocaleString()}</strong> already recorded in the ledger. 
                Posting this payment will increase the total paid to <strong>{selectedInvoice.currency} {projectedTotalPaid.toLocaleString()}</strong>.
             </Typography>
          </Box>
        </Box>
      )}

      {/* Form Fields Section */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          fullWidth
          label="Payment Amount"
          type="number"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
          {...inputStyle}
          InputProps={{
            startAdornment: <InputAdornment position="start">{selectedInvoice?.currency || 'KES'}</InputAdornment>,
          }}
        />
        <TextField
          fullWidth
          label="Date Received"
          type="date"
          value={form.payment_date}
          onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
          {...inputStyle}
          InputLabelProps={{ shrink: true }}
        />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          select
          fullWidth
          label="Payment Method"
          value={form.payment_method}
          onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
          {...inputStyle}
        >
          {['Bank Transfer', 'M-Pesa', 'Cheque', 'Cash', 'Credit Card'].map(m => (
            <MenuItem key={m} value={m}>{m}</MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          label="Transaction Reference"
          placeholder="Ref No"
          value={form.reference_no}
          onChange={(e) => setForm({ ...form, reference_no: e.target.value })}
          {...inputStyle}
        />
      </Stack>

      <TextField
        fullWidth
        label="Internal Notes"
        multiline
        rows={2}
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
        {...inputStyle}
      />

      <Button
        variant="contained"
        fullWidth
        disabled={loading || !form.billing_id}
        onClick={handleSubmit}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AccountBalanceWallet />}
        sx={{ bgcolor: DARK_NAVY, borderRadius: '8px', py: 1.6, fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#000' } }}
      >
        {loading ? 'Processing...' : initialData ? 'Update Record' : 'Post Payment'}
      </Button>
    </Stack>
  );
};

const MetaItem = ({ icon, label, value, highlight }: { icon?: React.ReactNode, label: string; value: string; highlight?: string }) => (
  <Box>
    <Typography variant="caption" sx={{ color: '#777', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {icon} {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 800, color: highlight || DARK_NAVY, mt: 0.2 }}>
      {value}
    </Typography>
  </Box>
);