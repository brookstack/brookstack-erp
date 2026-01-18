import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Dialog, IconButton, Alert, Snackbar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  PersonAddAlt1Outlined as AddClientIcon,
  DescriptionOutlined as InvoiceIcon,
  AssignmentOutlined as ProjectIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { AddCustomerForm } from '../Customers/AddCustomer';
import { AddBillingForm } from '../Billing/AddBilling';
import { AddProjectForm } from '../Projects/AddProject';

const actions = [
  { id: 'client', label: 'Add a Client', Icon: AddClientIcon, color: '#3a57e8', bgColor: '#e3f2fd' },
  { id: 'invoice', label: 'Generate Invoice/Quote', Icon: InvoiceIcon, color: '#198754', bgColor: '#e8f5e9' },
  { id: 'project', label: 'Add a Project', Icon: ProjectIcon, color: '#6f42c1', bgColor: '#f3e5f5' },
];

export const QuickActions = () => {
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  
  // Single state for both success and error alerts
  const [alert, setAlert] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/customers`);
      setCustomers(response.data);
    } catch (err) {
      console.error("Failed to load customers", err);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleOpen = (id: string) => setOpenModal(id);
  const handleClose = () => setOpenModal(null);

  // Reusable notification trigger
  const notify = (message: string, severity: 'success' | 'error') => {
    setAlert({ open: true, message, severity });
  };

  const handleFormSuccess = (msg: string) => {
    handleClose();
    notify(msg, 'success');
    fetchCustomers(); // Refresh the client list for the next billing entry
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: '24px', border: '1px solid #f1f1f1', bgcolor: 'white' }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, mb: 2, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Quick Actions
        </Typography>

        <Grid container spacing={2}>
          {actions.map((action) => {
            const IconComponent = action.Icon;
            return (
              <Grid size={{ xs: 12, md: 4 }} key={action.id}>
                <Box
                  onClick={() => handleOpen(action.id)}
                  sx={{
                    p: 2, borderRadius: '16px', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', cursor: 'pointer',
                    transition: '0.2s ease-in-out', border: '1px solid transparent',
                    '&:hover': { bgcolor: 'white', borderColor: action.color, boxShadow: `0 8px 16px ${action.color}15`, transform: 'translateY(-2px)' }
                  }}
                >
                  <Box sx={{ width: 42, height: 42, borderRadius: '12px', bgcolor: action.bgColor, color: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                    <IconComponent sx={{ fontSize: '1.3rem' }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{action.label}</Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* --- MODAL WRAPPER --- */}
      <Dialog open={Boolean(openModal)} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {openModal === 'client' && 'Register New Client'}
            {openModal === 'invoice' && 'Create Invoice or Quote'}
            {openModal === 'project' && 'Launch New Project'}
          </Typography>
          <IconButton onClick={handleClose}><CloseIcon /></IconButton>
        </Box>

        <Box sx={{ p: 2 }}>
          {openModal === 'client' && (
             <AddCustomerForm onSuccess={() => handleFormSuccess('Client registered successfully!')} />
          )}

          {openModal === 'invoice' && (
            <AddBillingForm 
              onSuccess={() => handleFormSuccess('Invoice generated successfully!')} 
              onCancel={handleClose}
              onError={(msg) => notify(msg, 'error')}
              customers={customers}
            />
          )}

          {openModal === 'project' && (
            <AddProjectForm onSuccess={() => handleFormSuccess('Project launched successfully!')} />
          )}
        </Box>
      </Dialog>

      {/* REUSABLE SNACKBAR ALERTS */}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={5000} 
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
            onClose={() => setAlert({ ...alert, open: false })} 
            severity={alert.severity} 
            variant="filled" 
            sx={{ width: '100%', borderRadius: '10px', fontWeight: 600 }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};