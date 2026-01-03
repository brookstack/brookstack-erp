import React from 'react';
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

const PRIMARY_RUST = '#b7410e'; 
const DARK_NAVY = '#1a202c';

interface InvoiceProps {
  data: any; 
  onBack: () => void;
}

export const ViewInvoice: React.FC<InvoiceProps> = ({ data, onBack }) => {
  const isQuotation = data.type?.toLowerCase() === 'quotation';
  
  // Handle services: parse if it's a JSON string from the DB, otherwise use as is
  const services = React.useMemo(() => {
    if (!data.services) return [];
    return typeof data.services === 'string' ? JSON.parse(data.services) : data.services;
  }, [data.services]);

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: '900px', margin: 'auto' }}>
      {/* Action Bar */}
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
          <IconButton onClick={() => window.print()}><PrintIcon /></IconButton>
          <Button 
            variant="contained" 
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

      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 3, md: 6 }, 
          borderRadius: '4px', 
          border: '1px solid #eee',
          minHeight: '1050px', 
          position: 'relative',
          bgcolor: 'white'
        }}
      >
        {/* Brookstack Technologies Header */}
        <Grid container justifyContent="space-between" alignItems="flex-start" sx={{ mb: 6 }}>
          <Grid size={7}>
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
          <Grid size={5} sx={{ textAlign: 'right' }}>
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
          <Grid size={7}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: PRIMARY_RUST, display: 'block', mb: 1 }}>
                {isQuotation ? 'QUOTATION PREPARED FOR' : 'BILL TO'}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: DARK_NAVY }}>{data.clientName || data.companyName}</Typography>
            <Typography color="textSecondary" variant="body2">{data.contactPerson}</Typography>
            <Typography color="textSecondary" variant="body2">{data.email}</Typography>
          </Grid>
          <Grid size={5}>
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

        {/* Line Items Table */}
        <TableContainer sx={{ mb: 6 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: DARK_NAVY }}>
                <TableCell sx={{ fontWeight: 700, color: '#fff' }}>SERVICE DESCRIPTION</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#fff' }}>FREQUENCY</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#fff' }}>TOTAL ({data.currency})</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((item: any, index: number) => (
                <TableRow key={index} sx={{ '&:nth-of-type(even)': { bgcolor: '#f9f9f9' } }}>
                  <TableCell sx={{ py: 2, fontWeight: 600 }}>{item.description}</TableCell>
                  <TableCell align="center">
                    <Chip label={item.frequency} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {Number(item.price).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Totals and Notes */}
        <Grid container spacing={4}>
          <Grid size={7}>
            {data.notes && (
                <Box sx={{ p: 2, bgcolor: '#fcfcfc', borderLeft: `4px solid ${PRIMARY_RUST}` }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: DARK_NAVY, display: 'block', mb: 0.5 }}>
                        NOTES / TERMS
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555' }}>
                        {data.notes}
                    </Typography>
                </Box>
            )}
            
            <Box sx={{ mt: 4 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: PRIMARY_RUST }}>PAYMENT DETAILS</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>KCB Bank | Garden City Branch</Typography>
                <Typography variant="body2">Acc: Brookstack Technologies | No: 1112405569</Typography>
            </Box>
          </Grid>
          <Grid size={5}>
            <Stack spacing={1.5}>
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
                <Typography variant="h5" sx={{ fontWeight: 900, color: PRIMARY_RUST }}>TOTAL</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: DARK_NAVY }}>
                    {data.currency} {Number(data.grand_total).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Footer Signature Area */}
        <Box sx={{ mt: 10, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#888', mb: 6 }}>
                "Empowering Businesses through Innovative Software Solutions"
            </Typography>
            
            <Grid container justifyContent="space-between">
                <Box sx={{ width: 200 }}>
                    <Divider sx={{ mb: 1 }} />
                    <Typography variant="caption" sx={{ fontWeight: 800 }}>CLIENT SIGNATURE</Typography>
                </Box>
                <Box sx={{ width: 200 }}>
                    <Divider sx={{ mb: 1, borderColor: PRIMARY_RUST }} />
                    <Typography variant="caption" sx={{ fontWeight: 800, color: PRIMARY_RUST }}>AUTHORIZED SIGNATORY</Typography>
                </Box>
            </Grid>
        </Box>

        {/* Design Stripe */}
        <Box sx={{ 
            position: 'absolute', bottom: 0, left: 0, right: 0, 
            height: 6, bgcolor: PRIMARY_RUST 
        }} />
      </Paper>
    </Box>
  );
};