import { Box, Typography, } from '@mui/material';
import { QuickActions } from './QuickActions';
import { StatsSection } from './StatsCard';

export default function DashboardPage() {
  return (
    // Minimal margins to match your ERP design
    <Box sx={{ width: '100%', px: 0.5 }}>
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 600, 
          mt:2,
          mb: 2, 
          ml:1,
          color: '#232d42',
          letterSpacing: '-0.5px' 
        }}
      >
        Admin Dashboard
      </Typography>
      <Box sx={{ mb: 4}}>
        <StatsSection />
      </Box>
      <Box>
        <QuickActions />
      </Box>
    </Box>
  );
}