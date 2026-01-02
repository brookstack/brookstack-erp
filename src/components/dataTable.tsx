import React, { useState, useMemo } from 'react'; // Added useMemo for performance
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Box, Typography, Pagination, Paper,
  Select, MenuItem, Button, Stack, TextField, InputAdornment, alpha,
  useMediaQuery, useTheme, Divider
} from '@mui/material';
import { 
  ModeEditOutlineOutlined as EditIcon, 
  DeleteOutlineOutlined as DeleteIcon, 
  VisibilityOutlined as ViewIcon,
  Search as SearchIcon,
  Add as AddIcon
} from '@mui/icons-material';

const RUST_COLOR = '#b7410e';
const RUST_HOVER = '#a0360d';

interface Column {
  id: string;
  label: string;
  render?: (row: any) => React.ReactNode;
}

interface DataTableProps {
  title?: string;
  columns: Column[];
  data: any[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  primaryAction?: { label: string; onClick: () => void };
}

export const DataTable: React.FC<DataTableProps> = ({ 
  title, columns, data, onView, onEdit, onDelete, primaryAction 
}) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState(''); // New search state
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // 1. Filter the data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter((row) => 
      Object.values(row).some((value) => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // 2. Perform pagination on the FILTERED data
  const startIndex = (page - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Reset page to 1 when searching
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  return (
    <Box sx={{ width: '100%', px: 0.5 }}>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }} 
        spacing={2} 
        sx={{ mb: 3, px: 0.5 }}
      >
        {title && <Typography variant="h5" sx={{ fontWeight: 700, color: '#232d42' }}>{title}</Typography>}
        
        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <TextField 
            size="small" 
            placeholder="Search..."
            value={searchTerm} // Controlled input
            onChange={handleSearchChange} // Trigger search
            InputProps={{ 
                startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>),
                sx: { borderRadius: 1, bgcolor: 'white' }
            }}
            sx={{ flexGrow: { xs: 1, sm: 0 }, width: { sm: 220 } }}
          />
          {primaryAction && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={primaryAction.onClick} 
              sx={{ 
                borderRadius: 1, 
                textTransform: 'none', 
                boxShadow: 'none',
                bgcolor: RUST_COLOR,
                '&:hover': { bgcolor: RUST_HOVER }
              }}
            >
              {primaryAction.label}
            </Button>
          )}
        </Stack>
      </Stack>

      {!isMobile ? (
        <Paper 
          elevation={0} 
          sx={{ 
            width: '100%', 
            border: '1px solid #f1f1f1', 
            borderRadius: '12px', 
            overflow: 'hidden' 
          }}
        >
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table stickyHeader sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell 
                      key={col.id} 
                      sx={{ color: '#8a92a6', fontWeight: 700, fontSize: '0.75rem', borderBottom: '1px solid #f1f1f1', textTransform: 'uppercase', py: 2.5, px: 3, bgcolor: 'white', whiteSpace: 'nowrap' }}
                    >
                      {col.label}
                    </TableCell>
                  ))}
                  <TableCell align="right" sx={{ color: '#8a92a6', fontWeight: 700, fontSize: '0.75rem', borderBottom: '1px solid #f1f1f1', bgcolor: 'white', px: 3 }}>
                    ACTIONS
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row) => (
                    <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: alpha('#f3f4f6', 0.5) } }}>
                      {columns.map((col) => (
                        <TableCell key={col.id} sx={{ color: '#232d42', fontSize: '0.875rem', py: 2, px: 3, borderBottom: '1px solid #f8f9fa', whiteSpace: 'nowrap' }}>
                          {col.render ? col.render(row) : row[col.id]}
                        </TableCell>
                      ))}
                      <TableCell align="right" sx={{ borderBottom: '1px solid #f8f9fa', px: 3 }}>
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <IconButton size="small" onClick={() => onView?.(row.id)} sx={{ color: '#8a92a6' }}><ViewIcon sx={{ fontSize: '1.2rem' }} /></IconButton>
                          <IconButton size="small" onClick={() => onEdit?.(row.id)} sx={{ color: '#8a92a6' }}><EditIcon sx={{ fontSize: '1.2rem' }} /></IconButton>
                          <IconButton size="small" onClick={() => onDelete?.(row.id)} sx={{ color: '#8a92a6' }}><DeleteIcon sx={{ fontSize: '1.2rem' }} /></IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 10 }}>
                      <Typography variant="body1" color="textSecondary">No results found for "{searchTerm}"</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        /* Mobile View - logic update to use paginatedData */
        <Stack spacing={2}>
           {paginatedData.length > 0 ? (
             paginatedData.map((row) => (
               <Paper key={row.id} elevation={0} sx={{ p: 2, border: '1px solid #f1f1f1', borderRadius: '12px' }}>
                 {columns.map((col) => (
                   <Box key={col.id} sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                     <Typography variant="caption" sx={{ color: '#8a92a6', fontWeight: 700, textTransform: 'uppercase', mr: 2 }}>{col.label}</Typography>
                     <Typography variant="body2" sx={{ color: '#232d42', fontWeight: 500, textAlign: 'right' }}>{col.render ? col.render(row) : row[col.id]}</Typography>
                   </Box>
                 ))}
                 <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
                 <Stack direction="row" justifyContent="flex-end" spacing={1}>
                    <Button size="small" startIcon={<ViewIcon />} onClick={() => onView?.(row.id)} sx={{ color: '#8a92a6', textTransform: 'none' }}>View</Button>
                    <Button size="small" startIcon={<EditIcon />} onClick={() => onEdit?.(row.id)} sx={{ color: '#232d42', textTransform: 'none' }}>Edit</Button>
                    <Button size="small" startIcon={<DeleteIcon />} onClick={() => onDelete?.(row.id)} color="error" sx={{ textTransform: 'none' }}>Delete</Button>
                 </Stack>
               </Paper>
             ))
           ) : (
             <Typography align="center" sx={{ py: 4 }}>No results found.</Typography>
           )}
        </Stack>
      )}

      {/* Footer Section - showing counts for filteredData */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems="center" 
        sx={{ py: 3, px: 1 }}
        spacing={2}
      >
        <Typography variant="body2" sx={{ color: '#232d42', fontWeight: 500 }}>
          Showing {filteredData.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + rowsPerPage, filteredData.length)} of {filteredData.length}
        </Typography>
        
        <Stack direction="row" spacing={{ xs: 1, sm: 4 }} alignItems="center">
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: '#8a92a6' }}>Per page:</Typography>
              <Select 
                size="small" 
                value={rowsPerPage} 
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }} 
                sx={{ height: 36, borderRadius: 2, minWidth: 70 }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
              </Select>
            </Box>
          )}
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={(_, val) => setPage(val)} 
            variant="outlined" 
            shape="rounded" 
            size={isMobile ? "small" : "medium"}
            sx={{
              '& .MuiPaginationItem-root': { borderRadius: '8px' },
              '& .Mui-selected': { 
                bgcolor: `${RUST_COLOR} !important`, 
                color: 'white', 
                border: 'none',
                '&:hover': { bgcolor: `${RUST_HOVER} !important` }
              }
            }}
          />
        </Stack>
      </Stack>
    </Box>
  );
};