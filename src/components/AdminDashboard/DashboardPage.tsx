import { Box, Typography, } from '@mui/material';
import { QuickActions } from './QuickActions';
import { StatsSection } from './StatsCard';

export default function DashboardPage() {
  return (
    // Minimal margins to match your ERP design
    <Box sx={{ width: '100%', px: 0.5 }}>
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 800, 
          mb: 4, 
          color: '#232d42',
          letterSpacing: '-0.5px' 
        }}
      >
        Admin Dashboard
      </Typography>
      
      {/* 1. Stats Cards Section (Total Users, etc.) */}
      <Box sx={{ mb: 4 }}>
        <StatsSection />
      </Box>
      
      {/* 2. Quick Actions Section (Manage Users, etc.) */}
      <Box>
        <QuickActions />
      </Box>
    </Box>
  );
}