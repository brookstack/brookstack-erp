import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    AppBar,
    Toolbar,
    Typography,
    Avatar,
    IconButton,
    useTheme,
    useMediaQuery,
    alpha,
    Divider,
    Menu,
    MenuItem,
    ListItemIcon as MenuIconIcon,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { navConfig } from './NavConfig';

const drawerWidth = 260;

interface Props {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<Props> = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [user, setUser] = useState<{ name: string; role: string } | null>(null);
    
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

    // Load user data from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    // Profile Menu Handlers
    const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleViewProfile = () => {
        handleProfileClose();
        navigate('/staff'); // Or your dedicated profile path
    };

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                    component="img"
                    src="/logo.png"
                    alt="Brookstack Logo"
                    sx={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 1.5,
                        display: 'flex',
                        objectFit: 'contain'
                    }}
                />
            </Box>

            <Divider sx={{ borderColor: '#f3f4f6', mx: 2 }} />

            <List sx={{ px: 2, py: 3 }}>
                {navConfig.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItemButton
                            key={item.title}
                            component={NavLink}
                            to={item.path}
                            sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                py: 1.2,
                                color: isActive ? 'primary.main' : 'text.secondary',
                                bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                '&.active': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.main',
                                },
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                    color: 'primary.main',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 38, color: isActive ? 'primary.main' : 'inherit' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.title}
                                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600, color: "#000" }}
                            />
                        </ListItemButton>
                    );
                })}
            </List>

            <Box sx={{ mt: 'auto', p: 2 }}>
                <Box sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 3, border: '1px solid #f3f4f6' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        Brookstack ERP v1.0
                    </Typography>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
                <Drawer
                    variant={isDesktop ? 'permanent' : 'temporary'}
                    open={isDesktop ? true : mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            borderRight: '1px solid #f3f4f6',
                            boxShadow: 'none',
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            </Box>

            <Box sx={{ flexGrow: 1, width: { lg: `calc(100% - ${drawerWidth}px)` } }}>
                <AppBar
                    position="sticky"
                    elevation={0}
                    sx={{
                        bgcolor: alpha('#ffffff', 0.8),
                        backdropFilter: 'blur(8px)',
                        borderBottom: '1px solid #f3f4f6',
                        color: 'text.primary',
                    }}
                >
                    <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 4 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {!isDesktop && (
                                <IconButton onClick={handleDrawerToggle} sx={{ mr: 2 }}>
                                    <MenuIcon />
                                </IconButton>
                            )}
                        </Box>

                        {/* Interactive Profile Section */}
                        <Box 
                            onClick={handleProfileClick}
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 2, 
                                cursor: 'pointer',
                                p: 0.5,
                                borderRadius: 2,
                                transition: '0.2s',
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                            }}
                        >
                            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1 }}>
                                    {user?.name || 'Dennis Obota'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                                    {user?.role || 'Administrator'}
                                </Typography>
                            </Box>
                            <Avatar
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Dennis'}`}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    border: '2px solid #fff',
                                    boxShadow: '0 0 0 1px #e5e7eb',
                                }}
                            />
                        </Box>

                        {/* Profile Dropdown Menu */}
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleProfileClose}
                            PaperProps={{
                                elevation: 4,
                                sx: {
                                    mt: 1.5,
                                    minWidth: 180,
                                    borderRadius: 3,
                                    border: '1px solid #f3f4f6',
                                    '& .MuiMenuItem-root': {
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        py: 1,
                                        borderRadius: 1.5,
                                        mx: 0.8,
                                        my: 0.5
                                    },
                                },
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <MenuItem onClick={handleViewProfile}>
                                <MenuIconIcon sx={{ minWidth: '30px !important' }}>
                                    <PersonOutlineIcon fontSize="small" />
                                </MenuIconIcon>
                                My Profile
                            </MenuItem>
                            <Divider sx={{ my: '0.5rem !important', opacity: 0.6 }} />
                            <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f' }}>
                                <MenuIconIcon sx={{ minWidth: '30px !important', color: 'inherit' }}>
                                    <LogoutIcon fontSize="small" />
                                </MenuIconIcon>
                                Logout
                            </MenuItem>
                        </Menu>
                    </Toolbar>
                </AppBar>

                <Box
                    component="main"
                    sx={{
                        p: { xs: 1, sm: 2, md: 1.2 },
                        maxWidth: '1600px',
                        margin: '0 auto',
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
};