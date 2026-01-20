import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'; // Better for Customers
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined'; 
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'; 
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'; 
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'; // Better for Expenses
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'; // Better for Tasks

export const navConfig = [
  {
    title: 'Dashboard',
    path: '/',
    icon: <DashboardOutlinedIcon fontSize="small" />
  },
  {
    title: 'Customers',
    path: '/customers',
    icon: <GroupsOutlinedIcon fontSize="small" /> 
  },
  {
    title: 'Billing & Invoices',
    path: '/billing',
    icon: <AccountBalanceWalletOutlinedIcon fontSize="small" /> 
  },
  {
    title: 'Payments',
    path: '/payments',
    icon: <PaymentsOutlinedIcon fontSize="small" />
  },
  {
    title: 'Projects',
    path: '/projects',
    icon: <TerminalOutlinedIcon fontSize="small" /> 
  },
  {
    title: 'Expenses',
    path: '/expenses',
    icon: <ReceiptLongOutlinedIcon fontSize="small" /> 
  },
  { 
    title: 'Tasks', 
    path: '/tasks', 
    icon: <AssignmentOutlinedIcon fontSize="small" /> 
  }, 
  {
    title: 'Staff Management',
    path: '/staff',
    icon: <PsychologyOutlinedIcon fontSize="small" /> 
  },
];