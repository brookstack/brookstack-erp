import React, { useState } from 'react';
import {
    Box, Typography, Stack, Chip, Tabs, Tab,
    Divider, Grid, Paper, alpha, Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import EngineeringIcon from '@mui/icons-material/Engineering';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const RUST_COLOR = '#b7410e';

interface ViewCustomerProps {
    customer: any;
    onBack: () => void;
}

export const ViewCustomer: React.FC<ViewCustomerProps> = ({ customer, onBack }) => {
    const [activeTab, setActiveTab] = useState(0);

    const statusColors: any = {
        active: { color: '#2ecc71', bg: alpha('#2ecc71', 0.1) },
        lead: { color: '#f1c40f', bg: alpha('#f1c40f', 0.1) },
        inactive: { color: '#e74c3c', bg: alpha('#e74c3c', 0.1) },
    };

    const currentStatus = statusColors[customer.status?.toLowerCase()] || { color: '#8a92a6', bg: '#f1f1f1' };

    return (
        <Box sx={{ p: 4, bgcolor: '#fcfcfc', minHeight: '100vh' }}>
            {/* Header Section */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={onBack}
                sx={{ color: '#666', mb: 3, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: 'transparent', color: '#000' } }}
            >
                Back to Clients
            </Button>

            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
                <Stack spacing={0.5}>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.02em' }}>
                        {customer.companyName}
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <BusinessIcon sx={{ fontSize: 18, color: RUST_COLOR }} /> {customer.clientType}
                        </Typography>
                        <Divider orientation="vertical" flexItem sx={{ height: 15, alignSelf: 'center' }} />
                        <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                            ID: BRK-{customer.id?.toString().padStart(4, '0')}
                        </Typography>
                        <Chip
                            label={customer.status?.toUpperCase()}
                            sx={{
                                bgcolor: currentStatus.bg,
                                color: currentStatus.color,
                                fontWeight: 900,
                                borderRadius: '8px',
                                px: 1,
                                height: 32
                            }}
                        />
                    </Stack>
                </Stack>
            </Stack>

            {/* Modern Tabs Navigation */}
            <Box sx={{ mb: 4 }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    TabIndicatorProps={{ sx: { bgcolor: RUST_COLOR, height: 3, borderRadius: '3px 3px 0 0' } }}
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 700,
                            minWidth: 100,
                            fontSize: '0.95rem',
                            color: '#888',
                            mr: 2
                        },
                        '& .Mui-selected': { color: `${RUST_COLOR} !important` }
                    }}
                >
                    <Tab label="Overview" />
                    <Tab label="Services" />
                    <Tab label="Billing & Invoices" />
                    <Tab label="Payments" />
                    <Tab label="Support" />
                </Tabs>
                <Divider sx={{ mt: '-1px', opacity: 0.6 }} />
            </Box>

            {/* Tab Content Areas */}
            <Box>
                {activeTab === 0 && (
                    <Grid container spacing={3}>
                        {/* Column 1: Identity & Contact */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <InfoCard title="Identity" icon={<ContactPageIcon sx={{ color: RUST_COLOR }} />}>
                                <DetailItem label="Full Company Name" value={customer.companyName} />
                                <DetailItem label="Client Category" value={customer.clientType} />
                                <DetailItem label="Primary Contact" value={customer.contactPerson} />
                            </InfoCard>
                        </Grid>

                        {/* Column 2: Communication */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <InfoCard title="Communication" icon={<SupportAgentIcon sx={{ color: RUST_COLOR }} />}>
                                <DetailItem label="Email Address" value={customer.email} highlight />
                                <DetailItem label="Mobile Number" value={customer.mobile} />
                                <DetailItem label="Account Manager" value={customer.accountManager} />
                            </InfoCard>
                        </Grid>

                        {/* Column 3: Location */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <InfoCard title="Location Details" icon={<LocationOnIcon sx={{ color: RUST_COLOR }} />}>
                                <DetailItem label="Country / City" value={`${customer.location || 'Kenya'}, ${customer.city}`} />
                                <DetailItem label="Building / Office" value={customer.building} />
                                <DetailItem label="Onboarding Date" value={new Date(customer.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
                            </InfoCard>
                        </Grid>
                    </Grid>
                )}

                {activeTab === 1 && (
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <InfoCard title="Active Services" icon={<EngineeringIcon sx={{ color: RUST_COLOR }} />}>
                                <Box sx={{ py: 1 }}>
                                    <DetailItem label="Main Service Category" value={customer.serviceCategory} />
                                    <DetailItem label="Engagement Model" value={customer.engagementType} />
                                    <Box sx={{ mt: 3, p: 2, bgcolor: '#f9f9f9', borderRadius: 2, border: '1px dashed #ddd' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: RUST_COLOR, display: 'block', mb: 1 }}>PROJECT DESCRIPTION</Typography>
                                        <Typography variant="body2" sx={{ color: '#444', lineHeight: 1.6 }}>
                                            {customer.description || "No project description provided."}
                                        </Typography>
                                    </Box>
                                </Box>
                            </InfoCard>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <InfoCard title="Internal Notes" icon={<ReceiptLongIcon sx={{ color: RUST_COLOR }} />}>
                                <Typography variant="body2" sx={{ color: '#666', fontStyle: customer.notes ? 'normal' : 'italic', lineHeight: 1.6 }}>
                                    {customer.notes || "No internal notes for this client."}
                                </Typography>
                            </InfoCard>
                        </Grid>
                    </Grid>
                )}

                {activeTab > 1 && (
                    <Paper variant="outlined" sx={{ py: 10, textAlign: 'center', borderRadius: 4, borderStyle: 'dashed', bgcolor: alpha(RUST_COLOR, 0.01) }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#888' }}>Module Under Development</Typography>
                        <Typography variant="body2" color="text.secondary">The {['', '', 'Billing', 'Payments', 'Support'][activeTab]} module for {customer.companyName} is being linked.</Typography>
                    </Paper>
                )}
            </Box>
        </Box>
    );
};

// --- Custom Styled Components ---

const InfoCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <Paper
        variant="outlined"
        sx={{
            p: 3,
            borderRadius: '16px',
            height: '100%',
            borderColor: '#eee',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderColor: alpha(RUST_COLOR, 0.2) }
        }}
    >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
            {icon}
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#333', fontSize: '1.05rem' }}>{title}</Typography>
        </Stack>
        <Stack spacing={2.5}>
            {children}
        </Stack>
    </Paper>
);

const DetailItem = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
    <Box>
        <Typography variant="caption" sx={{ color: '#999', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
            {label}
        </Typography>
        <Typography
            variant="body1"
            sx={{
                fontWeight: 600,
                color: highlight ? RUST_COLOR : '#2c3e50',
                fontSize: '0.95rem'
            }}
        >
            {value || 'Not Provided'}
        </Typography>
    </Box>
);