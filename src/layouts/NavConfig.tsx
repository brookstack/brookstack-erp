import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined'; // Modern for Customers/Network
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined'; // Technical for Projects
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'; // Modern Billing
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'; // Clean Payments
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined'; // "Staff" as "Human Capital/Intellect"

export const navConfig = [
  { 
    title: 'Dashboard', 
    path: '/', 
    icon: <DashboardOutlinedIcon fontSize="small" /> 
  },
  { 
    title: 'Customers', 
    path: '/customers', 
    icon: <HubOutlinedIcon fontSize="small" /> // Represents your client ecosystem
  },
  { 
    title: 'Billing & Invoices', 
    path: '/billing', 
    icon: <AccountBalanceWalletOutlinedIcon fontSize="small" /> // Represents the ledger
  },
  { 
    title: 'Payments', 
    path: '/payments', 
    icon: <PaymentsOutlinedIcon fontSize="small" /> // Represents cash flow
  },
   { 
    title: 'Projects', 
    path: '/projects', 
    icon: <TerminalOutlinedIcon fontSize="small" /> // Represents development and IT
  }, 
  { 
    title: 'Staff Management', 
    path: '/staff', 
    icon: <PsychologyOutlinedIcon fontSize="small" /> // Modern tech icon for "Engineering Brainpower"
  }, 
];