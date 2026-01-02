import { Box, Chip, alpha } from '@mui/material';
import { DataTable } from '../components/dataTable';

const dummyCustomers = [
  { 
    id: 'CL-001', 
    companyName: 'TechFlow Solutions', 
    clientType: 'Corporate', 
    serviceCategory: 'ERP Development', 
    engagementType: 'Retainer',
    accountManager: 'John Doe',
    status: 'Active', 
    created: 'Jan 02, 2026' 
  },
  { 
    id: 'CL-002', 
    companyName: 'Safari Ventures', 
    clientType: 'SME', 
    serviceCategory: 'Software Development', 
    engagementType: 'One Off',
    accountManager: 'Jane Smith',
    status: 'Lead', 
    created: 'Dec 28, 2025' 
  },
  { 
    id: 'CL-003', 
    companyName: 'Global Diaspora Bank', 
    clientType: 'Government', 
    serviceCategory: 'IT Consulting', 
    engagementType: 'Support Contract',
    accountManager: 'Robert Brown',
    status: 'Inactive', 
    created: 'Dec 15, 2025' 
  },
  { 
    id: 'CL-004', 
    companyName: 'Nexus FinTech', 
    clientType: 'Corporate', 
    serviceCategory: 'Systems Development', 
    engagementType: 'Retainer',
    accountManager: 'John Doe',
    status: 'Active', 
    created: 'Nov 12, 2025' 
  },
  { 
    id: 'CL-001', 
    companyName: 'TechFlow Solutions', 
    clientType: 'Corporate', 
    serviceCategory: 'ERP Development', 
    engagementType: 'Retainer',
    accountManager: 'John Doe',
    status: 'Active', 
    created: 'Jan 02, 2026' 
  },
  { 
    id: 'CL-002', 
    companyName: 'Safari Ventures', 
    clientType: 'SME', 
    serviceCategory: 'Software Development', 
    engagementType: 'One Off',
    accountManager: 'Jane Smith',
    status: 'Lead', 
    created: 'Dec 28, 2025' 
  },
  { 
    id: 'CL-003', 
    companyName: 'Global Diaspora Bank', 
    clientType: 'Government', 
    serviceCategory: 'IT Consulting', 
    engagementType: 'Support Contract',
    accountManager: 'Robert Brown',
    status: 'Inactive', 
    created: 'Dec 15, 2025' 
  },
  { 
    id: 'CL-004', 
    companyName: 'Nexus FinTech', 
    clientType: 'Corporate', 
    serviceCategory: 'Systems Development', 
    engagementType: 'Retainer',
    accountManager: 'John Doe',
    status: 'Active', 
    created: 'Nov 12, 2025' 
  },
  { 
    id: 'CL-001', 
    companyName: 'TechFlow Solutions', 
    clientType: 'Corporate', 
    serviceCategory: 'ERP Development', 
    engagementType: 'Retainer',
    accountManager: 'John Doe',
    status: 'Active', 
    created: 'Jan 02, 2026' 
  },
  { 
    id: 'CL-002', 
    companyName: 'Safari Ventures', 
    clientType: 'SME', 
    serviceCategory: 'Software Development', 
    engagementType: 'One Off',
    accountManager: 'Jane Smith',
    status: 'Lead', 
    created: 'Dec 28, 2025' 
  },
  { 
    id: 'CL-003', 
    companyName: 'Global Diaspora Bank', 
    clientType: 'Government', 
    serviceCategory: 'IT Consulting', 
    engagementType: 'Support Contract',
    accountManager: 'Robert Brown',
    status: 'Inactive', 
    created: 'Dec 15, 2025' 
  },
  { 
    id: 'CL-004', 
    companyName: 'Nexus FinTech', 
    clientType: 'Corporate', 
    serviceCategory: 'Systems Development', 
    engagementType: 'Retainer',
    accountManager: 'John Doe',
    status: 'Active', 
    created: 'Nov 12, 2025' 
  },
  { 
    id: 'CL-001', 
    companyName: 'TechFlow Solutions', 
    clientType: 'Corporate', 
    serviceCategory: 'ERP Development', 
    engagementType: 'Retainer',
    accountManager: 'John Doe',
    status: 'Active', 
    created: 'Jan 02, 2026' 
  },
  { 
    id: 'CL-002', 
    companyName: 'Safari Ventures', 
    clientType: 'SME', 
    serviceCategory: 'Software Development', 
    engagementType: 'One Off',
    accountManager: 'Jane Smith',
    status: 'Lead', 
    created: 'Dec 28, 2025' 
  },
  { 
    id: 'CL-003', 
    companyName: 'Global Diaspora Bank', 
    clientType: 'Government', 
    serviceCategory: 'IT Consulting', 
    engagementType: 'Support Contract',
    accountManager: 'Robert Brown',
    status: 'Inactive', 
    created: 'Dec 15, 2025' 
  },
  { 
    id: 'CL-004', 
    companyName: 'Nexus FinTech', 
    clientType: 'Corporate', 
    serviceCategory: 'Systems Development', 
    engagementType: 'Retainer',
    accountManager: 'John Doe',
    status: 'Active', 
    created: 'Nov 12, 2025' 
  },
  { 
    id: 'CL-001', 
    companyName: 'TechFlow Solutions', 
    clientType: 'Corporate', 
    serviceCategory: 'ERP Development', 
    engagementType: 'Retainer',
    accountManager: 'John Doe',
    status: 'Active', 
    created: 'Jan 02, 2026' 
  },
  { 
    id: 'CL-002', 
    companyName: 'Safari Ventures', 
    clientType: 'SME', 
    serviceCategory: 'Software Development', 
    engagementType: 'One Off',
    accountManager: 'Jane Smith',
    status: 'Lead', 
    created: 'Dec 28, 2025' 
  },
  { 
    id: 'CL-003', 
    companyName: 'Global Diaspora Bank', 
    clientType: 'Government', 
    serviceCategory: 'IT Consulting', 
    engagementType: 'Support Contract',
    accountManager: 'Robert Brown',
    status: 'Inactive', 
    created: 'Dec 15, 2025' 
  },
  { 
    id: 'CL-004', 
    companyName: 'Nexus FinTech', 
    clientType: 'Corporate', 
    serviceCategory: 'Systems Development', 
    engagementType: 'Retainer',
    accountManager: 'John Doe',
    status: 'Active', 
    created: 'Nov 12, 2025' 
  },
];

export const CustomersPage = () => {
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
    // Define the base colors for each status
    const statusConfig: Record<string, { color: string, bg: string }> = {
      Active: { color: '#2ecc71', bg: alpha('#2ecc71', 0.1) },   // Faded Green
      Lead: { color: '#f1c40f', bg: alpha('#f1c40f', 0.1) },     // Faded Yellow
      Inactive: { color: '#e74c3c', bg: alpha('#e74c3c', 0.1) }, // Faded Red
    };

    const config = statusConfig[row.status] || { color: '#8a92a6', bg: '#f1f1f1' };
    
    return (
      <Chip 
        label={row.status.toUpperCase()} 
        size="small" 
        sx={{ 
          fontWeight: 800, 
          fontSize: '0.65rem', 
          borderRadius: '6px', // Matches the Merchant reference look
          height: '24px',
          backgroundColor: config.bg,
          color: config.color,
          border: `1px solid ${alpha(config.color, 0.2)}`, // Subtle border
          '& .MuiChip-label': { px: 1.5 }
        }} 
      />
    );
  }
},
    { id: 'created', label: 'CREATED' },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <DataTable 
        title="Clients" 
        columns={columns} 
        data={dummyCustomers}
        primaryAction={{
          label: 'Add Client',
          onClick: () => console.log('Add Client clicked'),
        }}
        onView={(id) => console.log('Viewing', id)}
        onEdit={(id) => console.log('Editing', id)}
        onDelete={(id) => console.log('Deleting', id)}
      />
    </Box>
  );
};