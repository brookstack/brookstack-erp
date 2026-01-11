import { useState, useEffect } from 'react';
import { 
    Box, Paper, TextField, Button, Typography, 
    Alert, CircularProgress, Stack 
} from '@mui/material';

const PRIMARY_RUST = '#b52841';
const DARK_NAVY = '#1a202c';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Clear session on component mount to prevent login loops
    useEffect(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            // Check for success from your revised backend
            if (response.ok && data.success) {
                console.log("Login successful, saving session...");
                
                // Store token and user info
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Force a redirect to the home page
                window.location.href = '/'; 
            } else {
                setError(data.error || 'Invalid credentials');
            }
        } catch (err) {
            console.error("Connection error:", err);
            setError('Could not connect to the Brookstack ERP Server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ 
            height: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            bgcolor: '#f4f6f8' 
        }}>
            <Paper elevation={6} sx={{ p: 5, width: '100%', maxWidth: 420, borderRadius: 4 }}>
                <Stack spacing={3}>
                    <Box textAlign="center">
                        <Typography variant="h4" sx={{ fontWeight: 900, color: DARK_NAVY, letterSpacing: -1 }}>
                            BROOK<span style={{ color: PRIMARY_RUST }}>STACK</span>
                        </Typography>
                        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            Technology Systems ERP
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>Welcome Back</Typography>
                        <Typography variant="body2" color="text.secondary">Enter your credentials to access the system</Typography>
                    </Box>

                    {error && <Alert severity="error" variant="filled">{error}</Alert>}

                    <form onSubmit={handleLogin}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            margin="normal"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            margin="normal"
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{ 
                                mt: 4, 
                                py: 1.8, 
                                bgcolor: DARK_NAVY, 
                                fontSize: '1rem',
                                textTransform: 'none',
                                '&:hover': { bgcolor: '#000' },
                                fontWeight: 700
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Into Dashboard'}
                        </Button>
                    </form>

                    <Typography variant="caption" color="text.secondary" textAlign="center">
                        Authorized Personnel Only
                    </Typography>
                </Stack>
            </Paper>
        </Box>
    );
};