import React, { useState, useMemo } from 'react';
import {
  Box, TextField, Button, Stack, MenuItem, Typography, 
  InputAdornment, CircularProgress, Alert, alpha, Divider
} from '@mui/material';
import { AccountBalanceWallet, CalendarToday, Notes } from '@mui/icons-material';
import axios from 'axios';

const RUST = '#b52841';
const DARK_NAVY = '#1a202c';
const API_BASE_URL = 'http://localhost:5000/api';
const SUCCESS = '#198754';

interface AddPaymentFormProps {
  billingRecord: any; // The invoice/quotation object
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export const AddPaymentForm: React.FC<AddPaymentFormProps> = ({
  billingRecord,
  onSuccess,
  onError
}) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: billingRecord.grand_total || 0,
    payment_method: 'Bank Transfer',
    payment_date: new Date().toISOString().split('T')[0],
    reference_no: '',
    notes: ''
  });

  const remainingBalance = useMemo(() => {
    return Number(billingRecord.grand_total) - Number(form.amount);
  }, [billingRecord.grand_total, form.amount]);

  const handleSubmit = async () => {
    if (form.amount <= 0) return onError("Amount must be greater than 0");
    
    setLoading(true);
    try {
      // POST to a payments endpoint
      await axios.post(`${API_BASE_URL}/payments`, {
        billing_id: billingRecord.id,
        ...form
      });
      
      // Optional: If payment covers the full amount, the backend usually updates 
      // the billing status to 'paid'.
      
      onSuccess();
    } catch (err: any) {
      onError(err.response?.data?.error || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    slotProps: {
      input: {
        sx: { borderRadius: '8px', fontSize: '0.9rem', fontFamily: "'Inter', sans-serif" }
      }
    }
  };

  return (
    <Stack spacing={3} sx={{ p: 1 }}>
      <Box sx={{ p: 2, bgcolor: alpha(DARK_NAVY, 0.03), borderRadius: '8px', border: '1px solid #eee' }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: RUST, letterSpacing: 1 }}>
          RECORDING PAYMENT FOR
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 900, color: DARK_NAVY }}>
          {billingRecord.doc_no}
        </Typography>
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
          <Typography variant="body2" color="textSecondary">Total Amount:</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {billingRecord.currency} {Number(billingRecord.grand_total).toLocaleString()}
          </Typography>
        </Stack>
      </Box>

      <TextField
        fullWidth
        label="Amount Paid"
        type="number"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
        {...inputStyle}
        InputProps={{
          startAdornment: <InputAdornment position="start">{billingRecord.currency}</InputAdornment>,
        }}
      />

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
          label="Payment Date"
          type="date"
          value={form.payment_date}
          onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
          {...inputStyle}
          InputLabelProps={{ shrink: true }}
        />
      </Stack>

      <TextField
        fullWidth
        label="Reference No (e.g. Transaction ID)"
        placeholder="ABC123XYZ"
        value={form.reference_no}
        onChange={(e) => setForm({ ...form, reference_no: e.target.value })}
        {...inputStyle}
      />

      <TextField
        fullWidth
        multiline
        rows={2}
        label="Internal Payment Notes"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
        {...inputStyle}
      />

      <Divider />

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
            Remaining Balance
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 800, color: remainingBalance > 0 ? '#f39c12' : SUCCESS }}>
            {billingRecord.currency} {remainingBalance.toLocaleString()}
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          disabled={loading}
          onClick={handleSubmit}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AccountBalanceWallet />}
          sx={{ 
            bgcolor: DARK_NAVY, 
            '&:hover': { bgcolor: alpha(DARK_NAVY, 0.9) },
            borderRadius: '8px', px: 4, fontWeight: 800, textTransform: 'none'
          }}
        >
          {loading ? 'Processing...' : 'Post Payment'}
        </Button>
      </Stack>
    </Stack>
  );
};