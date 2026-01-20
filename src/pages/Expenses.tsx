import { useState, useEffect, useMemo } from 'react';
import { 
    Box, Typography, Paper, Chip, Stack, 
    Grid, alpha, Dialog, DialogContent, IconButton, 
    Tooltip, Snackbar, Alert, DialogTitle, DialogActions, Button
} from '@mui/material';
import axios from 'axios';

// Icons
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PieChartIcon from '@mui/icons-material/PieChart';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// Components
import { DataTable } from '../components/DataTable';
import { AddExpenseForm } from '../components/Expenses/AddExpense';
import { ViewExpense } from '../components/Expenses/ViewExpense';
import { API_BASE_URL } from '../config/api';

const DARK_NAVY = '#1a202c';
const CUSTOMER_NAVY = '#365fb3ff';
const PRIMARY_RUST = '#b52841';
const SUCCESS_GREEN = '#10b981';
const WARNING_ORANGE = '#f59e0b';

interface Expense {
    id: number;
    title: string;
    amount: string | number;
    category: string;
    status: 'paid' | 'unpaid';
    description?: string;
    document_url?: string;
}

export const ExpensesPage = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [viewOpen, setViewOpen] = useState<boolean>(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

    // Filtering State
    const [activeFilter, setActiveFilter] = useState<string>('all');

    // UI Feedback States
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; data: Expense | null }>({ open: false, data: null });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const showMessage = (msg: string, sev: 'success' | 'error' = 'success') => {
        setSnackbar({ open: true, message: msg, severity: sev });
    };

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/expenses`);
            setExpenses(res.data);
        } catch (err) {
            showMessage('Failed to load expense ledger', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchExpenses(); }, []);

    // Filtered Data Logic
    const filteredExpenses = useMemo(() => {
        switch(activeFilter) {
            case 'paid': return expenses.filter(e => e.status === 'paid');
            case 'unpaid': return expenses.filter(e => e.status === 'unpaid');
            default: return expenses;
        }
    }, [expenses, activeFilter]);

    const stats = useMemo(() => {
        let total = 0, paidTotal = 0, unpaidTotal = 0;
        const categoryMap: Record<string, number> = {};

        expenses.forEach(exp => {
            const amt = parseFloat(exp.amount.toString());
            total += amt;
            if (exp.status === 'paid') paidTotal += amt;
            if (exp.status === 'unpaid') unpaidTotal += amt;
            categoryMap[exp.category] = (categoryMap[exp.category] || 0) + amt;
        });

        const topCat = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];
        return { total, paidTotal, unpaidTotal, topCategory: topCat ? topCat[0] : 'N/A' };
    }, [expenses]);

    const columns = [
        { 
            id: 'title', 
            label: 'ITEM DESCRIPTION', 
            render: (row: Expense) => (
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: DARK_NAVY }}>
                    {row.title}
                </Typography>
            ) 
        },
        { 
            id: 'category', 
            label: 'CATEGORY', 
            render: (row: Expense) => (
                <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 500 }}>
                    {row.category.toUpperCase()}
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
                        fontSize: '0.55rem', height: 18, fontWeight: 800,
                        bgcolor: row.status === 'paid' ? alpha(SUCCESS_GREEN, 0.1) : alpha(PRIMARY_RUST, 0.1),
                        color: row.status === 'paid' ? SUCCESS_GREEN : PRIMARY_RUST,
                    }} 
                />
            ) 
        },
        { 
            id: 'document_url', 
            label: 'DOC', 
            render: (row: Expense) => row.document_url ? (
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); window.open(row.document_url, '_blank'); }}>
                    <DownloadForOfflineIcon sx={{ fontSize: '1.1rem', color: '#64748b' }} />
                </IconButton>
            ) : <Typography sx={{ fontSize: '0.7rem', color: '#ccc' }}>—</Typography>
        },
        { 
            id: 'amount', 
            label: 'AMOUNT', 
            render: (row: Expense) => (
                <Typography sx={{ fontWeight: 800, color: DARK_NAVY, fontSize: '0.85rem' }}>
                    KSh {parseFloat(row.amount.toString()).toLocaleString()}
                </Typography>
            ) 
        },
    ];

    return (
        <Box sx={{ p: 2, bgcolor: '#fcfcfc', minHeight: '100vh' }}>
            {/* Clickable Stat Cards */}
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
                <StatCard 
                    label="Total Ledger" 
                    value={`KSh ${stats.total.toLocaleString()}`} 
                    icon={<AccountBalanceWalletIcon sx={{fontSize:18}}/>} 
                    color={CUSTOMER_NAVY}
                    active={activeFilter === 'all'}
                    onClick={() => setActiveFilter('all')}
                />
                <StatCard 
                    label="Paid Expenses" 
                    value={`KSh ${stats.paidTotal.toLocaleString()}`} 
                    icon={<CheckCircleIcon sx={{fontSize:18}}/>} 
                    color={SUCCESS_GREEN}
                    active={activeFilter === 'paid'}
                    onClick={() => setActiveFilter(activeFilter === 'paid' ? 'all' : 'paid')}
                />
                <StatCard 
                    label="Unpaid Dues" 
                    value={`KSh ${stats.unpaidTotal.toLocaleString()}`} 
                    icon={<TrendingDownIcon sx={{fontSize:18}}/>} 
                    color={PRIMARY_RUST}
                    active={activeFilter === 'unpaid'}
                    onClick={() => setActiveFilter(activeFilter === 'unpaid' ? 'all' : 'unpaid')}
                />
                <StatCard 
                    label="Top Category" 
                    value={stats.topCategory} 
                    icon={<PieChartIcon sx={{fontSize:18}}/>} 
                    color={WARNING_ORANGE} 
                    onClick={() => {}} // Category filtering can be added here
                />
            </Grid>

            {activeFilter !== 'all' && (
                <Box sx={{ mb: 2 }}>
                    <Chip 
                        label={`VIEWING: ${activeFilter.toUpperCase()}`} 
                        size="small" 
                        onDelete={() => setActiveFilter('all')}
                        sx={{ bgcolor: DARK_NAVY, color: '#fff', fontWeight: 700, fontSize: '0.65rem' }}
                    />
                </Box>
            )}

            <DataTable 
                title="Expense Ledger" 
                columns={columns} 
                data={filteredExpenses} 
                primaryAction={{ label: 'Add Expense', onClick: () => { setSelectedExpense(null); setModalOpen(true); } }}
                onEdit={(id) => {
                    const exp = expenses.find(e => String(e.id) === String(id));
                    if (exp) { setSelectedExpense(exp); setModalOpen(true); }
                }} 
                onDelete={(id) => setDeleteConfirm({ open: true, data: expenses.find(e => String(e.id) === String(id)) || null })}
                onView={(id) => {
                    const exp = expenses.find(e => String(e.id) === String(id));
                    if (exp) { setSelectedExpense(exp); setViewOpen(true); }
                }}
            />

            {/* Delete Popup */}
            <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, data: null })} PaperProps={{ sx: { borderRadius: '12px', width: '350px' } }}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700, color: PRIMARY_RUST, pb: 1 }}>
                    <WarningAmberIcon /> Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        Remove <strong>{deleteConfirm.data?.title}</strong>? This action is permanent.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setDeleteConfirm({ open: false, data: null })} sx={{ color: 'text.secondary', textTransform: 'none' }}>Cancel</Button>
                    <Button onClick={() => {}} variant="contained" sx={{ bgcolor: PRIMARY_RUST, textTransform: 'none' }}>Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Add/Edit Modal */}
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '12px' } }}>
                <Box sx={{ p: 3 }}>
                    <Typography sx={{ fontWeight: 700, color: DARK_NAVY, mb: 2, fontSize: '1.1rem' }}>
                        {selectedExpense ? 'Update Expense Details' : 'Record New Expense'}
                    </Typography>
                    <AddExpenseForm 
                        onSuccess={() => { fetchExpenses(); setModalOpen(false); showMessage('Ledger Updated'); }} 
                        onClose={() => setModalOpen(false)} 
                        initialData={selectedExpense} 
                    />
                </Box>
            </Dialog>
            
            <ViewExpense open={viewOpen} onClose={() => {setViewOpen(false); setSelectedExpense(null);}} data={selectedExpense} />

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ borderRadius: '8px', fontWeight: 600 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

// Reusable Clickable Stat Card
const StatCard = ({ label, value, icon, color, active, onClick }: any) => (
    <Grid size={{ xs: 6, sm: 3 }}>
        <Paper 
            variant="outlined" 
            onClick={onClick}
            sx={{ 
                p: 1.5, 
                borderRadius: '10px', 
                borderLeft: `3px solid ${color}`,
                bgcolor: active ? alpha(color, 0.08) : alpha(color, 0.02),
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease-in-out',
                transform: active ? 'translateY(-2px)' : 'none',
                boxShadow: active ? `0 4px 12px ${alpha(color, 0.1)}` : 'none',
                '&:hover': onClick ? {
                    bgcolor: alpha(color, 0.1),
                    transform: 'translateY(-3px)',
                    boxShadow: `0 4px 12px ${alpha(color, 0.08)}`
                } : {}
            }}
        >
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ 
                    p: 0.8, 
                    borderRadius: '8px', 
                    bgcolor: active ? color : alpha(color, 0.1), 
                    color: active ? '#fff' : color, 
                    display: 'flex',
                    transition: '0.3s'
                }}>
                    {icon}
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 700, color: DARK_NAVY, fontSize: '0.9rem', lineHeight: 1.1 }}>
                        {value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: 0.5 }}>
                        {label}
                    </Typography>
                </Box>
            </Stack>
        </Paper>
    </Grid>
);