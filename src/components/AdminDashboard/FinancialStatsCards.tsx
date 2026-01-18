import React, { useEffect, useState } from 'react';
import { Paper, Box, Typography, Grid, alpha, Stack, Divider, CircularProgress } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

const SANS_STACK = 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
const RUST = '#b52841';
const SUCCESS_GREEN = '#10b981';
const DARK_NAVY = '#1a202c';

interface CurrencyTotals { KES: number; USD: number; }
interface MetricStats { cumulative: CurrencyTotals; thisMonth: CurrencyTotals; }

export const FinancialStatsSection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState<any[]>([]);

  useEffect(() => {
    const fetchFinancialStats = async () => {
      try {
        const [billRes, payRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/billing`),
          axios.get(`${API_BASE_URL}/payments`)
        ]);

        const bills = Array.isArray(billRes.data) ? billRes.data : [];
        const payments = Array.isArray(payRes.data) ? payRes.data : [];
        
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Helper to aggregate totals by currency and date
        const getAggregatedTotals = (data: any[], amountKey: string): MetricStats => {
          const result: MetricStats = { 
            cumulative: { KES: 0, USD: 0 }, 
            thisMonth: { KES: 0, USD: 0 } 
          };
          
          data.forEach(item => {
            let rawCurr = (item.currency || 'KES').toUpperCase();
            if (rawCurr === 'KSH') rawCurr = 'KES';
            
            if (rawCurr === 'KES' || rawCurr === 'USD') {
              const curr = rawCurr as keyof CurrencyTotals;
              const date = new Date(item.created_at || item.payment_date || item.date_added);
              const val = Number(item[amountKey] || 0);

              if (!isNaN(val)) {
                result.cumulative[curr] += val;
                if (date >= startOfMonth) result.thisMonth[curr] += val;
              }
            }
          });
          return result;
        };

        const billedAmount = getAggregatedTotals(bills, 'grand_total');
        const paidAmount = getAggregatedTotals(payments, 'amount_paid');
        
        // FIX: Calculate Outstanding as the actual remaining balance
        const outstandingAmount: MetricStats = {
          cumulative: {
            KES: billedAmount.cumulative.KES - paidAmount.cumulative.KES,
            USD: billedAmount.cumulative.USD - paidAmount.cumulative.USD,
          },
          thisMonth: {
            KES: billedAmount.thisMonth.KES - paidAmount.thisMonth.KES,
            USD: billedAmount.thisMonth.USD - paidAmount.thisMonth.USD,
          }
        };

        setFinancialData([
          { 
            label: 'Invoice Amounts', 
            icon: <AccountBalanceWalletIcon />, 
            color: '#6366f1', 
            stats: billedAmount,
            path: '/billing'
          },
          { 
            label: 'Total Payments', 
            icon: <PriceCheckIcon />, 
            color: SUCCESS_GREEN, 
            stats: paidAmount,
            path: '/payments'
          },
          { 
            label: 'Outstanding', 
            icon: <ErrorOutlineIcon />, 
            color: RUST, 
            stats: outstandingAmount,
            path: '/billing',
            query: 'status=unpaid,partial' 
          }
        ]);
      } catch (error) {
        console.error("Financial Stats Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFinancialStats();
  }, []);

  const handleNavigation = (item: any) => {
    if (item.query) {
      navigate(`${item.path}?${item.query}`);
    } else {
      navigate(item.path);
    }
  };

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {financialData.map((stat) => (
        <Grid size={{ xs: 12, md: 4 }} key={stat.label}>
          <Paper
            elevation={0}
            onClick={() => handleNavigation(stat)}
            sx={{
              p: 2, borderRadius: '16px', border: '1px solid #f1f1f1', bgcolor: '#ffffff',
              height: '100%', display: 'flex', flexDirection: 'column',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: `0 12px 20px ${alpha(stat.color, 0.08)}`,
                borderColor: alpha(stat.color, 0.3)
              }
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <Box sx={{ p: 0.7, borderRadius: '6px', bgcolor: alpha(stat.color, 0.1), color: stat.color, display: 'flex' }}>
                {React.cloneElement(stat.icon, { sx: { fontSize: '1rem' } })}
              </Box>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                {stat.label}
              </Typography>
            </Stack>

            <Box sx={{ mb: 1.2 }}>
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', mb: 0.5, textTransform: 'uppercase' }}>
                Cumulative
              </Typography>
              <CurrencyRow currency="KSH" value={stat.stats.cumulative.KES} loading={loading} />
              <CurrencyRow currency="USD" value={stat.stats.cumulative.USD} loading={loading} />
            </Box>

            <Divider sx={{ mb: 1.2, borderStyle: 'dotted', opacity: 0.5 }} />

            <Box>
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                <CalendarMonthIcon sx={{ fontSize: '0.75rem', color: stat.color }} />
                <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: stat.color, textTransform: 'uppercase' }}>
                  This Month
                </Typography>
              </Stack>
              <CurrencyRow currency="KSH" value={stat.stats.thisMonth.KES} loading={loading} color={stat.color} />
              <CurrencyRow currency="USD" value={stat.stats.thisMonth.USD} loading={loading} color={stat.color} />
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

const CurrencyRow = ({ currency, value, loading, color }: any) => (
  <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.2 }}>
    <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: '#64748b' }}>{currency}</Typography>
    <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: color || DARK_NAVY, fontFamily: SANS_STACK }}>
      {loading ? '...' : (
        <>
          <Box component="span" sx={{ fontSize: '0.6rem', mr: 0.2, color: '#94a3b8', fontWeight: 600 }}>
            {currency === 'KSH' ? 'KES' : 'USD'}
          </Box>
          {value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </>
      )}
    </Typography>
  </Stack>
);