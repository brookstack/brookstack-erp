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

export const AddStaffForm: React.FC<FormProps> = ({ onSuccess, initialData }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role_id: '',
    status: 'active'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        full_name: initialData.full_name || '',
        email: initialData.email || '',
        password: '', // Keep blank for security during edits
        role_id: initialData.role_id || '',
        status: initialData.status || 'active'
      });
    }
  }, [initialData]);

  const steps = ['Staff Details', 'Access & Security'];

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isStepValid = () => {
    if (activeStep === 0) {
      return formData.full_name.trim() !== '' && isValidEmail(formData.email);
    }
    if (activeStep === 1) {
      const isRoleSelected = formData.role_id !== '';
      // New users MUST have a 6+ char password. Edits can leave it blank.
      const isPasswordValid = initialData ? true : formData.password.length >= 6;
      return isRoleSelected && isPasswordValid;
    }
    return false;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const url = initialData 
      ? `${API_BASE_URL}/users/${initialData.id}` 
      : `${API_BASE_URL}/users`;
    
    const method = initialData ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process staff data');
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
                    <Box sx={{ 
                        width: 24, height: 24, borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: activeStep === index ? RUST_COLOR : '#ccc', color: '#fff', fontSize: '0.75rem', fontWeight: 700
                      }}>
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
            <Grid size={{ xs: 12 }}>
              <TextField {...fieldProps} name="full_name" label="Full Name" value={formData.full_name} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField 
                {...fieldProps} 
                name="email" 
                label="Corporate Email Address" 
                type="email" 
                value={formData.email} 
                error={formData.email !== '' && !isValidEmail(formData.email)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField {...fieldProps} select name="status" label="Account Status" value={formData.status}>
                <MenuItem value="active" sx={{ fontSize: '0.85rem' }}>Active</MenuItem>
                <MenuItem value="inactive" sx={{ fontSize: '0.85rem' }}>Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        )}

        {activeStep === 1 && (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <TextField {...fieldProps} select name="role_id" label="Assign System Role" value={formData.role_id}>
                <MenuItem value="1" sx={{ fontSize: '0.85rem' }}>Administrator</MenuItem>
                <MenuItem value="2" sx={{ fontSize: '0.85rem' }}>Account Manager</MenuItem>
                <MenuItem value="3" sx={{ fontSize: '0.85rem' }}>Staff Member</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField 
                {...fieldProps} 
                name="password" 
                label={initialData ? "Change Password (Optional)" : "System Password"} 
                type="password" 
                value={formData.password}
                required={!initialData}
                placeholder={initialData ? "Leave blank to keep current" : "Min 6 characters"}
              />
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
            activeStep === steps.length - 1 ? (initialData ? 'Update Account' : 'Create Staff Member') : 'Next'
          )}
        </Button>
      </Stack>
    </Box>
  );
};