import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, TextField, Button, Stack, Stepper, Step, StepLabel, MenuItem,
  Grid, Typography, Divider, alpha, Paper, IconButton, CircularProgress, Alert, useTheme, useMediaQuery,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { CheckCircle, AddCircle, Delete, Business } from '@mui/icons-material';
import axios from 'axios';

const RUST = '#b52841';
const DARK_NAVY = '#1a202c';
const SUCCESS = '#198754';
const API_BASE_URL = 'http://localhost:5000/api';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      await axios[method](endpoint, { ...form, sub: totals.sub, vat: totals.vat, grand: totals.grand });
      onSuccess();
    } catch (err: any) {
      const errorMsg = err.response?.data?.details || err.response?.data?.error || "Failed to save billing record.";
      setInternalError(errorMsg);
      onError(errorMsg);
    } finally { setLoading(false); }
  };

  const fProps = { fullWidth: true, size: 'small' as const, slotProps: { input: { sx: { borderRadius: '8px', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif" } } } };

  return (
    <Box sx={{ width: '100%', fontFamily: "'Inter', sans-serif" }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`}
      </style>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {['Client', 'Services', 'Preview'].map((l, i) => (
          <Step key={l} completed={activeStep > i}>
            <StepLabel StepIconComponent={() => activeStep > i ? <CheckCircle sx={{ color: SUCCESS }} /> : <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: activeStep === i ? RUST : '#ccc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>{i + 1}</Box>}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: activeStep === i ? RUST : '#8a92a6' }}>{l}</Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}><TextField {...fProps} select label="Document Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><MenuItem value="invoice">Invoice</MenuItem><MenuItem value="quotation">Quotation</MenuItem></TextField></Grid>
          <Grid size={{ xs: 6 }}><TextField {...fProps} select label="Currency" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>{['KES', 'USD', 'EUR'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}</TextField></Grid>
          <Grid size={{ xs: 12 }}><TextField {...fProps} select label="Select Client" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })}>{customers.map(c => <MenuItem key={c.id} value={c.id}>{c.companyName}</MenuItem>)}</TextField></Grid>
          {selectedClient && (
            <Grid size={{ xs: 12 }}><Box sx={{ p: 2, bgcolor: alpha(RUST, 0.05), borderRadius: '8px', border: `1px dashed ${RUST}`, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Business sx={{ color: RUST }} />
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: RUST, letterSpacing: 1 }}>CLIENT DETAILS</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedClient.companyName}</Typography>
                <Typography variant="caption" sx={{ display: 'block', color: 'textSecondary' }}>{selectedClient.contactPerson} | {selectedClient.email}</Typography>
              </Box>
            </Box></Grid>
          )}
        </Grid>
      )}

      {activeStep === 1 && (
        <Stack spacing={2}>
          {form.services.map((item, i) => (
            <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: '8px', position: 'relative', bgcolor: '#fcfcfc' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField {...fProps} label="Service Description" value={item.description} onChange={e => { const s = [...form.services]; s[i].description = e.target.value; setForm({ ...form, services: s }); }} />
                </Grid>
                <Grid size={{ xs: 6, sm: 2 }}>
                  <TextField {...fProps} label="Unit Cost" type="number" value={item.price} onChange={e => { const s = [...form.services]; s[i].price = Number(e.target.value); setForm({ ...form, services: s }); }} />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField {...fProps} select label="Tax Type" value={item.vat} onChange={e => { const s = [...form.services]; s[i].vat = e.target.value as any; setForm({ ...form, services: s }); }}>
                    <MenuItem value={false as any}>No VAT</MenuItem>
                    <MenuItem value={true as any}>VAT (16%)</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 10, sm: 2 }}>
                  <TextField {...fProps} select label="Frequency" value={item.frequency} onChange={e => { const s = [...form.services]; s[i].frequency = e.target.value; setForm({ ...form, services: s }); }}>
                    <MenuItem value="One-off">One-off</MenuItem>
                    <MenuItem value="Monthly">Monthly</MenuItem>
                    <MenuItem value="Annually">Annually</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 2, sm: 1 }} textAlign="right">
                  <IconButton onClick={() => setForm({ ...form, services: form.services.filter((_, idx) => idx !== i) })} color="error"><Delete /></IconButton>
                </Grid>
              </Grid>
            </Paper>
          ))}
          <Button startIcon={<AddCircle />} onClick={() => setForm({ ...form, services: [...form.services, { description: '', price: 0, vat: false, frequency: 'One-off' }] })} sx={{ color: RUST, fontWeight: 800, alignSelf: 'start', textTransform: 'none' }}>Add Service Line</Button>

          <Box sx={{ p: 2, bgcolor: alpha(DARK_NAVY, 0.02), borderRadius: '8px', border: '1px solid #eee' }}>
            <Stack spacing={1} alignItems="flex-end" sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>Subtotal: {form.currency} {totals.sub.toLocaleString()}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>VAT (16%): {form.currency} {totals.vat.toLocaleString()}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: RUST }}>Total: {form.currency} {totals.grand.toLocaleString()}</Typography>
            </Stack>
            <TextField {...fProps} multiline rows={2} label="Internal Notes / Terms & Conditions" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </Box>
        </Stack>
      )}

      {activeStep === 2 && (
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, borderRadius: '0px', border: '1px solid #ddd', bgcolor: '#fff', position: 'relative', overflow: 'hidden' }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 4 }} alignItems="center">
            <Box component="img" src="/logo.png" alt="Brookstack" sx={{ width: 240, height: 'auto' }} />
            <Box textAlign="right">
              <Typography variant="h5" sx={{ fontWeight: 900, color: alpha(DARK_NAVY, 0.1), mb: 0.5 }}>{form.type.toUpperCase()}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 800, color: DARK_NAVY }}>DRAFT DOCUMENT</Typography>
            </Box>
          </Stack>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 7 }}>
              <Typography variant="caption" sx={{ color: RUST, fontWeight: 800, letterSpacing: 1 }}>BILL TO</Typography>
              <Typography variant="body1" sx={{ fontWeight: 800, color: DARK_NAVY, mt: 0.5 }}>{selectedClient?.companyName}</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>{selectedClient?.email}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 5 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography variant="caption" sx={{ color: RUST, fontWeight: 800, letterSpacing: 1 }}>DATE ISSUED</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</Typography>
            </Grid>
          </Grid>

          {/* Detailed Financial Table */}
          <TableContainer sx={{ mb: 4, borderRadius: '4px', border: `1px solid ${alpha(DARK_NAVY, 0.05)}` }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: DARK_NAVY }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}>SERVICE DESCRIPTION</TableCell>
                  <TableCell align="right" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}>UNIT COST</TableCell>
                  <TableCell align="right" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}>VAT (16%)</TableCell>
                  <TableCell align="right" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}>TOTAL ({form.currency})</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {form.services.map((s, i) => {
                  const vatAmount = s.vat ? s.price * 0.16 : 0;
                  return (
                    <TableRow key={i}>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{s.description || 'Service Line Item'}</Typography>
                        <Typography variant="caption" color="textSecondary">{s.frequency}</Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>{s.price.toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>{vatAmount > 0 ? vatAmount.toLocaleString() : '-'}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.8rem' }}>{(s.price + vatAmount).toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack alignItems="flex-end" sx={{ mt: 3, px: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 500 }} color="textSecondary">Subtotal: {totals.sub.toLocaleString()}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 500 }} color="textSecondary">VAT Total: {totals.vat.toLocaleString()}</Typography>
            <Divider sx={{ width: 120, my: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 900, color: RUST }}>{form.currency} {totals.grand.toLocaleString()}</Typography>
          </Stack>

          {form.notes && (
            <Box sx={{ mt: 4, p: 2, bgcolor: alpha(RUST, 0.02), borderLeft: `4px solid ${RUST}` }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: DARK_NAVY, display: 'block', mb: 0.5 }}>TERMS & NOTES</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.5 }}>{form.notes}</Typography>
            </Box>
          )}

          <Box sx={{ mt: 4, height: '10px', bgcolor: RUST, mx: -4, mb: -4 }} />
        </Paper>
      )}

      <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
        <Button disabled={activeStep === 0 || loading} onClick={() => setActiveStep(p => p - 1)} sx={{ color: DARK_NAVY, fontWeight: 800, textTransform: 'none' }}>Back</Button>
        <Button
          variant="contained"
          disabled={loading || !isStepValid()}
          onClick={activeStep === 2 ? handleSubmit : () => setActiveStep(p => p + 1)}
          sx={{ bgcolor: RUST, '&:hover': { bgcolor: alpha(RUST, 0.9) }, borderRadius: '8px', px: { xs: 2, sm: 4 }, fontWeight: 800, textTransform: 'none' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : activeStep === 2 ? `Confirm & Save` : 'Continue to Preview'}
        </Button>
      </Stack>
    </Box>
  );
};