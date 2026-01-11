import React, { useEffect, useState } from 'react';
import { Paper, Box, Typography, Grid, alpha, CircularProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/PeopleAlt';
import PersonAddIcon from '@mui/icons-material/PersonAddAlt1';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'; // Icon for Leads
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import axios from 'axios';

const SANS_STACK = 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
const RUST = '#b52841';
const SUCCESS_GREEN = '#10b981';
const LEAD_BLUE = '#0ea5e9'; // Professional blue for leads

export const StatsSection = () => {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ total: 0, active: 0, inactive: 0, leads: 0 });

  useEffect(() => {
    const fetchCustomerStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/customers');
        const data = response.data;
        
        // Assuming leads might come from a different status or endpoint in the future, 
        // for now we filter or placeholder them based on your current logic.
        setCounts({
          total: data.length,
          active: data.filter((c: any) => c.status?.toLowerCase() === 'active').length,
          inactive: data.filter((c: any) => c.status?.toLowerCase() === 'inactive').length,
          leads: data.filter((c: any) => c.status?.toLowerCase() === 'lead').length, // Added lead filtering
        });
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerStats();
  }, []);

  const stats = [
    { label: 'Total Customers', value: counts.total, color: '#8b5cf6', icon: <PeopleIcon sx={{ fontSize: '1.2rem' }} />, trend: '8.5% Up from yesterday' },
    { label: 'Active Customers', value: counts.active, color: SUCCESS_GREEN, icon: <PersonAddIcon sx={{ fontSize: '1.2rem' }} />, trend: '3.2% Up from last week' },
    { 
      label: 'Total Leads', 
      value: counts.leads, 
      color: LEAD_BLUE, 
      icon: <AssignmentIndIcon sx={{ fontSize: '1.2rem' }} />, 
      trend: '12.4% Up from yesterday' 
    },
    { label: 'Inactive Customers', value: counts.inactive, color: RUST, icon: <PersonOffIcon sx={{ fontSize: '1.2rem' }} />, trend: '0.5% Down from yesterday' },
  ];

  return (
    <Grid container spacing={1} sx={{ mb: 4 }}>
      {stats.map((stat) => (
        // Changed md: 4 to md: 3 to fit 4 cards in a row (12 / 4 = 3)
        <Grid size= {{xs: 12, sm: 6, md: 3}} key={stat.label}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '16px',
              border: '1px solid #f3f4f6',
              bgcolor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)'
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography 
                sx={{ 
                  color: '#6b7280', 
                  fontWeight: 500, 
                  fontSize: '0.875rem', 
                  fontFamily: SANS_STACK 
                }}
              >
                {stat.label}
              </Typography>
              <Box sx={{ 
                p: 1.2, 
                borderRadius: '14px', 
                bgcolor: alpha(stat.color, 0.1), 
                color: stat.color,
                display: 'flex'
              }}>
                {loading ? <CircularProgress size={16} color="inherit" thickness={6} /> : stat.icon}
              </Box>
            </Box>

            <Typography 
              sx={{ 
                fontWeight: 700, 
                color: '#111827', 
                fontSize: '1.5rem', 
                mb: 1.5,
                fontFamily: SANS_STACK,
                letterSpacing: '-0.03em'
              }}
            >
              {loading ? '—' : stat.value.toLocaleString()}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUpIcon sx={{ color: SUCCESS_GREEN, fontSize: '0.9rem' }} />
              <Typography 
                sx={{ 
                  fontSize: '0.8rem', 
                  color: SUCCESS_GREEN, 
                  fontWeight: 600,
                  fontFamily: SANS_STACK 
                }}
              >
                {stat.trend.split(' ')[0]} 
                <Box component="span" sx={{ color: '#9ca3af', fontWeight: 400, ml: 0.5 }}>
                  {stat.trend.split(' ').slice(1).join(' ')}
                </Box>
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};