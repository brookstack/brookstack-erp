import {
  Box,
  Typography,
  Paper, Grid
} from '@mui/material';
import {
  PersonAddAlt1Outlined as PersonAddIcon,
  HistoryOutlined as HistoryIcon,
  CorporateFareOutlined as CorporateFareIcon,
  Add as AddIcon
} from '@mui/icons-material';

// 1. Store the component references, not the rendered <JSX />
const actions = [
  { label: 'Manage Users', Icon: PersonAddIcon, color: '#198754', bgColor: '#e8f5e9' },
  { label: 'Manage Groups', Icon: AddIcon, color: '#6f42c1', bgColor: '#f3e5f5' },
  { label: 'Audit Logs', Icon: HistoryIcon, color: '#198754', bgColor: '#e8f5e9' },
  { label: 'Manage Organizations', Icon: CorporateFareIcon, color: '#3a57e8', bgColor: '#e3f2fd' },
];

export const QuickActions = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '12px',
        border: '1px solid #f1f1f1',
        bgcolor: 'white'
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#232d42' }}>
        Quick Actions
      </Typography>

      <Grid container spacing={2}>
        {actions.map((action) => {
          // 2. Extract the Component (Note the capital 'I' in Icon)
          const IconComponent = action.Icon;

          return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={action.label}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: '#f8f9fa',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: '0.2s',
                  '&:hover': { bgcolor: '#f1f1f1' }
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    bgcolor: action.bgColor,
                    color: action.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    flexShrink: 0
                  }}
                >
                  {/* 3. Render the component normally with sx props */}
                  <IconComponent sx={{ fontSize: '1.2rem' }} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#232d42' }}>
                  {action.label}
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};