import { useState } from 'react';
import { TextField, MenuItem, Button, Stack } from '@mui/material';

export const AddTaskForm = ({ initialData, onSuccess }: any) => {
    const [formData, setFormData] = useState(initialData || {
        task_name: '',
        category: 'Technical',
        due_date: new Date().toISOString().split('T')[0],
    });

    return (
        <Stack spacing={3} sx={{ py: 1 }}>
            <TextField
                fullWidth label="Task Description"
                multiline rows={3}
                value={formData.task_name}
                onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
                required
            />
            <TextField
                fullWidth select label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
                {['Technical', 'Business', 'Meeting', 'Other'].map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
            </TextField>
            <TextField
                fullWidth type="date" label="Due Date"
                InputLabelProps={{ shrink: true }}
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
            <Button 
                fullWidth onClick={() => onSuccess(formData)}
                variant="contained" sx={{ bgcolor: '#b52841', py: 1.5, fontWeight: 700 }}
            >
                Save Changes
            </Button>
        </Stack>
    );
};