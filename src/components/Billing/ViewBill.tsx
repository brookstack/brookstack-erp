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

interface InvoiceProps {
  data: any; 
  onBack: () => void;
}

export const ViewInvoice: React.FC<InvoiceProps> = ({ data, onBack }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isQuotation = data.type?.toLowerCase() === 'quotation';
  
  const services = useMemo(() => {
    if (!data.services) return [];
    return typeof data.services === 'string' ? JSON.parse(data.services) : data.services;
  }, [data.services]);

  const handleDownloadPDF = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `${data.doc_no}_${data.clientName}`,
  });

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '950px', margin: 'auto' }}>
      <GlobalStyles styles={{
        '@media print': {
          '@page': { 
            size: 'auto',
            margin: '0mm !important', 
          },
          'body': {
            margin: '0px !important',
            padding: '0px !important',
          },
          '.print-header-spacer': {
            display: 'table-header-group !important',
            height: '20mm',
          },
          '.print-footer-spacer': {
            display: 'table-footer-group !important',
            height: '25mm',
          },
          '.sticky-footer': {
            position: 'fixed !important',
            bottom: 0,
            left: 0,
            right: 0,
            height: '25mm',
            padding: '0 20mm 10mm 20mm !important',
            backgroundColor: 'white',
            zIndex: 1000,
          },
          '.print-main-table': {
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
          },
          '.print-content-cell': {
            padding: '0 20mm 0 20mm !important',
          },
          '.page-number:after': {
            counterIncrement: 'page',
            content: 'counter(page)',
          }
        }
      }} />

      {/* Action Bar */}
      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center"
        sx={{ mb: 3, '@media print': { display: 'none' } }}
      >
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={onBack} 
          sx={{ color: DARK_NAVY, fontWeight: 700, textTransform: 'none' }}
        >
          {isMobile ? 'Back' : 'Back to Invoices'}
        </Button>
        <Stack direction="row" spacing={1}>
          {!isMobile && (
            <IconButton onClick={() => handleDownloadPDF()} sx={{ color: DARK_NAVY }}>
              <PrintIcon />
            </IconButton>
          )}
          <Button 
            variant="contained" 
            onClick={() => handleDownloadPDF()}
            startIcon={<DownloadIcon />} 
            sx={{ 
                bgcolor: PRIMARY_RUST, 
                '&:hover': { bgcolor: '#8e320b' }, 
                borderRadius: '8px', 
                textTransform: 'none',
                fontWeight: 700,
                px: { xs: 2, sm: 3 }
            }}
          >
            {isMobile ? 'PDF' : 'Export PDF'}
          </Button>
        </Stack>
      </Stack>

      {/* Main Invoice Document */}
      <Paper 
        ref={invoiceRef}
        elevation={isMobile ? 0 : 2} 
        sx={{ 
          p: 0,
          borderRadius: '0px',
          minHeight: '297mm', 
          bgcolor: 'white',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          border: isMobile ? `1px solid ${alpha(DARK_NAVY, 0.1)}` : 'none',
          '@media print': { boxShadow: 'none', border: 'none' }
        }}
      >
        <table className="print-main-table">
          <thead className="print-header-spacer" style={{ display: 'none' }}>
            <tr><td><Box sx={{ height: '20mm' }} /></td></tr>
          </thead>
          
          <tbody>
            <tr>
              <td className="print-content-cell" style={{ padding: '40px 75px 20px 75px' }}>
                <Box sx={{ flexGrow: 1 }}>
                    {/* Header */}
                    <Grid container spacing={3} alignItems="center" sx={{ mb: 2 }}>
                        <Grid size={{ xs: 12, sm: 7 }}>
                            <Box component="img" src="/logo.png" alt="Logo" sx={{ width: { xs: 250, sm: 300, md: 400 }, height: 'auto' }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 5 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                             <Typography variant="h6" sx={{ color: PRIMARY_RUST, letterSpacing: '0.1em', mb: 0.5, fontWeight: 800 }}>
                               OFFICIAL {data.type?.toUpperCase()}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: DARK_NAVY }}>{data.doc_no}</Typography>
                        </Grid>
                    </Grid>

                    <Divider sx={{ mb: 4, borderColor: alpha(PRIMARY_RUST, 0.2) }} />

                    {/* Client & Date Info */}
                    <Grid container spacing={3} sx={{ mb: 6 }}>
                        <Grid size={{ xs: 12, sm: 7 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: PRIMARY_RUST, display: 'block', mb: 1 }}>
                                {isQuotation ? 'QUOTATION PREPARED FOR' : 'INVOICE TO'}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: DARK_NAVY, mb: 0.5 }}>{data.clientName || data.companyName}</Typography>
                            <Typography color="textSecondary" variant="body2">📧 {data.email || 'N/A'}</Typography>
                            <Typography color="textSecondary" variant="body2">📞 {data.clientPhone || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 5 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: PRIMARY_RUST }}>DATE ISSUED</Typography>
                            <Typography sx={{ fontWeight: 700 }}>
                                {new Date(data.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </Typography>
                        </Grid>
                    </Grid>

                    {/* Services Table */}
                    <TableContainer sx={{ mb: 4, borderRadius: '4px', border: `1px solid ${alpha(DARK_NAVY, 0.05)}` }}>
                        <Table size={isMobile ? "small" : "medium"}>
                            <TableHead>
                                <TableRow sx={{ bgcolor: PRIMARY_RUST }}>
                                    <TableCell sx={{ fontWeight: 700, color: '#fff' }}>SERVICE</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, color: '#fff' }}>FEE</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, color: '#fff' }}>16% VAT</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, color: '#fff' }}>TOTAL</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {services.map((item: any, index: number) => {
                                    const price = Number(item.price) || 0;
                                    const vatAmount = item.vat ? (price * 0.16) : 0;
                                    return (
                                        <TableRow key={index} sx={{ pageBreakInside: 'avoid', '&:nth-of-type(even)': { bgcolor: alpha(DARK_NAVY, 0.02) } }}>
                                            <TableCell sx={{ py: 2 }}>
                                                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.description}</Typography>
                                                <Typography variant="caption" color="textSecondary">{item.frequency}</Typography>
                                            </TableCell>
                                            <TableCell align="right">{price.toLocaleString()}</TableCell>
                                            <TableCell align="right">{vatAmount > 0 ? vatAmount.toLocaleString() : '-'}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700 }}>{(price + vatAmount).toLocaleString()}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Financial Summary & Notes */}
                    <Box sx={{ pageBreakInside: 'avoid', mb: 4 }}>
                        <Grid container spacing={4}>
                            {/* Notes Section - Left Side */}
                            <Grid size={{ xs: 12, sm: 6, md: 8 }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: PRIMARY_RUST, mb: 1, display: 'block' }}>
                                    NOTES & TERMS
                                </Typography>
                                <Typography variant="body2" sx={{ color: alpha(DARK_NAVY, 0.7), fontSize: '0.75rem', lineHeight: 1.6 }}>
                                    {data.notes || "1. Payment is due within 7 days of invoice issuance.\n2. Please use the Invoice Number as the payment reference.\n3. Goods/Services once provided are subject to our standard service agreement."}
                                </Typography>
                            </Grid>

                            {/* Totals Section - Right Side */}
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Stack spacing={1} sx={{ p: 2, bgcolor: alpha(DARK_NAVY, 0.02), borderRadius: '8px' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Subtotal</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{data.currency} {Number(data.subtotal).toLocaleString()}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">VAT (16%)</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{data.currency} {Number(data.vat_total).toLocaleString()}</Typography>
                                    </Box>
                                    <Divider />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: PRIMARY_RUST }}>TOTAL DUE</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: DARK_NAVY }}>{data.currency} {Number(data.grand_total).toLocaleString()}</Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Banking Info */}
                    <Box sx={{ mb: 10 }}>
                        <Typography variant="overline" sx={{ fontWeight: 800, color: PRIMARY_RUST, mb: 1, display: 'block' }}>OFFICIAL PAYMENT CHANNELS</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <Box sx={{ p: 1.5, height: '100%', borderRadius: '8px', borderLeft: `4px solid ${PRIMARY_RUST}`, bgcolor: alpha(PRIMARY_RUST, 0.02) }}>
                                   <Typography sx={{ fontWeight: 900, fontSize: '0.6rem', color: PRIMARY_RUST }}>BANK (KCB)</Typography>
                                    <Typography sx={{ fontWeight: 500, fontSize: '0.75rem' }}>Acc No: 1348499796</Typography>
                                    <Typography sx={{ fontWeight: 500, fontSize: '0.75rem' }}>Brookstack Technologies Limited</Typography>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Box sx={{ p: 1.5, height: '100%', borderRadius: '8px', borderLeft: '4px solid #2e7d32', bgcolor: alpha('#2e7d32', 0.02) }}>
                                   <Typography sx={{ fontWeight: 900, fontSize: '0.6rem', color: '#2e7d32' }}>LIPA NA M-PESA</Typography>
                                    <Typography sx={{ fontWeight: 500, fontSize: '0.75rem' }}>Paybill: 522522</Typography>
                                    <Typography sx={{ fontWeight: 500, fontSize: '0.75rem' }}>Acc No: 1348499796</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
              </td>
            </tr>
          </tbody>

          <tfoot className="print-footer-spacer" style={{ display: 'none' }}>
            <tr><td><Box sx={{ height: '25mm' }} /></td></tr>
          </tfoot>
        </table>

        {/* Global Footer */}
        <Box className="sticky-footer" sx={{ 
          mt: 'auto', 
          width: '100%',
          px: '75px', 
          pb: '30px',
          bgcolor: 'white'
        }}>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid size={{ xs: 4 }}><Typography sx={{ fontSize: '0.65rem', fontWeight: 700 }}>📞 +254711927833</Typography></Grid>
                <Grid size={{ xs: 4 }}><Typography sx={{ fontSize: '0.65rem', fontWeight: 700, textAlign: 'center' }}>📧 business@brookstack.com</Typography></Grid>
                <Grid size={{ xs: 4 }}><Typography sx={{ fontSize: '0.65rem', fontWeight: 700, textAlign: 'right' }}>🌐 www.brookstack.com</Typography></Grid>
            </Grid>
            <Box sx={{ height: 6, bgcolor: PRIMARY_RUST, width: '100%', mt: 1 }} />
        </Box>
      </Paper>
    </Box>
  );
};