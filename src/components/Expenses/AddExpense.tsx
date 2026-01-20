import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Stack, Stepper, Step,
  StepLabel, MenuItem, Grid, Alert, CircularProgress, alpha,
  Typography, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { API_BASE_URL } from '../../config/api';

const RUST_COLOR = '#b52841';
const DARK_NAVY = "#1a202c";

interface Expense {
  id: number;
  title: string;
  amount: string | number;
  category: string;
  status: 'paid' | 'unpaid';
  description?: string;
  document_url?: string;
}

interface FormProps {
  onSuccess: () => void;
  onClose: () => void;
  initialData?: Expense | null;
}

export const AddExpenseForm: React.FC<FormProps> = ({ onSuccess, onClose, initialData }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category: '',
    title: '',
    amount: '',
    description: '',
    status: 'unpaid' as 'paid' | 'unpaid',
    document_url: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        category: initialData.category || '',
        title: initialData.title || '',
        amount: initialData.amount?.toString() || '',
        description: initialData.description || '',
        status: initialData.status || 'paid',
        document_url: initialData.document_url || '',
      });
    }
  }, [initialData]);

  const steps = ['Classification', 'Financials'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const isStepValid = () => {
    if (activeStep === 0) return formData.category !== '' && formData.title !== '';
    if (activeStep === 1) return formData.amount !== '' && parseFloat(formData.amount) > 0;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    const url = initialData ? `${API_BASE_URL}/expenses/${initialData.id}` : `${API_BASE_URL}/expenses`;
    const method = initialData ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save expense record.');
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {error && <Alert severity="error" sx={{ mb: 2, py: 0, fontSize: '0.8rem' }}>{error}</Alert>}

      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>{label}</Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ minHeight: '200px' }}>
        {activeStep === 0 && (
          <Grid container spacing={1.5}>
            <Grid size={12}>
              <TextField
                select fullWidth size="small" label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                slotProps={{ select: { sx: { fontSize: '0.85rem' } }, inputLabel: { sx: { fontSize: '0.85rem' } } }}
              >
                {['Rent & Utilities', 'Payroll', 'Software Expenses', 'Office Admin', 'Miscellaneous'].map(opt => (
                  <MenuItem key={opt} value={opt} sx={{ fontSize: '0.85rem' }}>{opt}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth size="small" label="Title / Subject"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                slotProps={{ input: { sx: { fontSize: '0.85rem' } }, inputLabel: { sx: { fontSize: '0.85rem' } } }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth size="small" label="Description (Optional)" multiline rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                slotProps={{ input: { sx: { fontSize: '0.85rem' } }, inputLabel: { sx: { fontSize: '0.85rem' } } }}
              />
            </Grid>
            <Grid size={12}>
              <Box
                sx={{
                  border: '1.5px dashed #cbd5e1', p: 1.5, textAlign: 'center', borderRadius: '8px',
                  bgcolor: '#f8fafc', cursor: 'pointer',
                  '&:hover': { bgcolor: alpha(RUST_COLOR, 0.05), borderColor: RUST_COLOR }
                }}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                  <CloudUploadIcon sx={{ color: '#64748b', fontSize: '1.2rem' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: DARK_NAVY }}>
                    {fileName ? fileName : 'Upload Receipt'}
                  </Typography>
                </Stack>
                <input type="file" id="file-input" hidden onChange={handleFileChange} />
              </Box>
            </Grid>
          </Grid>
        )}

        {activeStep === 1 && (
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                fullWidth size="small" label="Amount (KSh)" type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                slotProps={{ input: { sx: { fontSize: '0.85rem', fontWeight: 600 } }, inputLabel: { sx: { fontSize: '0.85rem' } } }}
              />
            </Grid>
            <Grid size={12}>
              <FormControl component="fieldset">
                <FormLabel sx={{ fontSize: '0.75rem', fontWeight: 700, mb: 0.5, color: DARK_NAVY }}>PAYMENT STATUS</FormLabel>
                <RadioGroup
                  row
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'paid' | 'unpaid' })}
                ><FormControlLabel
                    value="paid"
                    control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#198754' } }} />}
                    label={<Typography sx={{ fontSize: '0.85rem' }}>Paid</Typography>}
                  />
                  <FormControlLabel
                    value="unpaid"
                    control={<Radio size="small" sx={{ '&.Mui-checked': { color: RUST_COLOR } }} />}
                    label={<Typography sx={{ fontSize: '0.85rem' }}>Unpaid</Typography>}
                  />

                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
        )}
      </Box>

      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button
          onClick={activeStep === 0 ? onClose : () => setActiveStep(0)}
          sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'none', fontSize: '0.85rem' }}
        >
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        <Button
          variant="contained"
          disableElevation
          disabled={loading || !isStepValid()}
          onClick={activeStep === 0 ? () => setActiveStep(1) : handleSubmit}
          sx={{
            bgcolor: RUST_COLOR, fontWeight: 700, px: 3, textTransform: 'none',
            borderRadius: '6px', fontSize: '0.85rem'
          }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : activeStep === 0 ? 'Next' : 'Save Expense'}
        </Button>
      </Stack>
    </Box>
  );
};