import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Stack, Stepper, Step, 
  StepLabel, MenuItem, Grid, Alert, CircularProgress,
  Typography
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { API_BASE_URL } from '../../config/api';

const RUST_COLOR = '#b52841';
const RUST_HOVER = '#a0360d';
const SUCCESS_GREEN = '#198754';

interface FormProps {
  onSuccess: () => void;
  onError?: (msg: string) => void;
  initialData?: any; 
  selectedClient?: any;
}

export const AddProjectForm: React.FC<FormProps> = ({ onSuccess, onError, initialData, selectedClient }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [clients, setClients] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    project_name: '',
    description: '',
    client_id: '',
    lead_staff_id: '',
    project_type: '',
    status: 'Discovery',
    project_url: '',
    repo_url: '',
    tech_stack: '',
    notes: ''
  });

  // Load Dependencies
  useEffect(() => {
    const loadDependencies = async () => {
      try {
        const [clientRes, staffRes] = await Promise.all([
          fetch(`${API_BASE_URL}/customers`),
          fetch(`${API_BASE_URL}/users`)
        ]);
        
        const clientData = await clientRes.json();
        const staffData = await staffRes.json();
        
        setClients(clientData);
        setStaff(staffData);
      } catch (err) {
        setError("Failed to sync project dependencies.");
      } finally {
        setFetchingData(false);
      }
    };
    loadDependencies();
  }, []);

  // Handle Initial or Contextual Data
  useEffect(() => {
    if (initialData) {
      // EDIT MODE: Populate all fields
      setFormData({
        project_name: initialData.project_name || '',
        description: initialData.description || '',
        client_id: initialData.client_id || '',
        lead_staff_id: initialData.lead_staff_id || '',
        project_type: initialData.project_type || '',
        status: initialData.status || 'Discovery',
        project_url: initialData.project_url || '',
        repo_url: initialData.repo_url || '',
        tech_stack: initialData.tech_stack || '',
        notes: initialData.notes || ''
      });
    } else if (selectedClient) {
      // ADD MODE (from Customer Profile): Lock to that customer
      setFormData(prev => ({ ...prev, client_id: selectedClient.id }));
    } else {
      // ADD MODE (Global): Reset to empty to allow selection
      setFormData(prev => ({ 
        ...prev, 
        project_name: '', 
        description: '', 
        client_id: '',
        project_type: ''
      }));
    }
  }, [initialData, selectedClient]);

  const steps = ['Project Identity', 'Environment & Stack', 'Review & Launch'];

  const isStepValid = () => {
    if (activeStep === 0) {
      return (
        formData.client_id !== '' && 
        formData.project_type !== '' &&
        formData.project_name.trim() !== '' && 
        formData.description.trim() !== ''
      );
    }
    if (activeStep === 1) return formData.tech_stack.trim() !== '';
    if (activeStep === 2) return formData.status !== '' && formData.lead_staff_id !== '';
    return false;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const url = initialData ? `${API_BASE_URL}/projects/${initialData.id}` : `${API_BASE_URL}/projects`;
    const method = initialData ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Could not update project ledger.');
      onSuccess(); 
    } catch (err: any) {
      setError(err.message);
      if (onError) onError(err.message);
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

  if (fetchingData) return <Stack alignItems="center" p={5}><CircularProgress size={24} sx={{color: RUST_COLOR}} /></Stack>;

  return (
    <Box sx={{ width: '100%' }}>
      {error && <Alert severity="error" sx={{ mb: 2, fontSize: '0.85rem' }}>{error}</Alert>}

      <Stepper activeStep={activeStep} alternativeLabel sx={{ pt: 1, mb: 4 }}>
        {steps.map((label, index) => (
          <Step key={label} completed={activeStep > index}>
            <StepLabel 
               StepIconComponent={() => (
                activeStep > index ? <CheckCircleIcon sx={{ color: SUCCESS_GREEN }} /> :
                <Box sx={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: activeStep === index ? RUST_COLOR : '#ccc', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>{index + 1}</Box>
              )}
            >
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: activeStep === index ? RUST_COLOR : '#8a92a6' }}>{label}</Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ px: 1 }}>
        {activeStep === 0 && (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField 
                {...fieldProps} 
                select 
                name="client_id" 
                label="Assigned Client" 
                value={formData.client_id} 
                /* Only disable if we are EDITING an existing project 
                  OR if we have explicitly passed a selectedClient (from ViewCustomer)
                */
                disabled={Boolean(initialData) || (Boolean(selectedClient) && !initialData)}
              >
                {clients.map((c) => (
                  <MenuItem key={c.id} value={c.id} sx={{ fontSize: '0.85rem' }}>{c.companyName}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField {...fieldProps} select name="project_type" label="Software Category" value={formData.project_type}>
                {[
                  'Website Development', 'Hosting Services', 'IT Consulting', 
                  'ERP Development', 'Mobile App Development', 'Web App Development', 'SaaS Platform'
                ].map((opt) => (
                  <MenuItem key={opt} value={opt} sx={{ fontSize: '0.85rem' }}>{opt}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
                <TextField {...fieldProps} name="project_name" label="Project Name" value={formData.project_name} />
            </Grid>
            <Grid size={{ xs: 12 }}>
                <TextField 
                  {...fieldProps} 
                  multiline 
                  rows={3} 
                  name="description" 
                  label="Project Description" 
                  placeholder="Detailed scope and objectives..." 
                  value={formData.description} 
                />
            </Grid>
          </Grid>
        )}

        {activeStep === 1 && (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <TextField {...fieldProps} name="tech_stack" label="Core Stack" placeholder="e.g. React, PostgreSQL, Node.js" value={formData.tech_stack} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField {...fieldProps} required={false} name="project_url" label="Live URL" value={formData.project_url} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField {...fieldProps} required={false} name="repo_url" label="Repository (Git)" value={formData.repo_url} /></Grid>
          </Grid>
        )}

        {activeStep === 2 && (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField {...fieldProps} select name="lead_staff_id" label="Technical Lead" value={formData.lead_staff_id}>
                {staff.map((s) => (
                  <MenuItem key={s.id} value={s.id} sx={{ fontSize: '0.85rem' }}>
                    {s.full_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField {...fieldProps} select name="status" label="Development Phase" value={formData.status}>
                {['Design & Development', 'UAT','Completed', 'Retired'].map((stage) => (
                  <MenuItem key={stage} value={stage} sx={{ fontSize: '0.85rem' }}>{stage}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField {...fieldProps} multiline rows={3} name="notes" label="Technical Handover Notes" value={formData.notes} required={false} />
            </Grid>
          </Grid>
        )}
      </Box>

      <Stack direction="row" justifyContent="space-between" sx={{ mt: 4, pt: 3, borderTop: '1px solid #f1f1f1' }}>
        <Button disabled={activeStep === 0 || loading} onClick={() => setActiveStep(prev => prev - 1)} sx={{ color: '#666', fontWeight: 700, textTransform: 'none' }}>Previous</Button>
        <Button 
          variant="contained" 
          disabled={loading || !isStepValid()} 
          onClick={activeStep === steps.length - 1 ? handleSubmit : () => setActiveStep(prev => prev + 1)}
          sx={{ bgcolor: RUST_COLOR, '&:hover': { bgcolor: RUST_HOVER }, borderRadius: '8px', px: 4, fontWeight: 700, textTransform: 'none' }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : activeStep === steps.length - 1 ? (initialData ? 'Update Project' : 'Launch Project') : 'Next Step'}
        </Button>
      </Stack>
    </Box>
  );
};