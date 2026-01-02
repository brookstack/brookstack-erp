import { Paper, Box, Typography, Grid, alpha } from '@mui/material';
import PeopleIcon from '@mui/icons-material/PeopleOutlined';
import GroupIcon from '@mui/icons-material/GroupOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import PersonOffIcon from '@mui/icons-material/PersonOffOutlined';

const stats = [
  { label: 'Total Users', value: '2', color: '#3a57e8', icon: <PeopleIcon /> },
  { label: 'User Groups', value: '2', color: '#d63384', icon: <GroupIcon /> },
  { label: 'Active Users', value: '2', color: '#198754', icon: <PersonAddIcon /> },
  { label: 'Inactive Users', value: '0', color: '#dc3545', icon: <PersonOffIcon /> },
];

export const StatsSection = () => (
  <Grid container spacing={3} sx={{ mb: 4 }}>
    {stats.map((stat) => (
      <Grid size={{xs: 12, sm: 6, md:3}} key={stat.label}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '12px',
            border: '1px solid #f1f1f1',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            // The colored left border from your design
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: '15%',
              bottom: '15%',
              width: '4px',
              backgroundColor: stat.color,
              borderRadius: '0 4px 4px 0',
            }
          }}
        >
          <Box sx={{ 
            p: 1.5, 
            borderRadius: '10px', 
            bgcolor: alpha(stat.color, 0.05), // Faded icon background
            color: stat.color,
            mr: 2,
            display: 'flex'
          }}>
            {stat.icon}
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#8a92a6', fontWeight: 600 }}>
              {stat.label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#232d42' }}>
              {stat.value}
            </Typography>
          </Box>
        </Paper>
      </Grid>
    ))}
  </Grid>
);