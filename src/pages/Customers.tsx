import { useState, useEffect } from 'react'; // Added useEffect
import { 
  Box, 
  Chip, 
  alpha, 
  Dialog, 
  DialogContent, 
  IconButton, 
  Typography, 
  Stack,
  CircularProgress // For a better UX during loading
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DataTable } from '../components/DataTable';
import { AddCustomerForm } from '../components/Customers/MultiStepForm';

export const CustomersPage = () => {
  // --- New State ---
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // --- 1. Fetch Logic ---
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/customers');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Failed to load customers from Brookstack:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Run Fetch on Load ---
  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpen = () => setModalOpen(true);
  
  // Update handleClose to refresh data after a successful save
  const handleSuccess = () => {
    setModalOpen(false);
    fetchCustomers(); // Refresh the table list immediately
  };

  const columns = [
    { id: 'id', label: 'CLIENT ID' },
    { id: 'companyName', label: 'COMPANY NAME' },
    { id: 'clientType', label: 'CLIENT TYPE' },
    { id: 'serviceCategory', label: 'SERVICE CATEGORY' },
    { id: 'engagementType', label: 'ENGAGEMENT' },
    { id: 'accountManager', label: 'ACC. MANAGER' },
    { 
      id: 'status', 
      label: 'STATUS',
      render: (row: any) => {
        const statusConfig: Record<string, { color: string, bg: string }> = {
          active: { color: '#2ecc71', bg: alpha('#2ecc71', 0.1) },
          lead: { color: '#f1c40f', bg: alpha('#f1c40f', 0.1) },
          inactive: { color: '#e74c3c', bg: alpha('#e74c3c', 0.1) },
        };
        // Normalize status to lowercase to match DB ENUM
        const statusKey = row.status?.toLowerCase() || 'lead';
        const config = statusConfig[statusKey] || { color: '#8a92a6', bg: '#f1f1f1' };
        
        return (
          <Chip 
            label={statusKey.toUpperCase()} 
            size="small" 
            sx={{ 
              fontWeight: 800, 
              fontSize: '0.65rem', 
              borderRadius: '6px',
              height: '24px',
              backgroundColor: config.bg,
              color: config.color,
              border: `1px solid ${alpha(config.color, 0.2)}`,
              '& .MuiChip-label': { px: 1.5 }
            }} 
          />
        );
      }
    },
    // Map created_at from MySQL instead of 'created'
    { id: 'created_at', label: 'CREATED' }, 
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
          <CircularProgress sx={{ color: '#b7410e' }} />
          <Typography sx={{ mt: 2, color: '#8a92a6' }}>Loading from Brookstack...</Typography>
        </Stack>
      ) : (
        <DataTable 
          title="Clients" 
          columns={columns} 
          data={customers} // Using the live state here
          primaryAction={{
            label: 'Add Client',
            onClick: handleOpen,
          }}
          onView={(id) => console.log('Viewing', id)}
          onEdit={(id) => console.log('Editing', id)}
          onDelete={(id) => console.log('Deleting', id)}
        />
      )}

      <Dialog 
        open={modalOpen} 
        onClose={() => setModalOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 1, p: 1 } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#232d42', ml: 1 }}>
            Add New Client
          </Typography>
          <IconButton onClick={() => setModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Stack>
        
        <DialogContent sx={{ pt: 0, pb: 4 }}>
          {/* handleSuccess closes modal AND refreshes table */}
          <AddCustomerForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};