import { useState, useEffect, useMemo } from 'react';
import { 
    Box, Typography, Paper, Chip, Stack, 
     Grid, alpha, Dialog, DialogContent, IconButton, Tooltip 
} from '@mui/material';
import axios from 'axios';

// Icons
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PieChartIcon from '@mui/icons-material/PieChart';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';

// Components
import { DataTable } from '../components/DataTable';
import { AddExpenseForm } from '../components/Expenses/AddExpense';
import { ViewExpense } from '../components/Expenses/ViewExpense';
import { API_BASE_URL } from '../config/api';

const DARK_NAVY = '#1a202c';
const PRIMARY_RUST = '#b52841';

interface Expense {
    id: number;
    title: string;
    amount: string | number;
    category: string;
    status: 'paid' | 'unpaid';
    expense_date: string;
    description?: string;
    document_url?: string;
}

export const ExpensesPage = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [viewOpen, setViewOpen] = useState<boolean>(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/expenses`);
            setExpenses(res.data);
        } catch (err) {
            console.error("Fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchExpenses(); }, []);

    const handleEdit = (id: number | string) => {
        const exp = expenses.find(e => String(e.id) === String(id));
        if (exp) { setSelectedExpense(exp); setModalOpen(true); }
    };

    const handleDelete = async (id: number | string) => {
        if (window.confirm("Permanently delete this record?")) {
            try {
                await axios.delete(`${API_BASE_URL}/api/expenses/${id}`);
                fetchExpenses();
            } catch (err) { console.error(err); }
        }
    };

    const stats = useMemo(() => {
        const now = new Date();
        let total = 0, monthly = 0;
        const categoryMap: Record<string, number> = {};

        expenses.forEach(exp => {
            const amt = parseFloat(exp.amount.toString());
            const date = new Date(exp.expense_date);
            total += amt;
            if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
                monthly += amt;
            }
            categoryMap[exp.category] = (categoryMap[exp.category] || 0) + amt;
        });

        const topCat = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];
        return { total, monthly, topCategory: topCat ? topCat[0] : 'N/A' };
    }, [expenses]);

    const columns = [
        { 
            id: 'expense_date', 
            label: 'DATE', 
            render: (row: Expense) => (
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    {new Date(row.expense_date).toLocaleDateString('en-GB')}
                </Typography>
            ) 
        },
        { 
            id: 'title', 
            label: 'ITEM', 
            render: (row: Expense) => (
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: DARK_NAVY }}>
                    {row.title}
                </Typography>
            ) 
        },
        { 
            id: 'status', 
            label: 'STATUS', 
            render: (row: Expense) => (
                <Chip 
                    label={row.status?.toUpperCase() || 'UNPAID'} 
                    size="small" 
                    sx={{ 
                        fontSize: '0.55rem', height: 18, fontWeight: 700,
                        bgcolor: row.status === 'paid' ? alpha('#198754', 0.1) : alpha(PRIMARY_RUST, 0.1),
                        color: row.status === 'paid' ? '#198754' : PRIMARY_RUST,
                    }} 
                />
            ) 
        },
        { 
            id: 'document_url', 
            label: 'DOC', 
            render: (row: Expense) => row.document_url ? (
                <Tooltip title="Download Receipt">
                    <IconButton 
                        size="small" 
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(row.document_url, '_blank');
                        }}
                        sx={{ color: '#64748b' }}
                    >
                        <DownloadForOfflineIcon sx={{ fontSize: '1.1rem' }} />
                    </IconButton>
                </Tooltip>
            ) : (
                <Typography sx={{ fontSize: '0.7rem', color: '#ccc' }}>None</Typography>
            )
        },
        { 
            id: 'amount', 
            label: 'AMOUNT', 
            render: (row: Expense) => (
                <Typography sx={{ fontWeight: 700, color: DARK_NAVY, fontSize: '0.8rem' }}>
                    KSh {parseFloat(row.amount.toString()).toLocaleString()}
                </Typography>
            ) 
        },
    ];

    return (
        <Box sx={{ p: 2, bgcolor: '#fcfcfc', minHeight: '100vh' }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <StatCard label="Lifetime" value={`KSh ${stats.total.toLocaleString()}`} icon={<AccountBalanceWalletIcon sx={{fontSize:18}}/>} color={DARK_NAVY} />
                <StatCard label="Month Burn" value={`KSh ${stats.monthly.toLocaleString()}`} icon={<CalendarMonthIcon sx={{fontSize:18}}/>} color={PRIMARY_RUST} />
                <StatCard label="Highest Type" value={stats.topCategory} icon={<PieChartIcon sx={{fontSize:18}}/>} color="#10b981" />
            </Grid>

            <DataTable 
                title="Expense Ledger" columns={columns} data={expenses} 
                primaryAction={{ label: 'Add Expense', onClick: () => { setSelectedExpense(null); setModalOpen(true); } }}
                onEdit={handleEdit} onDelete={handleDelete}
                onView={(id) => {
                    const exp = expenses.find(e => String(e.id) === String(id));
                    if (exp) { setSelectedExpense(exp); setViewOpen(true); }
                }}
            />

            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '12px' } }}>
                <DialogContent sx={{ p: 3 }}>
                    <AddExpenseForm onSuccess={() => { fetchExpenses(); setModalOpen(false); }} onClose={() => setModalOpen(false)} initialData={selectedExpense} />
                </DialogContent>
            </Dialog>
            
            <ViewExpense open={viewOpen} onClose={() => {setViewOpen(false); setSelectedExpense(null);}} data={selectedExpense} />
        </Box>
    );
};

const StatCard = ({ label, value, icon, color }: any) => (
    <Grid size={{ xs: 12, sm: 4 }}>
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '8px', borderLeft: `4px solid ${color}`, display: 'flex', alignItems: 'center' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ p: 0.8, borderRadius: '6px', bgcolor: alpha(color, 0.08), color: color, display: 'flex' }}>{icon}</Box>
                <Box>
                    <Typography sx={{ fontWeight: 600, color: DARK_NAVY, fontSize: '0.85rem', lineHeight: 1.1 }}>{value}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', textTransform: 'uppercase' }}>{label}</Typography>
                </Box>
            </Stack>
        </Paper>
    </Grid>
);