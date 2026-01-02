import React, { useState } from 'react';
import {
  Box, TextField, Button, Stack, Stepper, Step, 
  StepLabel, MenuItem, Grid, Alert, CircularProgress
} from '@mui/material';

const RUST_COLOR = '#b7410e';
const RUST_HOVER = '#a0360d';

interface FormProps {
  onSuccess: () => void;
}

export const AddCustomerForm: React.FC<FormProps> = ({ onSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyName: '', clientType: '', contactPerson: '', mobile: '',
    email: '', location: 'Kenya', city: '', building: '',
    serviceCategory: '', engagementType: '', description: '',
    accountManager: '', status: 'lead', notes: ''
  });

  const steps = ['Client Details', 'Service Details', 'Client Status'];

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save customer');
      }

      onSuccess(); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fieldProps = {
    fullWidth: true,
    size: 'small' as const,
    onChange: handleChange,
    slotProps: {
      inputLabel: { sx: { fontSize: '0.85rem', fontWeight: 500 } },
      input: { sx: { fontSize: '0.85rem', borderRadius: '8px' } }
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stepper 
        activeStep={activeStep} 
        alternativeLabel
        sx={{ 
          pt: 1, mb: 4,
          '& .MuiStepLabel-label': { fontSize: '0.75rem', fontWeight: 600, mt: 1 },
          '& .MuiStepIcon-root.Mui-active': { color: RUST_COLOR }, 
          '& .MuiStepIcon-root.Mui-completed': { color: '#198754' } 
        }}
      >
        {steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      <Box sx={{ px: 1 }}>
        {activeStep === 0 && (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}><TextField {...fieldProps} name="companyName" label="Company Name" value={formData.companyName} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField {...fieldProps} select name="clientType" label="Client Type" value={formData.clientType}>
                {['Government', 'Corporate', 'SME', 'Individual'].map((opt) => (
                  <MenuItem key={opt} value={opt} sx={{ fontSize: '0.85rem' }}>{opt}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField {...fieldProps} name="contactPerson" label="Contact Person" value={formData.contactPerson} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField {...fieldProps} name="mobile" label="Mobile Number" value={formData.mobile} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField {...fieldProps} name="email" label="Email Address" value={formData.email} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField {...fieldProps} select name="location" label="Location" value={formData.location}>
                <MenuItem value="Kenya" sx={{ fontSize: '0.85rem' }}>Kenya</MenuItem>
                <MenuItem value="Diaspora" sx={{ fontSize: '0.85rem' }}>Diaspora</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        )}

        {activeStep === 1 && (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField {...fieldProps} select name="serviceCategory" label="Service Category" value={formData.serviceCategory}>
                {['Software Development', 'ERP Development', 'IT Consulting'].map((opt) => (
                  <MenuItem key={opt} value={opt} sx={{ fontSize: '0.85rem' }}>{opt}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField {...fieldProps} select name="engagementType" label="Engagement Type" value={formData.engagementType}>
                {['One Off', 'Retainer', 'Support Contract'].map((opt) => (
                  <MenuItem key={opt} value={opt} sx={{ fontSize: '0.85rem' }}>{opt}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField {...fieldProps} multiline rows={4} name="description" label="Service Description" value={formData.description} />
            </Grid>
          </Grid>
        )}

        {activeStep === 2 && (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField {...fieldProps} select name="accountManager" label="Account Manager" value={formData.accountManager}>
                <MenuItem value="Dennis Obota" sx={{ fontSize: '0.85rem' }}>Dennis Obota</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField {...fieldProps} select name="status" label="Client Status" value={formData.status}>
                <MenuItem value="lead" sx={{ fontSize: '0.85rem' }}>Lead</MenuItem>
                <MenuItem value="active" sx={{ fontSize: '0.85rem' }}>Active</MenuItem>
                <MenuItem value="inactive" sx={{ fontSize: '0.85rem' }}>Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField {...fieldProps} multiline rows={4} name="notes" label="Notes" value={formData.notes} />
            </Grid>
          </Grid>
        )}
      </Box>

      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center"
        sx={{ mt: 4, pt: 3, borderTop: '1px solid #f1f1f1' }}
      >
        <Button 
          disabled={activeStep === 0 || loading} 
          onClick={() => setActiveStep(prev => prev - 1)} 
          sx={{ color: '#000', textTransform: 'none', fontWeight: 700, fontSize: '0.85rem' }}
        >
          Back
        </Button>
        
        <Button 
          variant="contained" 
          disabled={loading}
          onClick={activeStep === steps.length - 1 ? handleSubmit : () => setActiveStep(prev => prev + 1)}
          sx={{ 
            bgcolor: RUST_COLOR, 
            '&:hover': { bgcolor: RUST_HOVER }, 
            borderRadius: '8px', px: 4, py: 1,
            textTransform: 'none', boxShadow: 'none', fontSize: '0.85rem', fontWeight: 600
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: '#fff' }} />
          ) : (
            activeStep === steps.length - 1 ? 'Save Customer' : 'Continue'
          )}
        </Button>
      </Stack>
    </Box>
  );
};