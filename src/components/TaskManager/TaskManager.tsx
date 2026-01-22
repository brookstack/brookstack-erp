import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, TextField, IconButton, Stack, 
  Chip, Checkbox, LinearProgress, alpha, Tooltip, Menu, MenuItem 
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EngineeringIcon from '@mui/icons-material/Engineering';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

const RUST = '#b52841';
const DARK_NAVY = '#1a202c';
const SUCCESS_GREEN = '#10b981';
const AMBER = '#f59e0b';

interface DailyTask {
  id: string;
  text: string;
  category: 'critical' | 'feature' | 'maintenance';
  status: 'pending' | 'completed' | 'blocked';
}

export const DailySprint = () => {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [category, setCategory] = useState<DailyTask['category']>('feature');

  // Velocity Calculation
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const velocity = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const addTask = () => {
    if (!inputValue.trim()) return;
    const newTask: DailyTask = {
      id: Date.now().toString(),
      text: inputValue,
      category: category,
      status: 'pending'
    };
    setTasks([...tasks, newTask]);
    setInputValue('');
  };

  const toggleStatus = (id: string, nextStatus: DailyTask['status']) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: nextStatus } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <Paper sx={{ p: 3, borderRadius: '24px', border: '1px solid #f1f1f1', bgcolor: '#fff' }}>
      {/* Header & Velocity */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography sx={{ fontWeight: 900, color: DARK_NAVY, fontSize: '1.2rem' }}>Daily Sprint</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right', minWidth: 100 }}>
          <Typography sx={{ fontWeight: 800, color: RUST, fontSize: '0.8rem' }}>VELOCITY: {Math.round(velocity)}%</Typography>
          <LinearProgress 
            variant="determinate" 
            value={velocity} 
            sx={{ height: 6, borderRadius: 3, bgcolor: alpha(RUST, 0.1), '& .MuiLinearProgress-bar': { bgcolor: RUST } }} 
          />
        </Box>
      </Stack>

      {/* Quick Add Input */}
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <TextField 
          fullWidth 
          size="small" 
          placeholder="What's the goal for this hour?" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#f8fafc' } }}
        />
        <IconButton onClick={addTask} sx={{ color: RUST }}>
          <AddCircleIcon fontSize="large" />
        </IconButton>
      </Stack>

      {/* Category Toggles */}
      <Stack direction="row" spacing={1} mb={3}>
        {(['critical', 'feature', 'maintenance'] as const).map((cat) => (
          <Chip 
            key={cat}
            label={cat.toUpperCase()} 
            onClick={() => setCategory(cat)}
            sx={{ 
              fontSize: '0.6rem', 
              fontWeight: 800, 
              cursor: 'pointer',
              bgcolor: category === cat ? alpha(DARK_NAVY, 0.9) : alpha(DARK_NAVY, 0.05),
              color: category === cat ? '#fff' : DARK_NAVY,
              '&:hover': { bgcolor: DARK_NAVY, color: '#fff' }
            }} 
          />
        ))}
      </Stack>

      {/* Task List */}
      <Stack spacing={1.5}>
        {tasks.length === 0 && (
          <Box sx={{ py: 4, textAlign: 'center', opacity: 0.5 }}>
            <RocketLaunchIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="body2">No active tasks. Start your sprint.</Typography>
          </Box>
        )}
        {tasks.map((task) => (
          <TaskItem 
            key={task.id} 
            task={task} 
            onStatusUpdate={toggleStatus} 
            onDelete={deleteTask}
          />
        ))}
      </Stack>
    </Paper>
  );
};

// Helper Component for Individual Tasks
const TaskItem = ({ task, onStatusUpdate, onDelete }: { task: DailyTask, onStatusUpdate: any, onDelete: any }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const isDone = task.status === 'completed';
  const isBlocked = task.status === 'blocked';

  const getCatIcon = () => {
    if (task.category === 'critical') return <Box sx={{ w: 8, h: 8, bgcolor: RUST, borderRadius: '50%', mr: 1 }} />;
    if (task.category === 'feature') return <RocketLaunchIcon sx={{ fontSize: '1rem', mr: 1, color: SUCCESS_GREEN }} />;
    return <EngineeringIcon sx={{ fontSize: '1rem', mr: 1, color: AMBER }} />;
  };

  return (
    <Box sx={{ 
      p: 1.5, 
      borderRadius: '16px', 
      display: 'flex', 
      alignItems: 'center',
      bgcolor: isDone ? alpha(SUCCESS_GREEN, 0.05) : '#fff',
      border: '1px solid',
      borderColor: isDone ? alpha(SUCCESS_GREEN, 0.2) : '#f1f5f9',
      transition: '0.2s',
      opacity: isBlocked ? 0.7 : 1
    }}>
      <Checkbox 
        checked={isDone}
        onChange={() => onStatusUpdate(task.id, isDone ? 'pending' : 'completed')}
        sx={{ color: '#cbd5e1', '&.Mui-checked': { color: SUCCESS_GREEN } }}
      />
      
      <Box sx={{ flexGrow: 1, ml: 1 }}>
        <Stack direction="row" alignItems="center">
          {getCatIcon()}
          <Typography sx={{ 
            fontSize: '0.85rem', 
            fontWeight: 700, 
            color: DARK_NAVY,
            textDecoration: isDone ? 'line-through' : 'none',
            opacity: isDone ? 0.5 : 1
          }}>
            {task.text}
          </Typography>
        </Stack>
      </Box>

      {isBlocked && (
        <Chip label="BLOCKED" size="small" sx={{ height: 18, fontSize: '0.55rem', bgcolor: alpha(RUST, 0.1), color: RUST, fontWeight: 900, mr: 1 }} />
      )}

      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => { onStatusUpdate(task.id, 'blocked'); setAnchorEl(null); }}>
          <BlockIcon sx={{ fontSize: '1rem', mr: 1, color: AMBER }} /> Blocked
        </MenuItem>
        <MenuItem onClick={() => { onDelete(task.id); setAnchorEl(null); }} sx={{ color: RUST }}>
          Delete Task
        </MenuItem>
      </Menu>
    </Box>
  );
};