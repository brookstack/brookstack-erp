import React, { useRef, useMemo } from 'react';
import { 
  Box, Typography, Grid, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  Divider, Button, Stack, Paper, IconButton, 
  alpha, useTheme, useMediaQuery
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
    
    // running_total_paid includes paidNow.
    const totalPaidUpToThisPoint = Number(data.running_total_paid) || paidNow;
    
    // Previous payments is the total paid up to now, minus the current transaction
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
      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center"
        sx={{ mb: 3, '@media print': { display: 'none' } }}
      >
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={onBack} 
          sx={{ color: DARK_NAVY, textTransform: 'none' }}
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
                boxShadow: 'none'
            }}
          >
            {isMobile ? 'PDF' : 'Export Receipt'}
          </Button>
        </Stack>
      </Stack>

      <Paper 
        ref={receiptRef}
        sx={{ 
          p: { xs: 2, sm: 4, md: 6 }, 
          pb: '100px', 
          borderRadius: '0px',
          minHeight: '1123px', 
          position: 'relative',
          bgcolor: 'white',
          display: 'flex',
          flexDirection: 'column', 
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          '@media print': { margin: 0, boxShadow: 'none', p: '15mm' }
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={3} alignItems="center" sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 7 }}>
                    <Box component="img" src="/logo.png" alt="Logo" sx={{ width: { xs: 180, sm: 220 }, height: 'auto' }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    <Typography variant="h5" sx={{ color: PRIMARY_RUST, letterSpacing: '0.1em', mb: 0.5 }}>
                        OFFICIAL RECEIPT
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'textSecondary' }}>
                        REF: {data.transaction_reference || 'N/A'}
                    </Typography>
                </Grid>
            </Grid>

            <Divider sx={{ mb: 4, borderColor: alpha(PRIMARY_RUST, 0.1) }} />

            <Grid container spacing={3} sx={{ mb: 6 }}>
                <Grid size={{ xs: 12, sm: 7 }}>
                    <Typography variant="caption" sx={{ color: 'textSecondary', display: 'block', mb: 1, letterSpacing: '0.1em' }}>
                        CLIENT DETAILS
                    </Typography>
                    <Typography variant="h6" sx={{ color: DARK_NAVY, mb: 0.5 }}>{data.clientName}</Typography>
                    <Typography color="textSecondary" variant="body2">📧 {data.email || 'N/A'}</Typography>
                    <Typography color="textSecondary" variant="body2">📞 {data.mobile || 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    <Typography variant="caption" sx={{ color: 'textSecondary', display: 'block', mb: 1, letterSpacing: '0.1em' }}>
                        PAYMENT DATE
                    </Typography>
                    <Typography sx={{ fontSize: '1rem', color: DARK_NAVY }}>
                        {new Date(data.payment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </Typography>
                </Grid>
            </Grid>

            <TableContainer sx={{ mb: 4, borderRadius: '4px', border: `1px solid ${alpha(DARK_NAVY, 0.1)}` }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: PRIMARY_RUST }}>
                            <TableCell sx={{ color: '#ffffff', fontSize: '0.75rem', borderBottom: 'none' }}>INVOICE</TableCell>
                            <TableCell sx={{ color: '#ffffff', fontSize: '0.75rem', borderBottom: 'none' }}>SERVICE DESCRIPTION</TableCell>
                            <TableCell sx={{ color: '#ffffff', fontSize: '0.75rem', borderBottom: 'none' }}>PAYMENT MODE</TableCell>
                            <TableCell align="right" sx={{ color: '#ffffff', fontSize: '0.75rem', borderBottom: 'none' }}>AMOUNT PAID</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell sx={{ verticalAlign: 'top', pt: 3 }}>
                                <Typography sx={{ fontSize: '0.85rem', color: PRIMARY_RUST, fontWeight: 600 }}>{data.doc_no}</Typography>
                            </TableCell>
                            <TableCell sx={{ py: 3 }}>
                                {services.map((s: any, i: number) => (
                                    <Box key={i} sx={{ mb: 1 }}>
                                        <Typography sx={{ fontSize: '0.85rem', display: 'block', color: DARK_NAVY }}>
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
                                <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>{data.payment_method?.toUpperCase() || 'CASH'}</Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ verticalAlign: 'top', pt: 3 }}>
                                <Typography sx={{ fontSize: '0.9rem', color: DARK_NAVY, fontWeight: 600 }}>
                                    {data.currency || 'KES'} {financialMetrics.paidNow.toLocaleString()}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 7 }}>
                    <Box sx={{ p: 2, bgcolor: alpha(PRIMARY_RUST, 0.02), borderLeft: `2px solid ${PRIMARY_RUST}` }}>
                        <Typography variant="caption" sx={{ color: PRIMARY_RUST, display: 'block', mb: 0.5 }}>NOTES</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'textSecondary' }}>
                            {data.notes || 'Confirming receipt of funds for services rendered. Thank you for your business.'}
                        </Typography>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                    <Stack spacing={1.5} sx={{ p: 2, bgcolor: alpha(DARK_NAVY, 0.01), borderRadius: '8px' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography sx={{ fontSize: '0.75rem', color: 'textSecondary' }}>TOTAL INVOICE</Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: DARK_NAVY }}>
                                {data.currency || 'KES'} {financialMetrics.totalInvoice.toLocaleString()}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography sx={{ fontSize: '0.75rem', color: 'textSecondary' }}>PREVIOUS PAYMENTS</Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: DARK_NAVY }}>
                                {data.currency || 'KES'} {financialMetrics.totalPreviousPayments.toLocaleString()}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography sx={{ fontSize: '0.75rem', color: PRIMARY_RUST, fontWeight: 600 }}>CURRENT PAYMENT</Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: PRIMARY_RUST, fontWeight: 600 }}>
                                {data.currency || 'KES'} {financialMetrics.paidNow.toLocaleString()}
                            </Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontSize: '0.75rem', color: DARK_NAVY, fontWeight: 600 }}>OUTSTANDING BALANCE</Typography>
                            <Typography sx={{ fontSize: '1.1rem', color: DARK_NAVY, fontWeight: 700 }}>
                                {data.currency || 'KES'} {financialMetrics.outstandingBalanceAfterThis.toLocaleString()}
                            </Typography>
                        </Box>
                    </Stack>
                </Grid>
            </Grid>
        </Box>

        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', bgcolor: 'white' }}>
            <Box sx={{ px: { xs: 2, sm: 4, md: 6 }, pb: 4 }}>
                <Divider sx={{ mb: 2, opacity: 0.5 }} />
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}><Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>📞 0711927833</Typography></Grid>
                    <Grid size={{ xs: 12, sm: 4 }}><Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', textAlign: 'center' }}>📧 business@brookstack.com</Typography></Grid>
                    <Grid size={{ xs: 12, sm: 4 }}><Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', textAlign: 'right' }}>🌐 brookstack.com</Typography></Grid>
                </Grid>
            </Box>
            <Box sx={{ height: 6, bgcolor: PRIMARY_RUST }} />
        </Box>
      </Paper>
    </Box>
  );
};