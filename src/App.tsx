import { Routes, Route } from 'react-router-dom';
import { Typography } from '@mui/material';
import { CustomersPage } from './pages/customers';
import { DashboardLayout } from './layouts/dashboardLayouts';

function App() {
  return (
    <DashboardLayout>
      {/* This "Routes" component acts as a switcher based on the URL */}
      <Routes>
        <Route path="/" element={<Typography variant="h4">Welcome to Brookstack</Typography>} />
        
        {/* When the URL is /customers, it will now show your table */}
        <Route path="/customers" element={<CustomersPage />} />
        
        {/* Placeholders for other pages */}
        <Route path="/billing" element={<Typography>Billing & Invoices Content</Typography>} />
        <Route path="/finance" element={<Typography>Finance Content</Typography>} />
        <Route path="/staff" element={<Typography>Staff Management Content</Typography>} />
      </Routes>
    </DashboardLayout>
  );
}

export default App;