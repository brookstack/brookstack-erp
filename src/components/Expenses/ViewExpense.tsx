import { Dialog, DialogContent, Typography, Stack, Box, Button, Divider, IconButton, alpha } from '@mui/material';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import CloseIcon from '@mui/icons-material/Close';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CategoryIcon from '@mui/icons-material/Category';

const PRIMARY_RUST = '#b52841';
const DARK_NAVY = '#1a202c';

export const ViewExpense = ({ open, onClose, data }: any) => {
    if (!data) return null;

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            fullWidth 
            maxWidth="sm" 
            PaperProps={{ sx: { borderRadius: '12px', overflow: 'hidden' } }}
        >
            <DialogContent sx={{ p: 0 }}>
                {/* --- Slim Header --- */}
                <Box sx={{ 
                    bgcolor: PRIMARY_RUST, 
                    px: 3, 
                    py: 1.5, 
                    color: '#fff', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.6rem', letterSpacing: 1.2, textTransform: 'uppercase', opacity: 0.9 }}>
                        EXPENSE VOUCHER • {new Date(data.expense_date).toLocaleDateString('en-GB', { year: 'numeric' })}
                    </Typography>
                    
                    <IconButton 
                        onClick={onClose} 
                        size="small" 
                        sx={{ color: '#fff', p: 0.5, '&:hover': { bgcolor: alpha('#fff', 0.1) } }}
                    >
                        <CloseIcon sx={{ fontSize: '1.1rem' }} />
                    </IconButton>
                </Box>

                {/* --- Main Content --- */}
                <Box sx={{ p: 3.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
                        <Box sx={{ maxWidth: '70%' }}>
                            <Typography sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.6rem', textTransform: 'uppercase', mb: 0.5 }}>
                                Expense Item
                            </Typography>
                            <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: DARK_NAVY, lineHeight: 1.2 }}>
                                {data.title}
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.6rem', textTransform: 'uppercase', mb: 0.5 }}>
                                Amount
                            </Typography>
                            <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: PRIMARY_RUST }}>
                                KES {parseFloat(data.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </Typography>
                        </Box>
                    </Stack>

                    <Stack direction="row" spacing={5} sx={{ mb: 3 }}>
                        {/* Category */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CategoryIcon sx={{ fontSize: '0.9rem', color: DARK_NAVY }} />
                            <Box>
                                <Typography sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.6rem', textTransform: 'uppercase', display: 'block' }}>
                                    Category
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: DARK_NAVY }}>
                                    {data.category}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Date */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ReceiptIcon sx={{ fontSize: '0.9rem', color: DARK_NAVY }} />
                            <Box>
                                <Typography sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.6rem', textTransform: 'uppercase', display: 'block' }}>
                                    Entry Date
                                </Typography>
                                <Typography sx={{ fontWeight: 600, fontSize: '0.75rem', color: DARK_NAVY }}>
                                    {new Date(data.expense_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>

                    <Divider sx={{ mb: 3, opacity: 0.6 }} />

                    <Box sx={{ mb: 4 }}>
                        <Typography sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.6rem', textTransform: 'uppercase', mb: 1 }}>
                            Description & Notes
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.6 }}>
                            {data.description || 'No additional notes provided for this transaction.'}
                        </Typography>
                    </Box>
                    
                    {data.document_url && (
                        <Button 
                            fullWidth 
                            variant="contained" 
                            disableElevation
                            startIcon={<FilePresentIcon sx={{ fontSize: '1rem' }} />}
                            sx={{ 
                                bgcolor: DARK_NAVY, 
                                borderRadius: '6px', 
                                textTransform: 'none', 
                                fontWeight: 800,
                                fontSize: '0.75rem',
                                py: 1.2,
                                '&:hover': { bgcolor: alpha(DARK_NAVY, 0.9) }
                            }}
                        >
                            View Attached Receipt
                        </Button>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
};