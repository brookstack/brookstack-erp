import React, { useRef } from 'react';
import { 
  Box, Typography, Grid, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  Divider, Button, Stack, Paper, IconButton, Chip, 
  alpha
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import DescriptionIcon from '@mui/icons-material/Description';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PRIMARY_RUST = '#b7410e'; 
const DARK_NAVY = '#1a202c';

interface InvoiceProps {
  data: any; 
  onBack: () => void;
}

export const ViewInvoice: React.FC<InvoiceProps> = ({ data, onBack }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const isQuotation = data.type?.toLowerCase() === 'quotation';
  
  // Logic to handle services
  const services = React.useMemo(() => {
    if (!data.services) return [];
    const rawServices = typeof data.services === 'string' ? JSON.parse(data.services) : data.services;
    return rawServices;
  }, [data.services]);

  // --- PRINT LOGIC ---
  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `${data.doc_no}_${data.clientName}`,
  });

  // --- PDF DOWNLOAD LOGIC ---
  const handleDownloadPDF = async () => {
    const element = invoiceRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${data.doc_no}.pdf`);
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: '950px', margin: 'auto' }}>
      {/* Action Bar - Hidden during Print by logic, but also visually */}
      <Stack 
        direction="row" 
        justifyContent="space-between" 
        sx={{ mb: 3, '@media print': { display: 'none' } }}
      >
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={onBack} 
          sx={{ color: DARK_NAVY, fontWeight: 700 }}
        >
          Back to Ledger
        </Button>
        <Stack direction="row" spacing={1}>
          <IconButton onClick={() => handlePrint()}><PrintIcon /></IconButton>
          <Button 
            variant="contained" 
            onClick={handleDownloadPDF}
            startIcon={<DownloadIcon />} 
            sx={{ 
                bgcolor: PRIMARY_RUST, 
                '&:hover': { bgcolor: '#8e320b' }, 
                borderRadius: '8px', 
                textTransform: 'none',
                fontWeight: 700 
            }}
          >
            Export PDF
          </Button>
        </Stack>
      </Stack>

      {/* THE INVOICE AREA */}
      <Paper 
        ref={invoiceRef}
        elevation={0} 
        sx={{ 
          p: { xs: 3, md: 6 }, 
          borderRadius: '0px', // Standard for paper
          minHeight: '1000px', 
          position: 'relative',
          bgcolor: 'white',
          display: 'flex',
          flexDirection: 'column',
          // Ensure it looks right when printing
          '@media print': {
            margin: 0,
            boxShadow: 'none',
            border: 'none',
          }
        }}
      >
        {/* Header Section */}
        <Grid container spacing={2} justifyContent="space-between" alignItems="flex-start" sx={{ mb: 6 }}>
          <Grid size={{ xs: 7 }}>
             <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ 
                  width: 50, height: 50, bgcolor: PRIMARY_RUST, 
                  borderRadius: '8px', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', 
                  color: '#fff'
                }}>
                  <DescriptionIcon fontSize="large" />
                </Box>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: DARK_NAVY, letterSpacing: -1 }}>
                      BROOKSTACK
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: PRIMARY_RUST, letterSpacing: 3 }}>
                      TECHNOLOGIES
                    </Typography>
                </Box>
             </Stack>
          </Grid>
          <Grid size={{ xs: 5 }} sx={{ textAlign: 'right' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: alpha(DARK_NAVY, 0.1) }}>
              {data.type?.toUpperCase()}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: DARK_NAVY }}>
                {data.doc_no}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 4, borderColor: alpha(PRIMARY_RUST, 0.2) }} />

        {/* Client & Document Info */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid size={{ xs: 7 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: PRIMARY_RUST, display: 'block', mb: 1 }}>
                {isQuotation ? 'QUOTATION PREPARED FOR' : 'BILL TO'}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: DARK_NAVY, mb: 0.5 }}>
                {data.clientName || data.companyName}
            </Typography>
            <Typography color="textSecondary" variant="body2">📧 {data.email || 'N/A'}</Typography>
            <Typography color="textSecondary" variant="body2">📞 {data.phone || 'N/A'}</Typography>
          </Grid>
          <Grid size={{ xs: 5 }}>
            <Stack spacing={0.5} sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: PRIMARY_RUST }}>DATE ISSUED</Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {new Date(data.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
              </Typography>
              <Box sx={{ mt: 1 }}>
                 <Chip 
                    label={data.status?.toUpperCase()} 
                    size="small" 
                    sx={{ fontWeight: 800, fontSize: '0.65rem', bgcolor: alpha(PRIMARY_RUST, 0.1), color: PRIMARY_RUST }} 
                 />
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Services Table */}
        <TableContainer sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: DARK_NAVY }}>
                <TableCell sx={{ fontWeight: 700, color: '#fff' }}>SERVICE DESCRIPTION</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#fff' }}>UNIT PRICE</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#fff' }}>VAT (16%)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#fff' }}>TOTAL ({data.currency})</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((item: any, index: number) => {
                const price = Number(item.price) || 0;
                const vatAmount = item.vat ? (price * 0.16) : 0;
                const rowTotal = price + vatAmount;

                return (
                  <TableRow key={index} sx={{ '&:nth-of-type(even)': { bgcolor: '#f9f9f9' } }}>
                    <TableCell sx={{ py: 2 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.description}</Typography>
                        <Typography variant="caption" color="textSecondary">{item.frequency}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500 }}>
                      {price.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      {vatAmount > 0 ? vatAmount.toLocaleString() : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {rowTotal.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Summary */}
        <Grid container spacing={4} sx={{ mb: 'auto' }}>
          <Grid size={{ xs: 7 }}>
            {data.notes && (
                <Box sx={{ p: 2, bgcolor: '#fcfcfc', borderLeft: `4px solid ${PRIMARY_RUST}`, mb: 3 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: DARK_NAVY, display: 'block', mb: 0.5 }}>
                        NOTES / TERMS
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555' }}>
                        {data.notes}
                    </Typography>
                </Box>
            )}
            <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: PRIMARY_RUST }}>PAYMENT DETAILS</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>KCB Bank | Garden City Branch</Typography>
                <Typography variant="body2">Acc: Brookstack Technologies | No: 1112405569</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 5 }}>
            <Stack spacing={1.5} sx={{ p: 2, bgcolor: alpha(PRIMARY_RUST, 0.03), borderRadius: '8px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Subtotal</Typography>
                <Typography variant="body2">{data.currency} {Number(data.subtotal).toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>VAT Total</Typography>
                <Typography variant="body2">{data.currency} {Number(data.vat_total).toLocaleString()}</Typography>
              </Box>
              <Divider sx={{ my: 1, borderColor: DARK_NAVY }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: PRIMARY_RUST }}>TOTAL DUE</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: DARK_NAVY }}>
                    {data.currency} {Number(data.grand_total).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Footer Section */}
        <Box sx={{ mt: 8, pt: 4 }}>
            <Typography sx={{ textAlign: 'center', fontSize: '0.85rem', color: DARK_NAVY, mb: 4 }}>
                Experts in High-Precision Software Engineering.
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container justifyContent="space-between" alignItems="center" sx={{ color: '#666' }}>
                <Grid size={{ xs: 4 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>📞 0711927833</Typography>
                </Grid>
                <Grid size={{ xs: 4 }} sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>📧 business@brookstack.com</Typography>
                </Grid>
                <Grid size={{ xs: 4 }} sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>🌐 www.brookstack.com</Typography>
                </Grid>
            </Grid>
        </Box>

        {/* Decorative Design Stripe */}
        <Box sx={{ 
            position: 'absolute', bottom: 0, left: 0, right: 0, 
            height: 8, bgcolor: PRIMARY_RUST 
        }} />
      </Paper>
    </Box>
  );
};