import { useState, useEffect } from 'react';
import {
    Box, TextField, Button, Typography,
    Alert, CircularProgress, Stack, Checkbox, FormControlLabel,
    InputAdornment, IconButton, Link
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import { API_BASE_URL } from '../config/api';

// Brand colors
const PRIMARY_RUST = '#b52841';
const DARK_NAVY = '#1a202c';
const TEXT_GRAY = '#64748b';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.ok && data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/';
            } else {
                setError(data.error || 'Invalid credentials');
            }
        } catch (err) {
            setError('Could not connect to the Brookstack ERP Server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            display: 'flex',
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
            bgcolor: '#fff'
        }}>

            {/* LEFT SIDE: ADAPTIVE LOGIN FORM */}
            <Box sx={{
                // Takes 100% width on mobile, 50% on desktop (md+)
                flex: { xs: '1 1 100%', md: '1 1 50%' },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                // Responsive padding: less on mobile, more on desktop
                px: { xs: 3, sm: 8, md: 10, lg: 12 },
                bgcolor: '#fff',
                zIndex: 2
            }}>
                <Stack spacing={4} sx={{ width: '100%', maxWidth: 460 }}>

                    {/* Brand Branding Section */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Box
                            component="img"
                            src="/logo.png"
                            alt="Brookstack Logo"
                            sx={{
                                // Responsive logo size
                                height: { xs: 120, md: 150 },
                                width: 'auto',
                                // objectFit: 'contain'
                            }}
                        />
                        <Typography variant="body2" sx={{ color: TEXT_GRAY, fontWeight: 500}}>
                            Sign in to continue to your dashboard
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" variant="filled" sx={{ borderRadius: '12px', fontWeight: 600 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleLogin}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: DARK_NAVY }}>
                            Email Address
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="Enter your corporate email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ mb: 3 }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonOutlineIcon sx={{ color: PRIMARY_RUST }} />
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: '12px', height: '56px' }
                                }
                            }}
                        />

                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: DARK_NAVY }}>
                            Password
                        </Typography>
                        <TextField
                            fullWidth
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{ mb: 2 }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlinedIcon sx={{ color: PRIMARY_RUST }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                {showPassword ? <VisibilityOff sx={{ color: PRIMARY_RUST }} /> : <Visibility sx={{ color: PRIMARY_RUST }} />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: '12px', height: '56px' }
                                }
                            }}
                        />

                        <Box sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' }, // Stack on very small screens
                            justifyContent: 'space-between',
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            mb: 4,
                            gap: { xs: 1, sm: 0 }
                        }}>
                            <FormControlLabel
                                control={<Checkbox size="small" sx={{ '&.Mui-checked': { color: DARK_NAVY } }} />}
                                label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Remember me</Typography>}
                            />
                            <Link href="#" sx={{ fontSize: '0.85rem', fontWeight: 700, color: PRIMARY_RUST, textDecoration: 'none' }}>
                                Forgot password?
                            </Link>
                        </Box>
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{
                                py: 2,
                                bgcolor: PRIMARY_RUST,
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 700,
                                boxShadow: '0 4px 14px 0 rgba(26, 32, 44, 0.39)',
                                '&:hover': { bgcolor: '#b52841' }
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign into ERP'}
                        </Button>
                    </Box>

                    <Typography variant="body2" sx={{ textAlign: 'center', color: TEXT_GRAY }}>
                        Having trouble? {' '}
                        <Link
                            href="https://www.brookstack.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                color: PRIMARY_RUST,
                                fontWeight: 700,
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' } // Optional: adds a nice hover effect
                            }}
                        >
                            Contact IT Support
                        </Link>
                    </Typography>
                </Stack>
            </Box>

            {/* RIGHT SIDE: EQUAL BRAND IMAGE (Hidden on Mobile) */}
            <Box sx={{
                flex: { md: '1 1 50%' }, // Takes 50% on desktop
                display: { xs: 'none', md: 'block' }, // Hides on mobile/tablet
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Box
                    component="img"
                    src="/login.jpg"
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
                <Box sx={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    bgcolor: 'rgba(26, 32, 44, 0.15)',
                }} />
            </Box>
        </Box>
    );
};