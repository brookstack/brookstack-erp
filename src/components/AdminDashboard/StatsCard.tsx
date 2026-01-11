import React, { useEffect, useState } from 'react';
import { Paper, Box, Typography, Grid, alpha, CircularProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/PeopleAlt';
import PersonAddIcon from '@mui/icons-material/PersonAddAlt1';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SANS_STACK = 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
const RUST = '#b52841';
const SUCCESS_GREEN = '#10b981';
const LEAD_BLUE = '#0ea5e9';

export const StatsSection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ total: 0, active: 0, inactive: 0, leads: 0 });

  useEffect(() => {
    const fetchCustomerStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/customers');
        const data = response.data;
        setCounts({
          total: data.length,
          active: data.filter((c: any) => c.status?.toLowerCase() === 'active').length,
          inactive: data.filter((c: any) => c.status?.toLowerCase() === 'inactive').length,
          leads: data.filter((c: any) => c.status?.toLowerCase() === 'lead').length,
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
    { label: 'Total Customers', value: counts.total, color: '#8b5cf6', icon: <PeopleIcon sx={{ fontSize: '1.2rem' }} />, trend: '8.5% Up', filter: 'all' },
    { label: 'Active Customers', value: counts.active, color: SUCCESS_GREEN, icon: <PersonAddIcon sx={{ fontSize: '1.2rem' }} />, trend: '3.2% Up', filter: 'active' },
    { label: 'Total Leads', value: counts.leads, color: LEAD_BLUE, icon: <AssignmentIndIcon sx={{ fontSize: '1.2rem' }} />, trend: '12.4% Up', filter: 'lead' },
    { label: 'Inactive Customers', value: counts.inactive, color: RUST, icon: <PersonOffIcon sx={{ fontSize: '1.2rem' }} />, trend: '0.5% Down', filter: 'inactive' },
  ];

  const handleCardClick = (filter: string) => {
    // Navigates with a query string: /customers?status=active
    navigate(filter === 'all' ? '/customers' : `/customers?status=${filter}`);
  };

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {stats.map((stat) => (
        <Grid size={{xs: 12, sm:6, md:3}} key={stat.label}>
          <Paper
            elevation={0}
            onClick={() => handleCardClick(stat.filter)}
            sx={{
              p: 2, borderRadius: '16px', border: '1px solid #f3f4f6', bgcolor: '#ffffff',
              display: 'flex', flexDirection: 'column', position: 'relative', cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 20px -5px rgba(0,0,0,0.08)',
                borderColor: alpha(stat.color, 0.3),
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography sx={{ color: '#6b7280', fontWeight: 600, fontSize: '0.85rem', fontFamily: SANS_STACK, textTransform: 'uppercase' }}>
                {stat.label}
              </Typography>
              <Box sx={{ p: 1.2, borderRadius: '12px', bgcolor: alpha(stat.color, 0.1), color: stat.color, display: 'flex' }}>
                {loading ? <CircularProgress size={16} color="inherit" thickness={6} /> : stat.icon}
              </Box>
            </Box>
            <Typography sx={{ fontWeight: 800, color: "#000", fontSize: '1.75rem', mb: 1.5, fontFamily: SANS_STACK, letterSpacing: '-0.04em' }}>
              {loading ? '—' : stat.value.toLocaleString()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUpIcon sx={{ color: SUCCESS_GREEN, fontSize: '0.9rem' }} />
              <Typography sx={{ fontSize: '0.75rem', color: SUCCESS_GREEN, fontWeight: 700, fontFamily: SANS_STACK }}>
                {stat.trend} <Box component="span" sx={{ color: '#9ca3af', fontWeight: 400, ml: 0.5 }}>vs last month</Box>
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};