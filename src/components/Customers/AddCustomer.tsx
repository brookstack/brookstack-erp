import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Stack, Stepper, Step, 
  StepLabel, MenuItem, Grid, Alert, CircularProgress, alpha,
  Typography
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { API_BASE_URL } from '../../config/api';

const RUST_COLOR = '#b52841';
const RUST_HOVER = '#a0360d';
const SUCCESS_GREEN = '#198754';

interface FormProps {
  onSuccess: () => void;
  initialData?: any; 
}

export const AddCustomerForm: React.FC<FormProps> = ({ onSuccess, initialData }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyName: '', clientType: '', contactPerson: '', mobile: '',
    email: '', location: 'Kenya', city: '', building: '',
    serviceCategory: '', engagementType: '', description: '',
    accountManager: '', status: 'lead', notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        companyName: initialData.companyName || '',
        clientType: initialData.clientType || '',
        contactPerson: initialData.contactPerson || '',
        mobile: initialData.mobile || '',
        email: initialData.email || '',
        location: initialData.location || 'Kenya',
        city: initialData.city || '',
        building: initialData.building || '',
        serviceCategory: initialData.serviceCategory || '',
        engagementType: initialData.engagementType || '',
        description: initialData.description || '',
        accountManager: initialData.accountManager || '',
        status: initialData.status || 'lead',
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  const steps = ['Client Details', 'Service Details', 'Client Status'];

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isStepValid = () => {
    if (activeStep === 0) {
      return (
        formData.companyName.trim() !== '' &&
        formData.clientType !== '' &&
        formData.contactPerson.trim() !== '' &&
        formData.mobile.trim() !== '' &&
        isValidEmail(formData.email) &&
        formData.location !== '' &&
        formData.building.trim() !== '' // Added building to validation
      );
    }
    if (activeStep === 1) {
      return (
        formData.serviceCategory !== '' &&
        formData.engagementType !== '' &&
        formData.description.trim() !== ''
      );
    }
    if (activeStep === 2) {
      return (
        formData.accountManager !== '' &&
        formData.status !== '' &&
        formData.notes.trim() !== ''
      );
    }
    return false;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const url = initialData 
      ? `${API_BASE_URL}/customers/${initialData.id}` 
      : `${API_BASE_URL}/customers`;
    
    const method = initialData ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process customer data');
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
    if (error) setError(null);
  };

  const fieldProps = {
    fullWidth: true,
    required: true,
    size: 'small' as const,
    onChange: handleChange,
    slotProps: {
      inputLabel: { sx: { fontSize: '0.85rem' } },
      input: { sx: { fontSize: '0.85rem', borderRadius: '8px' } }
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {error && <Alert severity="error" sx={{ mb: 2, fontSize: '0.85rem' }}>{error}</Alert>}

      <Stepper activeStep={activeStep} alternativeLabel sx={{ pt: 1, mb: 4 }}>
        {steps.map((label, index) => {
          const completed = activeStep > index;
          return (
            <Step key={label} completed={completed}>
              <StepLabel 
                StepIconComponent={() => (
                  completed ? (
                    <CheckCircleIcon sx={{ color: SUCCESS_GREEN }} />
                  ) : (
                    <Box 
                      sx={{ 
                        width: 24, height: 24, borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: activeStep === index ? RUST_COLOR : '#ccc', color: '#fff', fontSize: '0.75rem', fontWeight: 700
                      }}
                    >
                      {index + 1}
                    </Box>
                  )
                )}
              >
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: activeStep === index ? RUST_COLOR : '#8a92a6' }}>
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          );
        })}
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
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField 
                {...fieldProps} 
                name="email" 
                label="Email Address" 
                type="email" 
                value={formData.email} 
                error={formData.email !== '' && !isValidEmail(formData.email)}
                helperText={formData.email !== '' && !isValidEmail(formData.email) ? "Enter a valid email address" : ""}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField {...fieldProps} select name="location" label="Location" value={formData.location}>
                <MenuItem value="Kenya" sx={{ fontSize: '0.85rem' }}>Kenya</MenuItem>
                <MenuItem value="Diaspora" sx={{ fontSize: '0.85rem' }}>Diaspora</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField {...fieldProps} name="city" label="City" value={formData.city} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField 
                {...fieldProps} 
                name="building" 
                label="Building / Office" 
                value={formData.building} 
                placeholder="e.g. Westside Towers, 4th Floor"
              />
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

      <Stack direction="row" justifyContent="space-between" sx={{ mt: 4, pt: 3, borderTop: '1px solid #f1f1f1' }}>
        <Button 
          disabled={activeStep === 0 || loading} 
          onClick={() => setActiveStep(prev => prev - 1)}
          sx={{ color: '#000', textTransform: 'none', fontWeight: 700 }}
        >
          Back
        </Button>
        
        <Button 
          variant="contained" 
          disabled={loading || !isStepValid()} 
          onClick={activeStep === steps.length - 1 ? handleSubmit : () => setActiveStep(prev => prev + 1)}
          sx={{ 
            bgcolor: RUST_COLOR, '&:hover': { bgcolor: RUST_HOVER }, 
            borderRadius: '8px', px: 4, textTransform: 'none', fontWeight: 700,
            '&.Mui-disabled': { bgcolor: alpha(RUST_COLOR, 0.3), color: '#fff' }
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: '#fff' }} />
          ) : (
            activeStep === steps.length - 1 ? (initialData ? 'Update Client' : 'Save Customer') : 'Continue'
          )}
        </Button>
      </Stack>
    </Box>
  );
};