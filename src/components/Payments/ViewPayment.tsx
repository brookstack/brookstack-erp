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
  Print as PrintIcon,
  CheckCircleOutline as SuccessIcon
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

  // Parse services from the invoice data if they exist
  const services = useMemo(() => {
    if (!data.services) return [];
    return typeof data.services === 'string' ? JSON.parse(data.services) : data.services;
  }, [data.services]);

  // Fix NaN by defaulting to 0 and ensuring numeric conversion
  const financialMetrics = useMemo(() => {
    const total = Number(data.grand_total) || 0;
    const currentPaid = Number(data.amount_paid) || 0;
    const previouslyPaid = Number(data.total_paid_before_this_txn) || 0; // Ensure your backend/join sends this
    const totalPaidToDate = Number(data.total_paid) || (previouslyPaid + currentPaid);
    const balance = Math.max(0, total - totalPaidToDate);

    return { total, currentPaid, totalPaidToDate, balance };
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
                px: { xs: 2, sm: 3 }
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
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          '@media print': { margin: 0, boxShadow: 'none', p: '15mm' }
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={3} alignItems="center" sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 7 }}>
                    <Box component="img" src="/logo.png" alt="Logo" sx={{ width: { xs: 200, sm: 250 }, height: 'auto' }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    <Typography variant="h5" sx={{ color: PRIMARY_RUST, letterSpacing: '0.1em', mb: 0.5 }}>
                        OFFICIAL RECEIPT
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'textSecondary' }}>
                        REF: {data.transaction_reference || '---'}
                    </Typography>
                </Grid>
            </Grid>

            <Divider sx={{ mb: 4, borderColor: alpha(PRIMARY_RUST, 0.2) }} />

            <Grid container spacing={3} sx={{ mb: 6 }}>
                <Grid size={{ xs: 12, sm: 7 }}>
                    <Typography variant="caption" sx={{ color: 'textSecondary', display: 'block', mb: 1, letterSpacing: '0.1em' }}>
                        CLIENT DETAILS
                    </Typography>
                    <Typography variant="h6" sx={{ color: DARK_NAVY, mb: 0.5 }}>{data.clientName}</Typography>
                    <Typography color="textSecondary" variant="body2">📧 {data.email || 'N/A'}</Typography>
                    <Typography color="textSecondary" variant="body2">📞 {data.phone || 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    <Typography variant="caption" sx={{ color: 'textSecondary', display: 'block', mb: 1, letterSpacing: '0.1em' }}>
                        PAYMENT DATE
                    </Typography>
                    <Typography sx={{ fontSize: '1rem' }}>
                        {new Date(data.payment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </Typography>
                </Grid>
            </Grid>

            <TableContainer sx={{ mb: 4, borderRadius: '4px', border: `1px solid ${alpha(DARK_NAVY, 0.05)}` }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: PRIMARY_RUST }}>
                            <TableCell sx={{ color: '#fff', fontSize: '0.75rem' }}>SERVICE DETAILS</TableCell>
                            <TableCell sx={{ color: '#fff', fontSize: '0.75rem' }}>INVOICE</TableCell>
                            <TableCell align="right" sx={{ color: '#fff', fontSize: '0.75rem' }}>METHOD</TableCell>
                            <TableCell align="right" sx={{ color: '#fff', fontSize: '0.75rem' }}>TXN AMOUNT</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell sx={{ py: 3 }}>
                                {services.length > 0 ? (
                                    services.map((s: any, i: number) => (
                                        <Typography key={i} sx={{ fontSize: '0.85rem', display: 'block' }}>
                                            • {s.description}
                                        </Typography>
                                    ))
                                ) : (
                                    <Typography sx={{ fontSize: '0.85rem' }}>Software Engineering Services</Typography>
                                )}
                            </TableCell>
                            <TableCell sx={{ verticalAlign: 'top', pt: 3 }}>
                                <Typography sx={{ fontSize: '0.85rem', color: PRIMARY_RUST }}>{data.doc_no}</Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ verticalAlign: 'top', pt: 3 }}>
                                <Typography sx={{ fontSize: '0.85rem' }}>{data.payment_method?.toUpperCase()}</Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ verticalAlign: 'top', pt: 3 }}>
                                <Typography sx={{ fontSize: '0.9rem' }}>
                                    {data.currency} {financialMetrics.currentPaid.toLocaleString()}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 7 }}>
                    <Box sx={{ p: 2, bgcolor: alpha(PRIMARY_RUST, 0.03), borderLeft: `2px solid ${PRIMARY_RUST}` }}>
                        <Typography variant="caption" sx={{ color: PRIMARY_RUST, display: 'block', mb: 0.5 }}>NOTES</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'textSecondary' }}>
                            {data.notes || 'Confirming receipt of funds for services rendered. Please keep this for your records.'}
                        </Typography>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                    <Stack spacing={1.5} sx={{ p: 2, bgcolor: alpha(DARK_NAVY, 0.02), borderRadius: '8px' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography sx={{ fontSize: '0.75rem', color: 'textSecondary' }}>TOTAL INVOICE</Typography>
                            <Typography sx={{ fontSize: '0.75rem' }}>
                                {data.currency} {financialMetrics.total.toLocaleString()}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography sx={{ fontSize: '0.75rem', color: PRIMARY_RUST }}>AMOUNT PAID NOW</Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: PRIMARY_RUST }}>
                                {data.currency} {financialMetrics.currentPaid.toLocaleString()}
                            </Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontSize: '0.75rem', color: DARK_NAVY }}><b>OUTSTANDING BALANCE</b></Typography>
                            <Typography sx={{ fontSize: '1.1rem', color: DARK_NAVY }}>
                                {data.currency} {financialMetrics.balance.toLocaleString()}
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
                    <Grid size={{ xs: 12, sm: 4 }}><Typography sx={{ fontSize: '0.7rem' }}>📞 0711927833</Typography></Grid>
                    <Grid size={{ xs: 12, sm: 4 }}><Typography sx={{ fontSize: '0.7rem', textAlign: 'center' }}>📧 business@brookstack.com</Typography></Grid>
                    <Grid size={{ xs: 12, sm: 4 }}><Typography sx={{ fontSize: '0.7rem', textAlign: 'right' }}>🌐 brookstack.com</Typography></Grid>
                </Grid>
            </Box>
            <Box sx={{ height: 6, bgcolor: PRIMARY_RUST }} />
        </Box>
      </Paper>
    </Box>
  );
};