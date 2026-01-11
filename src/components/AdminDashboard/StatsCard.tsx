import React, { useEffect, useState } from 'react';
import { Paper, Box, Typography, Grid, alpha, CircularProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/PeopleAlt';
import PersonAddIcon from '@mui/icons-material/PersonAddAlt1';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import axios from 'axios';

// System UI Font Stack for High-Precision Software
const SANS_STACK = 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
const RUST = '#b52841';
const SUCCESS_GREEN = '#10b981';
const DARK_NAVY = '#111827';

export const StatsSection = () => {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ total: 0, active: 0, inactive: 0 });

  useEffect(() => {
    const fetchCustomerStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/customers');
        const data = response.data;
        setCounts({
          total: data.length,
          active: data.filter((c: any) => c.status?.toLowerCase() === 'active').length,
          inactive: data.filter((c: any) => c.status?.toLowerCase() === 'inactive').length,
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
    { label: 'Inactive Customers', value: counts.inactive, color: RUST, icon: <PersonOffIcon sx={{ fontSize: '1.2rem' }} />, trend: '0.5% Down from yesterday' },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {stats.map((stat) => (
        <Grid size={{ xs: 12, md: 4 }} key={stat.label}>
          <Paper
            elevation={0}
            sx={{
              p: 2, // Reduced padding from 3 to 2
              borderRadius: '16px', // Slightly smaller radius for smaller card
              border: '1px solid #f3f4f6',
              bgcolor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {/* Top Row: Label and Icon */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography 
                sx={{ 
                  color: '#6b7280', 
                  fontWeight: 500, 
                  fontSize: '0.95rem', // Reduced from 1.1rem
                  fontFamily: SANS_STACK 
                }}
              >
                {stat.label}
              </Typography>
              <Box sx={{ 
                p: 1.2, // Reduced icon padding
                borderRadius: '14px', 
                bgcolor: alpha(stat.color, 0.1), 
                color: stat.color,
                display: 'flex'
              }}>
                {loading ? <CircularProgress size={16} color="inherit" thickness={6} /> : stat.icon}
              </Box>
            </Box>

            {/* Middle Row: Main Value */}
            <Typography 
              sx={{ 
                fontWeight: 700, 
                color: '#111827', 
                fontSize: '1.75rem', // Reduced from h3 size
                mb: 1.5,
                fontFamily: SANS_STACK,
                letterSpacing: '-0.03em'
              }}
            >
              {loading ? '—' : stat.value.toLocaleString()}
            </Typography>

            {/* Bottom Row: Trend Line */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUpIcon sx={{ color: SUCCESS_GREEN, fontSize: '1rem' }} />
              <Typography 
                sx={{ 
                  fontSize: '0.85rem', // Reduced from 0.95rem
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