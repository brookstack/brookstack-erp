import { Routes, Route, Navigate } from 'react-router-dom';
import { Typography } from '@mui/material';
import { DashboardLayout } from './layouts/DashboardLayouts';
import DashboardPage from './components/AdminDashboard/DashboardPage';
import { CustomersPage } from './pages/Customers';
import { BillingPage } from './pages/Billing';
import { PaymentsPage } from './pages/Payments';
import { LoginPage } from './pages/LoginPage'; // Ensure you created this file
import { StaffPage } from './pages/UsersPage';

// --- PROTECTED ROUTE COMPONENT ---
// This checks for the token before allowing access to the ERP
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // If no token, redirect to login page
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      {/* 1. Public Route: Login is always accessible */}
      <Route path="/login" element={<LoginPage />} />

      {/* 2. Protected Routes: Wrapped in both Security and Layout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/billing" element={<BillingPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/staff" element={<StaffPage />} />
                
                {/* Catch-all for authenticated users: redirect back to dashboard if route doesn't exist */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;