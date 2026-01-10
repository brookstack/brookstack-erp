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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `${data.doc_no}_${data.clientName}`,
  });

  const handleDownloadPDF = async () => {
    const element = invoiceRef.current;
    if (!element) return;

    const originalWidth = element.style.width;
    const originalMinHeight = element.style.minHeight;

    element.style.width = '950px';
    element.style.minHeight = '1123px'; 

    try {
      const canvas = await html2canvas(element, { 
          scale: 2, 
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          windowWidth: 1200,
          logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // We fit the canvas to the exact A4 dimensions
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${data.doc_no}.pdf`);
    } catch (err) {
      console.error("PDF Generation failed", err);
    } finally {
      element.style.width = originalWidth;
      element.style.minHeight = originalMinHeight;
    }
  };

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
          sx={{ color: DARK_NAVY, fontWeight: 700, textTransform: 'none' }}
        >
          {isMobile ? 'Back' : 'Back to Ledger'}
        </Button>
        <Stack direction="row" spacing={1}>
          {!isMobile && (
            <IconButton onClick={() => handlePrint()} sx={{ color: DARK_NAVY }}>
              <PrintIcon />
            </IconButton>
          )}
          <Button 
            variant="contained" 
            onClick={handleDownloadPDF}
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

      <Paper 
        ref={invoiceRef}
        elevation={isMobile ? 0 : 2} 
        sx={{ 
          p: { xs: 2, sm: 4, md: 6 }, 
          pb: '100px', // Create space for the absolute footer
          borderRadius: '0px',
          minHeight: '1123px', 
          position: 'relative',
          bgcolor: 'white',
          display: 'flex',
          flexDirection: 'column', 
          overflow: 'hidden',
          border: isMobile ? `1px solid ${alpha(DARK_NAVY, 0.1)}` : 'none',
          '@media print': { margin: 0, boxShadow: 'none', border: 'none' }
        }}
      >
        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1 }}>
            {/* Header */}
            <Grid container spacing={3} alignItems="center">
                <Grid size={{ xs: 12, sm: 7 }}>
                    <Box component="img" src="/logo.png" alt="Logo" sx={{ width: { xs: 250, sm: 300, md: 400 }, height: 'auto' }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 900, color: alpha(DARK_NAVY, 0.1), mb: 0.5 }}>
                        {data.type?.toUpperCase()}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: DARK_NAVY }}>{data.doc_no}</Typography>
                </Grid>
            </Grid>

            <Divider sx={{ mb: 4, borderColor: alpha(PRIMARY_RUST, 2) }} />

            {/* Info Section */}
            <Grid container spacing={3} sx={{ mb: 6 }}>
                <Grid size={{ xs: 12, sm: 7 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: PRIMARY_RUST, display: 'block', mb: 1 }}>
                        {isQuotation ? 'QUOTATION PREPARED FOR' : 'INVOICE TO'}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: DARK_NAVY, mb: 0.5 }}>{data.clientName || data.companyName}</Typography>
                    <Typography color="textSecondary" variant="body2">📧 {data.email || 'N/A'}</Typography>
                    <Typography color="textSecondary" variant="body2">📞 {data.phone || 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: PRIMARY_RUST }}>DATE ISSUED</Typography>
                    <Typography sx={{ fontWeight: 700 }}>
                        {new Date(data.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </Typography>
                </Grid>
            </Grid>

            {/* Table */}
            <TableContainer sx={{ mb: 4, borderRadius: '4px', border: `1px solid ${alpha(DARK_NAVY, 0.05)}` }}>
                <Table size={isMobile ? "small" : "medium"}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: PRIMARY_RUST }}>
                            <TableCell sx={{ fontWeight: 700, color: '#fff' }}>SERVICE</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#fff' }}>SERVICE FEE</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#fff' }}>16% VAT</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#fff' }}>TOTAL AMT</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {services.map((item: any, index: number) => {
                            const price = Number(item.price) || 0;
                            const vatAmount = item.vat ? (price * 0.16) : 0;
                            return (
                                <TableRow key={index} sx={{ '&:nth-of-type(even)': { bgcolor: alpha(DARK_NAVY, 0.02) } }}>
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

            {/* Totals & Notes */}
            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 7 }}>
                    {data.notes && (
                        <Box sx={{ p: 2, bgcolor: alpha(PRIMARY_RUST, 0.02), borderLeft: `4px solid ${PRIMARY_RUST}`, mb: 3 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: DARK_NAVY, display: 'block', mb: 0.5 }}>NOTES / TERMS</Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#444' }}>{data.notes}</Typography>
                        </Box>
                    )}
                    <Typography variant="caption" sx={{ fontWeight: 800, color: PRIMARY_RUST }}>PAYMENT DETAILS</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Kenya Commercial Bank (KCB) | Garden City</Typography>
                    <Typography variant="body2" sx={{ color: '#444' }}>Acc: Brookstack Technologies | No: 1112405569</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                    <Stack spacing={1.5} sx={{ p: 2, bgcolor: alpha(DARK_NAVY, 0.02), borderRadius: '8px' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Subtotal</Typography>
                            <Typography variant="body2">{data.currency} {Number(data.subtotal).toLocaleString()}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">VAT (16%)</Typography>
                            <Typography variant="body2">{data.currency} {Number(data.vat_total).toLocaleString()}</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6" sx={{ fontWeight: 900, color: PRIMARY_RUST }}>TOTAL DUE</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 900, color: DARK_NAVY }}>{data.currency} {Number(data.grand_total).toLocaleString()}</Typography>
                        </Box>
                    </Stack>
                </Grid>
            </Grid>
        </Box>

        {/* BOTTOM FIXED FOOTER - The Gap Fix */}
        <Box sx={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            width: '100%',
            bgcolor: 'white' 
        }}>
            <Box sx={{ px: { xs: 2, sm: 4, md: 6 }, pb: 4 }}>
                <Typography sx={{ textAlign: 'center', fontSize: '0.8rem', color: alpha(DARK_NAVY, 0.6), mb: 3, fontStyle: 'italic' }}>
                    "Experts in High-Precision Software Engineering"
                </Typography>
                <Divider sx={{ mb: 2, opacity: 0.5 }} />
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textAlign: { xs: 'center', sm: 'left' }, color: DARK_NAVY }}>📞 0711927833</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textAlign: 'center', color: DARK_NAVY }}>📧 business@brookstack.com</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textAlign: { xs: 'center', sm: 'right' }, color: DARK_NAVY }}>🌐 brookstack.com</Typography>
                    </Grid>
                </Grid>
            </Box>
            {/* The decorative stripe touching the very edge */}
            <Box sx={{ height: 10, bgcolor: PRIMARY_RUST, width: '100%' }} />
        </Box>
      </Paper>
    </Box>
  );
};