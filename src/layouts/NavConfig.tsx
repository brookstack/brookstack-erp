import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BadgeIcon from '@mui/icons-material/Badge';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

export const navConfig = [
  { title: 'Dashboard', path: '/', icon: <DashboardIcon fontSize="small" />  },
  { title: 'Customers', path: '/customers', icon: <PeopleIcon fontSize="small" /> },
  { title: 'Billing & Invoices', path: '/billing', icon: <ReceiptIcon fontSize="small" /> },
  { title: 'Payments', path: '/payments', icon: <AccountBalanceIcon fontSize="small" /> },
  { title: 'Staff Management', path: '/staff', icon: <BadgeIcon fontSize="small" /> }, 
];