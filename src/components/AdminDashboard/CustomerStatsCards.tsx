import React, { useEffect, useState } from 'react';
import { Paper, Box, Typography, Grid, alpha, CircularProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/PeopleAlt';
import PersonAddIcon from '@mui/icons-material/PersonAddAlt1';
import ExploreIcon from '@mui/icons-material/ExploreOutlined'; // Icon for Sales Leads
import TerminalIcon from '@mui/icons-material/Terminal'; // Icon for Software Projects
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

const SANS_STACK = 'ui-sans-serif, system-ui, sans-serif';
const RUST = '#b52841';
const SUCCESS_GREEN = '#10b981';
const LEAD_BLUE = '#0ea5e9';
const PURPLE = '#8b5cf6';

export const StatsSection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<any[]>([]);

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return parseFloat((((current - previous) / previous) * 100).toFixed(1));
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [custRes, projRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/customers`),
          axios.get(`${API_BASE_URL}/projects`)
        ]);

        const customers = custRes.data || [];
        const projects = projRes.data || [];

        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

        // Calculate Customer Stats
        const currentCust = {
          total: customers.length,
          active: customers.filter((c: any) => c.status?.toLowerCase() === 'active').length,
          leads: customers.filter((c: any) => c.status?.toLowerCase() === 'lead').length,
        };

        const prevCustData = customers.filter((c: any) => new Date(c.created_at || c.date_added) < oneMonthAgo);
        const prevCust = {
          total: prevCustData.length,
          active: prevCustData.filter((c: any) => c.status?.toLowerCase() === 'active').length,
          leads: prevCustData.filter((c: any) => c.status?.toLowerCase() === 'lead').length,
        };

        // Calculate Project Stats
        const currentProjCount = projects.length;
        const prevProjCount = projects.filter((p: any) => new Date(p.created_at || p.start_date) < oneMonthAgo).length;

        const preparedStats = [
          { 
            label: 'Total Customers', 
            value: currentCust.total, 
            color: PURPLE, 
            icon: <PeopleIcon sx={{ fontSize: '1.2rem' }} />, 
            trend: calculateTrend(currentCust.total, prevCust.total), 
            path: '/customers' 
          },
          { 
            label: 'Active Clients', 
            value: currentCust.active, 
            color: SUCCESS_GREEN, 
            icon: <PersonAddIcon sx={{ fontSize: '1.2rem' }} />, 
            trend: calculateTrend(currentCust.active, prevCust.active), 
            path: '/customers?status=active' 
          },
          { 
            label: 'Sales Leads', 
            value: currentCust.leads, 
            color: LEAD_BLUE, 
            icon: <ExploreIcon sx={{ fontSize: '1.2rem' }} />, 
            trend: calculateTrend(currentCust.leads, prevCust.leads), 
            path: '/customers?status=lead' 
          },
          { 
            label: 'Total Projects', 
            value: currentProjCount, 
            color: RUST, 
            icon: <TerminalIcon sx={{ fontSize: '1.2rem' }} />, 
            trend: calculateTrend(currentProjCount, prevProjCount), 
            path: '/projects' 
          },
        ];

        setStatsData(preparedStats);
      } catch (error) {
        console.error("Dashboard Stats Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {statsData.map((stat) => {
        const isPositive = stat.trend >= 0;
        return (
          <Grid size={{xs: 12, sm:6, md:3}} key={stat.label}>
            <Paper
              elevation={0}
              onClick={() => navigate(stat.path)}
              sx={{
                p: 2.5, borderRadius: '24px', border: '1px solid #f1f5f9', bgcolor: '#ffffff',
                display: 'flex', flexDirection: 'column', cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: `0 12px 24px ${alpha(stat.color, 0.12)}`,
                  borderColor: alpha(stat.color, 0.2),
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ p: 1, borderRadius: '12px', bgcolor: alpha(stat.color, 0.1), color: stat.color, display: 'flex' }}>
                  {stat.icon}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, borderRadius: '20px', bgcolor: isPositive ? alpha(SUCCESS_GREEN, 0.05) : alpha(RUST, 0.05) }}>
                  {isPositive ? <TrendingUpIcon sx={{ fontSize: '0.8rem', color: SUCCESS_GREEN }} /> : <TrendingDownIcon sx={{ fontSize: '0.8rem', color: RUST }} />}
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: isPositive ? SUCCESS_GREEN : RUST }}>
                    {isPositive ? '+' : ''}{stat.trend}%
                  </Typography>
                </Box>
              </Box>

              <Typography sx={{ color: '#64748b', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                {stat.label}
              </Typography>

              <Typography sx={{ fontWeight: 900, color: "#1e293b", fontSize: '1.75rem', fontFamily: SANS_STACK, letterSpacing: '-0.02em' }}>
                {loading ? <CircularProgress size={20} sx={{ color: '#e2e8f0' }} /> : stat.value.toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};