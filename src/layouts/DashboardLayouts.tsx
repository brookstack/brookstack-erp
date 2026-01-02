import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom'; 
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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { navConfig } from './NavConfig';

const drawerWidth = 260;


interface Props {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<Props> = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const location = useLocation(); // Tracks the current active URL
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                    sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'primary.main',
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                    }}
                >
                    B
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.5px' }}>
                    Brookstack
                </Typography>
            </Box>

            <Divider sx={{ borderColor: '#f3f4f6', mx: 2 }} />

            <List sx={{ px: 2, py: 3 }}>
                {navConfig.map((item) => {
                    const isActive = location.pathname === item.path; // Checks if item is active
                    
                    return (
                        <ListItemButton
                            key={item.title}
                            component={NavLink} // Transforms button into a link
                            to={item.path}      // Sets the destination
                            sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                py: 1.2,
                                color: isActive ? 'primary.main' : 'text.secondary',
                                bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                '&.active': { // React Router adds this class automatically
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.main',
                                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                                },
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                    color: 'primary.main',
                                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 38, color: isActive ? 'primary.main' : 'inherit' }}>
                                <Box sx={{ display: 'flex', color: 'inherit' }}>
                                    {item.icon}
                                </Box>
                            </ListItemIcon>
                            <ListItemText
                                primary={item.title}
                                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600, color: "#000"}}
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

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1 }}>
                                    Dennis Obota
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Administrator
                                </Typography>
                            </Box>
                            <Avatar
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Dennis"
                                sx={{
                                    width: 40,
                                    height: 40,
                                    border: '2px solid #fff',
                                    boxShadow: '0 0 0 1px #e5e7eb',
                                }}
                            />
                        </Box>
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