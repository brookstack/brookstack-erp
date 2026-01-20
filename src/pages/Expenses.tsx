import { useState, useEffect, useMemo } from 'react';
import { 
    Box, Typography, Paper, Chip, Stack, 
     Grid, alpha, Dialog, DialogContent, IconButton, 
    Tooltip, Snackbar, Alert, DialogTitle, DialogActions, Button, Divider
} from '@mui/material';
import axios from 'axios';

// Icons
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
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
const PRIMARY_RUST = '#b52841';
const SUCCESS_GREEN = '#10b981';

interface Expense {
    id: number;
    title: string;
    amount: string | number;
    category: string;
    status: 'paid' | 'unpaid';
    expense_date: string; // Kept in interface for stat calculations
    description?: string;
    document_url?: string;
}

export const ExpensesPage = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [viewOpen, setViewOpen] = useState<boolean>(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

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

    const handleEdit = (id: number | string) => {
        const exp = expenses.find(e => String(e.id) === String(id));
        if (exp) { setSelectedExpense(exp); setModalOpen(true); }
    };

    const handleConfirmDelete = async () => {
        if (deleteConfirm.data) {
            try {
                await axios.delete(`${API_BASE_URL}/expenses/${deleteConfirm.data.id}`);
                fetchExpenses();
                showMessage('Expense record deleted');
            } catch (err) {
                showMessage('Delete failed: Server Error', 'error');
            }
        }
        setDeleteConfirm({ open: false, data: null });
    };

    const stats = useMemo(() => {
        const now = new Date();
        let total = 0, monthly = 0, unpaid = 0;
        const categoryMap: Record<string, number> = {};

        expenses.forEach(exp => {
            const amt = parseFloat(exp.amount.toString());
            const date = new Date(exp.expense_date);
            total += amt;
            // Date logic still runs in background for stats
            if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
                monthly += amt;
            }
            if (exp.status === 'unpaid') {
                unpaid += amt;
            }
            categoryMap[exp.category] = (categoryMap[exp.category] || 0) + amt;
        });

        const topCat = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];
        return { total, monthly, unpaid, topCategory: topCat ? topCat[0] : 'N/A' };
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
                        sx={{ color: '#64748b', '&:hover': { color: PRIMARY_RUST } }}
                    >
                        <DownloadForOfflineIcon sx={{ fontSize: '1.1rem' }} />
                    </IconButton>
                </Tooltip>
            ) : (
                <Typography sx={{ fontSize: '0.7rem', color: '#ccc' }}>—</Typography>
            )
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
            {/* Stat Row */}
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
                <StatCard label="Total Lifetime" value={`KSh ${stats.total.toLocaleString()}`} icon={<AccountBalanceWalletIcon sx={{fontSize:18}}/>} color={DARK_NAVY} />
                <StatCard label="Monthly Burn" value={`KSh ${stats.monthly.toLocaleString()}`} icon={<CalendarMonthIcon sx={{fontSize:18}}/>} color={PRIMARY_RUST} />
                <StatCard label="Total Unpaid" value={`KSh ${stats.unpaid.toLocaleString()}`} icon={<TrendingDownIcon sx={{fontSize:18}}/>} color="#f59e0b" />
                <StatCard label="Highest Type" value={stats.topCategory} icon={<PieChartIcon sx={{fontSize:18}}/>} color={SUCCESS_GREEN} />
            </Grid>

            <DataTable 
                title="Expense Ledger" 
                columns={columns} 
                data={expenses} 
                primaryAction={{ label: 'Add Expense', onClick: () => { setSelectedExpense(null); setModalOpen(true); } }}
                onEdit={handleEdit} 
                onDelete={(id) => setDeleteConfirm({ open: true, data: expenses.find(e => String(e.id) === String(id)) || null })}
                onView={(id) => {
                    const exp = expenses.find(e => String(e.id) === String(id));
                    if (exp) { setSelectedExpense(exp); setViewOpen(true); }
                }}
            />

            {/* Delete Popup */}
            <Dialog 
                open={deleteConfirm.open} 
                onClose={() => setDeleteConfirm({ open: false, data: null })}
                PaperProps={{ sx: { borderRadius: '12px', width: '100%', maxWidth: '350px' } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700, color: PRIMARY_RUST, pb: 1 }}>
                    <WarningAmberIcon /> Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        Remove <strong>{deleteConfirm.data?.title}</strong>? This cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setDeleteConfirm({ open: false, data: null })} sx={{ color: 'text.secondary', textTransform: 'none' }}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} variant="contained" sx={{ bgcolor: PRIMARY_RUST, textTransform: 'none', px: 3 }}>Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Add/Edit Modal */}
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '12px' } }}>
                <Box sx={{ p: 2, px: 3, borderBottom: '1px solid #eee' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        {selectedExpense ? 'Update Expense' : 'New Expense Entry'}
                    </Typography>
                </Box>
                <DialogContent sx={{ p: 3 }}>
                    <AddExpenseForm 
                        onSuccess={() => { fetchExpenses(); setModalOpen(false); showMessage('Ledger Updated'); }} 
                        onClose={() => setModalOpen(false)} 
                        initialData={selectedExpense} 
                    />
                </DialogContent>
            </Dialog>
            
            <ViewExpense open={viewOpen} onClose={() => {setViewOpen(false); setSelectedExpense(null);}} data={selectedExpense} />

            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={4000} 
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: '8px', fontWeight: 600 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

const StatCard = ({ label, value, icon, color }: any) => (
    <Grid size={{ xs: 6, sm: 3 }}>
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '8px', borderLeft: `4px solid ${color}`, display: 'flex', alignItems: 'center', bgcolor: '#fff' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ p: 0.8, borderRadius: '6px', bgcolor: alpha(color, 0.08), color: color, display: 'flex' }}>{icon}</Box>
                <Box>
                    <Typography sx={{ fontWeight: 700, color: DARK_NAVY, fontSize: '0.9rem', lineHeight: 1.1 }}>{value}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase', fontWeight: 700 }}>{label}</Typography>
                </Box>
            </Stack>
        </Paper>
    </Grid>
);