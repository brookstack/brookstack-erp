import React, { useEffect, useState } from 'react';
import { Paper, Box, Typography, Grid, CircularProgress, Stack } from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

const SUCCESS_GREEN = '#10b981';
const AMBER = '#f59e0b'; 
const RUST = '#b52841';  
const LEAD_BLUE = '#0ea5e9';
const PURPLE = '#8b5cf6';

const MONTHS_FULL = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const AnalyticsSection = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({ clients: [], pie: [], efficiency: [] });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [custRes, billRes, payRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/customers`),
          axios.get(`${API_BASE_URL}/billing`),
          axios.get(`${API_BASE_URL}/payments`)
        ]);

        const currentYear = 2026;
        const bills = billRes.data || [];

        // 1. SOLID PIE CHART LOGIC (Summing Grand Totals)
        const getSumByStatus = (keywords: string[]) => {
          return bills
            .filter((b: any) => {
              const s = (b.status || '').toLowerCase();
              return keywords.some(kw => s.includes(kw));
            })
            .reduce((sum: number, b: any) => sum + Number(b.grand_total || 0), 0);
        };

        const statusData = [
          { name: 'Fully Paid', value: getSumByStatus(['paid']), color: SUCCESS_GREEN },
          { name: 'Partial', value: bills
              .filter((b: any) => {
                const s = (b.status || '').toLowerCase();
                return s.includes('partial') && !s.includes('fully');
              })
              .reduce((sum: number, b: any) => sum + Number(b.grand_total || 0), 0), 
            color: AMBER 
          },
          { name: 'Unpaid', value: getSumByStatus(['unpaid', 'pending']), color: RUST },
        ];

        // 2. YEARLY DATA LOGIC (Jan - Dec)
        const clientsByMonth = processYearlyData(custRes.data || [], 'created_at', 'count', currentYear);
        const billedByMonth = processYearlyData(bills, 'created_at', 'grand_total', currentYear);
        const collectedByMonth = processYearlyData(payRes.data || [], 'payment_date', 'amount_paid', currentYear);
        
        const efficiency = billedByMonth.map((b, index) => ({
          month: b.month,
          billed: b.value,
          collected: collectedByMonth[index].value
        }));

        setData({
          clients: clientsByMonth,
          pie: statusData,
          efficiency
        });
      } catch (error) {
        console.error("Analytics Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Fixes TS(2322) by allowing value to be number | undefined
  const currencyFormatter = (value: number | undefined) => 
    value !== undefined ? value.toLocaleString(undefined, { minimumFractionDigits: 0 }) : '0';

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      return (
        <Paper sx={{ p: 1.5, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', mb: 0.5 }}>
            {payload[0].name}
          </Typography>
          <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: payload[0].payload.color }}>
             KES {typeof val === 'number' ? val.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  return (
    <Grid container spacing={2}>
      {/* 1. Client Growth Bar Chart */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ChartCard title="2026 Client Growth">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.clients}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(v: any) => [v, 'Clients']} />
              <Bar dataKey="value" fill={LEAD_BLUE} radius={[4, 4, 0, 0]} barSize={15} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>

      {/* 2. SOLID Pie Chart (Actual Amounts) */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ChartCard title="Invoice Status Value">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie 
                data={data.pie} 
                cx="50%" 
                cy="50%" 
                outerRadius={80} 
                dataKey="value"
                stroke="none"
              >
                {data.pie.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>

      {/* 3. Cash Flow Trend Line Chart */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ChartCard title="2026 Cash Flow Trend">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.efficiency}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={currencyFormatter} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '10px' }} />
              <Line name="Billed" type="monotone" dataKey="billed" stroke={PURPLE} strokeWidth={2} dot={{ r: 3 }} />
              <Line name="Collected" type="monotone" dataKey="collected" stroke={SUCCESS_GREEN} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>
    </Grid>
  );
};

// HELPER: Groups data by month for the target year (Full 12 Months)
const processYearlyData = (items: any[], dateField: string, valueField: string | 'count', targetYear: number) => {
  const grouped = items.reduce((acc: any, item: any) => {
    const date = new Date(item[dateField]);
    if (date.getFullYear() === targetYear) {
      const monthIdx = date.getMonth();
      const val = valueField === 'count' ? 1 : Number(item[valueField] || 0);
      acc[monthIdx] = (acc[monthIdx] || 0) + val;
    }
    return acc;
  }, {});

  return MONTHS_FULL.map((name, index) => ({
    month: name,
    value: grouped[index] || 0
  }));
};

const ChartCard = ({ title, children }: any) => (
  <Paper elevation={0} sx={{ p: 2, borderRadius: '20px', border: '1px solid #f1f1f1', bgcolor: '#ffffff' }}>
    <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>
      {title}
    </Typography>
    {children}
  </Paper>
);