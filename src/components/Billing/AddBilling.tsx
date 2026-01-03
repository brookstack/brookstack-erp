import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, TextField, Button, Stack, Stepper, Step, StepLabel, MenuItem, 
Grid, Typography, Divider, alpha, Paper, IconButton, CircularProgress, Alert, Chip
} from '@mui/material';
import { CheckCircle, AddCircle, Delete, Business, Description } from '@mui/icons-material';
import axios from 'axios';

// Brookstack Technologies Brand Colors
const RUST = '#b7410e';
const DARK_NAVY = '#1a202c';
const SUCCESS = '#198754';

// CONFIGURATION: Set your backend URL here
const API_BASE_URL = 'http://localhost:5000/api';

// --- ADDED onError TO INTERFACE ---
interface AddBillingFormProps {
  onSuccess: () => void;
  customers: any[];
  initialData?: any;
  onError: (msg: string) => void; 
}

export const AddBillingForm: React.FC<AddBillingFormProps> = ({ 
  onSuccess, 
  customers, 
  initialData, 
  onError 
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setInternalError] = useState<string | null>(null);

  const [form, setForm] = useState({
    type: 'invoice', 
    currency: 'KES', 
    clientId: '', 
    notes: '',
    services: [{ description: '', price: 0, vat: false, frequency: 'One-off' }]
  });

  useEffect(() => { 
    if (initialData) {
      setForm({ 
        ...initialData, 
        clientId: initialData.client_id,
        services: typeof initialData.services === 'string' ? JSON.parse(initialData.services) : initialData.services
      }); 
    }
  }, [initialData]);

  const selectedClient = useMemo(() => 
    customers.find(c => String(c.id) === String(form.clientId)), 
  [form.clientId, customers]);
  
  const totals = useMemo(() => {
    const sub = form.services.reduce((acc, curr) => acc + Number(curr.price), 0);
    const vat = form.services.reduce((acc, curr) => acc + (curr.vat ? curr.price * 0.16 : 0), 0);
    return { sub, vat, grand: sub + vat };
  }, [form.services]);

  const isStepValid = () => {
    if (activeStep === 0) return !!form.clientId;
    if (activeStep === 1) return form.services.length > 0 && form.services.every(s => s.description && s.price >= 0);
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setInternalError(null);
    try {
      const endpoint = initialData ? `${API_BASE_URL}/billing/${initialData.id}` : `${API_BASE_URL}/billing`;
      const method = initialData ? 'put' : 'post';
      
      // We send 'clientId' which our billing.js route then maps to 'client_id'
      await axios[method](endpoint, { 
        ...form, 
        sub: totals.sub, 
        vat: totals.vat, 
        grand: totals.grand 
      });
      
      onSuccess();
    } catch (err: any) { 
      const errorMsg = err.response?.data?.details || err.response?.data?.error || "Failed to save billing record.";
      setInternalError(errorMsg);
      // --- CALLING THE PROP ERROR HANDLER ---
      onError(errorMsg);
    } finally { 
      setLoading(false); 
    }
  };

  const fProps = { fullWidth: true, size: 'small' as const, slotProps: { input: { sx: { borderRadius: '8px', fontSize: '0.85rem' } } } };

  return (
    <Box sx={{ width: '100%' }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {['Details', 'Services', 'Preview'].map((l, i) => (
          <Step key={l} completed={activeStep > i}>
            <StepLabel StepIconComponent={() => activeStep > i ? <CheckCircle sx={{ color: SUCCESS }} /> : <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: activeStep === i ? RUST : '#ccc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>{i + 1}</Box>}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: activeStep === i ? RUST : '#8a92a6' }}>{l}</Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Grid container spacing={2}>
          <Grid size={6}><TextField {...fProps} select label="Type" value={form.type} onChange={e => setForm({...form, type: e.target.value})}><MenuItem value="invoice">Invoice</MenuItem><MenuItem value="quotation">Quotation</MenuItem></TextField></Grid>
          <Grid size={6}><TextField {...fProps} select label="Currency" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}>{['KES', 'USD', 'EUR'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}</TextField></Grid>
          <Grid size={12}><TextField {...fProps} select label="Select Client" value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})}>{customers.map(c => <MenuItem key={c.id} value={c.id}>{c.companyName}</MenuItem>)}</TextField></Grid>
          {selectedClient && (
            <Grid size={12}><Box sx={{ p: 2, bgcolor: alpha(RUST, 0.05), borderRadius: '8px', border: `1px dashed ${RUST}`, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Business sx={{ color: RUST }} />
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: RUST }}>CLIENT DETAILS</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedClient.companyName} — {selectedClient.contactPerson}</Typography>
              </Box>
            </Box></Grid>
          )}
        </Grid>
      )}

      {activeStep === 1 && (
        <Stack spacing={2}>
          {form.services.map((item, i) => (
            <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
              <Grid container spacing={1} alignItems="center">
                <Grid size={4}><TextField {...fProps} label="Service" value={item.description} onChange={e => { const s = [...form.services]; s[i].description = e.target.value; setForm({...form, services: s}); }} /></Grid>
                <Grid size={2}><TextField {...fProps} label="Price" type="number" value={item.price} onChange={e => { const s = [...form.services]; s[i].price = Number(e.target.value); setForm({...form, services: s}); }} /></Grid>
                <Grid size={3}><TextField {...fProps} select label="VAT" value={item.vat} onChange={e => { const s = [...form.services]; s[i].vat = e.target.value as any; setForm({...form, services: s}); }}><MenuItem value={false as any}>No VAT</MenuItem><MenuItem value={true as any}>16% VAT</MenuItem></TextField></Grid>
                <Grid size={2}><TextField {...fProps} select label="Freq" value={item.frequency} onChange={e => { const s = [...form.services]; s[i].frequency = e.target.value; setForm({...form, services: s}); }}><MenuItem value="One-off">One-off</MenuItem><MenuItem value="Monthly">Monthly</MenuItem><MenuItem value="Annually">Annually</MenuItem></TextField></Grid>
                <Grid size={1}><IconButton onClick={() => setForm({...form, services: form.services.filter((_, idx) => idx !== i)})} color="error"><Delete /></IconButton></Grid>
              </Grid>
            </Paper>
          ))}
          <Button startIcon={<AddCircle />} onClick={() => setForm({...form, services: [...form.services, {description: '', price: 0, vat: false, frequency: 'One-off'}]})} sx={{ color: RUST, fontWeight: 700, alignSelf: 'start' }}>Add Service Line</Button>
          <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
             <Stack spacing={0.5} alignItems="flex-end">
                <Typography variant="caption" color="textSecondary">Service Total: <strong>{form.currency} {totals.sub.toLocaleString()}</strong></Typography>
                <Typography variant="caption" color="textSecondary">VAT Total (16%): <strong>{form.currency} {totals.vat.toLocaleString()}</strong></Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: DARK_NAVY }}>Grand Total: {form.currency} {totals.grand.toLocaleString()}</Typography>
             </Stack>
             <TextField {...fProps} multiline rows={2} label="Notes / Payment Instructions" sx={{ mt: 2 }} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          </Box>
        </Stack>
      )}

      {activeStep === 2 && (
        <Paper elevation={0} sx={{ p: 4, borderRadius: '4px', border: '1px solid #ddd', bgcolor: '#fff', minHeight: '600px', position: 'relative' }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 6 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: DARK_NAVY, letterSpacing: -1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ bgcolor: RUST, color: '#fff', p: 0.5, borderRadius: '4px', display: 'flex' }}><Description fontSize="small" /></Box>
                BROOKSTACK
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: RUST, letterSpacing: 3, ml: 5 }}>TECHNOLOGIES</Typography>
            </Box>
            <Box textAlign="right">
              <Typography variant="h3" sx={{ fontWeight: 900, color: alpha(DARK_NAVY, 0.1), mt: -1 }}>{form.type.toUpperCase()}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>PREVIEW MODE</Typography>
            </Box>
          </Stack>

          <Grid container spacing={4} sx={{ mb: 5 }}>
            <Grid size={7}>
              <Typography variant="caption" sx={{ color: RUST, fontWeight: 800 }}>BILL TO</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: DARK_NAVY }}>{selectedClient?.companyName}</Typography>
              <Typography variant="body2" color="textSecondary">{selectedClient?.contactPerson}</Typography>
              <Typography variant="body2" color="textSecondary">{selectedClient?.email}</Typography>
            </Grid>
            <Grid size={5} textAlign="right">
              <Typography variant="caption" sx={{ color: RUST, fontWeight: 800 }}>DATE ISSUED</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</Typography>
            </Grid>
          </Grid>

          <Box sx={{ bgcolor: DARK_NAVY, color: '#fff', px: 2, py: 1, display: 'flex', borderRadius: '4px' }}>
            <Typography variant="caption" sx={{ flex: 2, fontWeight: 700 }}>DESCRIPTION</Typography>
            <Typography variant="caption" sx={{ flex: 1, fontWeight: 700, textAlign: 'center' }}>FREQ</Typography>
            <Typography variant="caption" sx={{ flex: 1, fontWeight: 700, textAlign: 'right' }}>AMOUNT ({form.currency})</Typography>
          </Box>

          {form.services.map((s, i) => (
            <Box key={i} sx={{ px: 2, py: 2, display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
              <Typography variant="body2" sx={{ flex: 2, fontWeight: 600 }}>{s.description}</Typography>
              <Box sx={{ flex: 1, textAlign: 'center' }}><Chip label={s.frequency} size="small" sx={{ fontSize: '0.65rem', height: 20, bgcolor: alpha(RUST, 0.1), color: RUST, fontWeight: 700 }} /></Box>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: 700, textAlign: 'right' }}>{s.price.toLocaleString()}</Typography>
            </Box>
          ))}

          <Stack alignItems="flex-end" sx={{ mt: 4, px: 2 }}>
            <Typography variant="body2" color="textSecondary">Subtotal: {totals.sub.toLocaleString()}</Typography>
            <Typography variant="body2" color="textSecondary">VAT (16%): {totals.vat.toLocaleString()}</Typography>
            <Divider sx={{ width: 150, my: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 900, color: RUST }}>{form.currency} {totals.grand.toLocaleString()}</Typography>
          </Stack>

          {form.notes && (
            <Box sx={{ mt: 6, p: 2, bgcolor: '#f8f9fa', borderLeft: `4px solid ${RUST}` }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: DARK_NAVY }}>NOTES</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{form.notes}</Typography>
            </Box>
          )}

          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', bgcolor: RUST }} />
        </Paper>
      )}

      <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
        <Button disabled={activeStep === 0 || loading} onClick={() => setActiveStep(p => p - 1)} sx={{ color: DARK_NAVY, fontWeight: 700 }}>Back</Button>
        <Button 
          variant="contained" 
          disabled={loading || !isStepValid()} 
          onClick={activeStep === 2 ? handleSubmit : () => setActiveStep(p => p + 1)} 
          sx={{ bgcolor: RUST, '&:hover': { bgcolor: alpha(RUST, 0.9) }, borderRadius: '8px', px: 4, fontWeight: 700 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : activeStep === 2 ? `Save ${form.type}` : 'Next'}
        </Button>
      </Stack>
    </Box>
  );
};