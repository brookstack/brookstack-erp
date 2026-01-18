import React, { useRef, useMemo } from 'react';
import {
    Box, Typography, Grid, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    Divider, Button, Stack, Paper, IconButton,
    alpha, useTheme, useMediaQuery, GlobalStyles
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Download as DownloadIcon,
    Print as PrintIcon
} from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';

const PRIMARY_RUST = '#b52841';
const DARK_NAVY = '#1a202c';

interface ReceiptProps {
    data: any;
    onBack: () => void;
}

export const ViewPayment: React.FC<ReceiptProps> = ({ data, onBack }) => {
    const receiptRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const services = useMemo(() => {
        try {
            const source = data.billing_services_json || data.services;
            if (!source) return [];
            return typeof source === 'string' ? JSON.parse(source) : source;
        } catch (e) {
            return [];
        }
    }, [data.billing_services_json, data.services]);

    const financialMetrics = useMemo(() => {
        const totalInvoice = Number(data.billing_grand_total || data.grand_total) || 0;
        const paidNow = Number(data.amount_paid) || 0;
        const totalPaidUpToThisPoint = Number(data.running_total_paid) || paidNow;
        const totalPreviousPayments = totalPaidUpToThisPoint - paidNow;
        const outstandingBalanceAfterThis = totalInvoice - totalPaidUpToThisPoint;

        return {
            totalInvoice,
            totalPreviousPayments,
            paidNow,
            outstandingBalanceAfterThis
        };
    }, [data]);

    const handlePrint = useReactToPrint({
        contentRef: receiptRef,
        documentTitle: `Receipt_${data.transaction_reference || data.doc_no}`,
    });

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '950px', margin: 'auto' }}>
            {/* Print Logic: Forces side-by-side layout and ensures footer stays at bottom */}
            <GlobalStyles styles={{
                '@media print': {
                    '@page': { size: 'A4', margin: '0mm' },
                    'body': { margin: '0px', WebkitPrintColorAdjust: 'exact' },
                    '.print-wrapper': { padding: '15mm 20mm !important', height: '297mm' },
                    '.footer-box': { position: 'absolute', bottom: '0mm', left: '0mm', width: '100%' },
                    '.summary-container': { 
                        display: 'flex !important', 
                        flexDirection: 'row !important', 
                        gap: '20px !important',
                        alignItems: 'flex-start !important'
                    },
                    '.notes-box': { width: '58% !important', flex: '0 0 58% !important' },
                    '.financials-box': { width: '40% !important', flex: '0 0 40% !important' }
                }
            }} />

            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 3, '@media print': { display: 'none' } }}
            >
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={onBack}
                    sx={{ color: DARK_NAVY, textTransform: 'none', fontWeight: 700 }}
                >
                    {isMobile ? 'Back' : 'Back to Payments'}
                </Button>
                <Stack direction="row" spacing={1}>
                    {!isMobile && (
                        <IconButton onClick={() => handlePrint()} sx={{ color: DARK_NAVY }}>
                            <PrintIcon />
                        </IconButton>
                    )}
                    <Button
                        variant="contained"
                        onClick={() => handlePrint()}
                        startIcon={<DownloadIcon />}
                        sx={{
                            bgcolor: PRIMARY_RUST,
                            '&:hover': { bgcolor: '#8e2133' },
                            borderRadius: '8px',
                            textTransform: 'none',
                            px: { xs: 2, sm: 3 },
                            boxShadow: 'none',
                            fontWeight: 700
                        }}
                    >
                        {isMobile ? 'PDF' : 'Export Receipt'}
                    </Button>
                </Stack>
            </Stack>

            <Paper
                ref={receiptRef}
                elevation={0}
                sx={{
                    borderRadius: '0px',
                    minHeight: '1123px',
                    position: 'relative',
                    bgcolor: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    '@media print': { margin: 0, boxShadow: 'none' }
                }}
            >
                <Box className="print-wrapper" sx={{ flexGrow: 1, p: { xs: 2, sm: 4, md: 6 } }}>
                    {/* Header */}
                    <Grid container spacing={3} alignItems="center" sx={{ mb: 4 }}>
                        <Grid size={{ xs: 7 }}>
                            <Box component="img" src="/logo.png" alt="Logo" sx={{ width: { xs: 250, sm: 300, md: 380 }, height: 'auto' }} />
                        </Grid>
                        <Grid size={{ xs: 5 }} sx={{ textAlign: 'right' }}>
                            <Typography variant="h5" sx={{ color: PRIMARY_RUST, fontWeight: 900, letterSpacing: '0.05em', mb: 0.5 }}>
                                OFFICIAL RECEIPT
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'textSecondary', fontWeight: 600 }}>
                                REF: {data.transaction_reference || 'N/A'}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Divider sx={{ mb: 4, borderColor: alpha(PRIMARY_RUST, 0.2) }} />

                    {/* Client & Date Info */}
                    <Grid container spacing={3} sx={{ mb: 6 }}>
                        <Grid size={{ xs: 7 }}>
                            <Typography variant="caption" sx={{ color: PRIMARY_RUST, fontWeight: 800, display: 'block', mb: 1, letterSpacing: '0.1em' }}>
                                CLIENT DETAILS
                            </Typography>
                            <Typography variant="h6" sx={{ color: DARK_NAVY, fontWeight: 800, mb: 0.5 }}>{data.clientName}</Typography>
                            <Typography color="textSecondary" variant="body2">📧 {data.email || 'N/A'}</Typography>
                            <Typography color="textSecondary" variant="body2">📞 {data.mobile || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 5 }} sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" sx={{ color: PRIMARY_RUST, fontWeight: 800, display: 'block', mb: 1, letterSpacing: '0.1em' }}>
                                PAYMENT DATE
                            </Typography>
                            <Typography sx={{ fontSize: '1rem', color: DARK_NAVY, fontWeight: 700 }}>
                                {new Date(data.payment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </Typography>
                        </Grid>
                    </Grid>

                    {/* Transaction Table */}
                    <TableContainer sx={{ mb: 4, borderRadius: '4px', border: `1px solid ${alpha(DARK_NAVY, 0.1)}` }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: PRIMARY_RUST }}>
                                    <TableCell sx={{ color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, borderBottom: 'none' }}>INVOICE</TableCell>
                                    <TableCell sx={{ color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, borderBottom: 'none' }}>SERVICE DESCRIPTION</TableCell>
                                    <TableCell sx={{ color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, borderBottom: 'none' }}>MODE</TableCell>
                                    <TableCell align="right" sx={{ color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, borderBottom: 'none' }}>AMOUNT PAID</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell sx={{ verticalAlign: 'top', pt: 3 }}>
                                        <Typography sx={{ fontSize: '0.85rem', color: PRIMARY_RUST, fontWeight: 800 }}>{data.doc_no}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ py: 3 }}>
                                        {services.map((s: any, i: number) => (
                                            <Box key={i} sx={{ mb: 1 }}>
                                                <Typography sx={{ fontSize: '0.85rem', display: 'block', color: DARK_NAVY, fontWeight: 600 }}>
                                                    • {s.description || s.item_name}
                                                </Typography>
                                                {s.quantity && (
                                                    <Typography variant="caption" color="textSecondary">
                                                        Qty: {s.quantity} x {Number(s.rate || 0).toLocaleString()}
                                                    </Typography>
                                                )}
                                            </Box>
                                        ))}
                                    </TableCell>
                                    <TableCell sx={{ verticalAlign: 'top', pt: 3 }}>
                                        <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', fontWeight: 600 }}>{data.payment_method?.toUpperCase() || 'CASH'}</Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ verticalAlign: 'top', pt: 3 }}>
                                        <Typography sx={{ fontSize: '0.9rem', color: DARK_NAVY, fontWeight: 800 }}>
                                            {data.currency || 'KES'} {financialMetrics.paidNow.toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Notes and Financials Row (Forced Side-by-Side in Print) */}
                    <Box className="summary-container" sx={{ display: 'flex', gap: 4, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                        <Box className="notes-box" sx={{ flexGrow: 1 }}>
                            <Box sx={{ p: 2, bgcolor: alpha(PRIMARY_RUST, 0.02), borderLeft: `3px solid ${PRIMARY_RUST}`, height: '100%' }}>
                                <Typography variant="caption" sx={{ color: PRIMARY_RUST, fontWeight: 800, display: 'block', mb: 1 }}>NOTES</Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.6 }}>
                                    {data.notes || 'Payment received with thanks. Thank you for the opportunity to serve your business.'}
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Box className="financials-box" sx={{ width: { xs: '100%', sm: '350px' } }}>
                            <Stack spacing={1.5} sx={{ p: 2, bgcolor: alpha(DARK_NAVY, 0.01), borderRadius: '8px', border: `1px solid ${alpha(DARK_NAVY, 0.05)}` }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography sx={{ fontSize: '0.75rem', color: 'textSecondary', fontWeight: 600 }}>TOTAL INVOICE</Typography>
                                    <Typography sx={{ fontSize: '0.75rem', color: DARK_NAVY, fontWeight: 700 }}>
                                        {data.currency || 'KES'} {financialMetrics.totalInvoice.toLocaleString()}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography sx={{ fontSize: '0.75rem', color: 'textSecondary', fontWeight: 600 }}>PREVIOUS PAYMENTS</Typography>
                                    <Typography sx={{ fontSize: '0.75rem', color: DARK_NAVY, fontWeight: 700 }}>
                                        {data.currency || 'KES'} {financialMetrics.totalPreviousPayments.toLocaleString()}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography sx={{ fontSize: '0.75rem', color: PRIMARY_RUST, fontWeight: 800 }}>CURRENT PAYMENT</Typography>
                                    <Typography sx={{ fontSize: '0.75rem', color: PRIMARY_RUST, fontWeight: 800 }}>
                                        {data.currency || 'KES'} {financialMetrics.paidNow.toLocaleString()}
                                    </Typography>
                                </Box>
                                <Divider />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography sx={{ fontSize: '0.75rem', color: DARK_NAVY, fontWeight: 900 }}>OUTSTANDING BALANCE</Typography>
                                    <Typography sx={{ fontSize: '1.1rem', color: DARK_NAVY, fontWeight: 900 }}>
                                        {data.currency || 'KES'} {financialMetrics.outstandingBalanceAfterThis.toLocaleString()}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                    </Box>
                </Box>

                {/* Footer */}
                <Box className="footer-box">
                    <Box sx={{ px: { xs: 2, sm: 4, md: 6 }, pb: 4 }}>
                        <Typography sx={{ textAlign: 'center', fontSize: '0.8rem', color: alpha(DARK_NAVY, 0.6), mb: 3, fontStyle: 'italic', fontWeight: 600 }}>
                            "Experts in High-Precision Software Engineering"
                        </Typography>
                        <Divider sx={{ mb: 2, opacity: 0.5 }} />
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 4 }}><Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: DARK_NAVY }}>📞 0711927833</Typography></Grid>
                            <Grid size={{ xs: 4 }}><Typography sx={{ fontSize: '0.7rem', fontWeight: 800, textAlign: 'center', color: DARK_NAVY }}>📧 business@brookstack.com</Typography></Grid>
                            <Grid size={{ xs: 4 }}><Typography sx={{ fontSize: '0.7rem', fontWeight: 800, textAlign: 'right', color: DARK_NAVY }}>🌐 www.brookstack.com</Typography></Grid>
                        </Grid>
                    </Box>
                    <Box sx={{ height: 10, bgcolor: PRIMARY_RUST, width: '100%' }} />
                </Box>
            </Paper>
        </Box>
    );
};