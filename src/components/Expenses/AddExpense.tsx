import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Stack, Stepper, Step, 
  StepLabel, MenuItem, Grid, Alert, CircularProgress, alpha,
  Typography, Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { API_BASE_URL } from '../../config/api';

const RUST_COLOR = '#b52841';
const DARK_NAVY = "#1a202c";
const SUCCESS_GREEN = '#198754';

interface Expense {
    id: number;
    title: string;
    amount: string | number;
    category: string;
    status: 'paid' | 'unpaid';
    expense_date: string;
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
    title: '', // Title acts as the main "Type/Subject"
    amount: '',
    description: '',
    status: 'unpaid' as 'paid' | 'unpaid',
    document_url: '', 
    expense_date: new Date().toISOString().split('T')[0] // Silent capture
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        category: initialData.category || '',
        title: initialData.title || '',
        amount: initialData.amount?.toString() || '',
        description: initialData.description || '',
        status: initialData.status || 'unpaid',
        document_url: initialData.document_url || '',
        expense_date: initialData.expense_date || new Date().toISOString().split('T')[0]
      });
    }
  }, [initialData]);

  const steps = ['Classification & Files', 'Financials'];

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
      {error && <Alert severity="error" sx={{ mb: 2, fontSize: '0.85rem' }}>{error}</Alert>}

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: DARK_NAVY }}>{label}</Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ minHeight: '260px' }}>
        {activeStep === 0 && (
          <Grid container spacing={2.5}>
            <Grid size={12}>
              <TextField 
                select fullWidth size="small" label="Expense Category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {['Rent & Utilities', 'Payroll', 'Software Expenses', 'Office Admin', 'Miscellenous'].map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField 
                fullWidth size="small" label="Expense Title / Subject"
                placeholder="e.g. Monthly Rent"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </Grid>
            <Grid size={12}>
              <TextField 
                fullWidth size="small" label="Description" multiline rows={2}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </Grid>
            <Grid size={12}>
              <Box 
                sx={{ 
                  border: '2px dashed #e2e8f0', p: 2, textAlign: 'center', borderRadius: '12px',
                  bgcolor: '#f8fafc', cursor: 'pointer', transition: '0.2s',
                  '&:hover': { bgcolor: alpha(RUST_COLOR, 0.05), borderColor: RUST_COLOR }
                }}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <CloudUploadIcon sx={{ color: '#64748b', mb: 1 }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: DARK_NAVY }}>
                  {fileName ? fileName : 'Attach Receipt (Optional)'}
                </Typography>
                <input type="file" id="file-input" hidden onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" />
              </Box>
            </Grid>
          </Grid>
        )}

        {activeStep === 1 && (
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField 
                fullWidth label="Amount (KSh)" type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                slotProps={{ input: { sx: { fontWeight: 800, fontSize: '1.1rem' } } }}
              />
            </Grid>
            <Grid size={12}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1.5 }}>
                SET PAYMENT STATUS
              </Typography>
              <Stack direction="row" spacing={2}>
                {(['paid', 'unpaid'] as const).map((status) => (
                  <Chip
                    key={status}
                    label={status.toUpperCase()}
                    onClick={() => setFormData({...formData, status})}
                    sx={{
                      px: 2, fontWeight: 900, fontSize: '0.7rem',
                      bgcolor: formData.status === status 
                        ? (status === 'paid' ? SUCCESS_GREEN : RUST_COLOR) 
                        : alpha('#ccc', 0.2),
                      color: formData.status === status ? '#fff' : '#666',
                      '&:hover': { opacity: 0.8 },
                      transition: '0.2s'
                    }}
                  />
                ))}
              </Stack>
            </Grid>
            <Grid size={12} sx={{ mt: 2 }}>
               <Box sx={{ p: 2, bgcolor: alpha(DARK_NAVY, 0.03), borderRadius: '8px', border: '1px solid #eee' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    RECORDING DATE: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </Typography>
               </Box>
            </Grid>
          </Grid>
        )}
      </Box>

      <Stack direction="row" justifyContent="space-between" sx={{ mt: 4, pt: 2, borderTop: '1px solid #eee' }}>
        <Button 
          onClick={activeStep === 0 ? onClose : () => setActiveStep(0)}
          sx={{ fontWeight: 700, color: DARK_NAVY, textTransform: 'none' }}
        >
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        <Button 
          variant="contained" 
          disabled={loading || !isStepValid()}
          onClick={activeStep === 0 ? () => setActiveStep(1) : handleSubmit}
          sx={{ 
            bgcolor: RUST_COLOR, '&:hover': { bgcolor: '#9a2237' }, 
            fontWeight: 800, px: 4, textTransform: 'none', borderRadius: '8px' 
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : activeStep === 0 ? 'Continue' : 'Confirm & Save'}
        </Button>
      </Stack>
    </Box>
  );
};