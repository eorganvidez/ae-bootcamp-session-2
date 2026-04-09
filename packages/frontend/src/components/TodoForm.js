import React, { useState } from 'react';
import {
  Box,
  Button,
  Stack,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

export default function TodoForm({ onAdd }) {
  const [title, setTitle]       = useState('');
  const [dueDate, setDueDate]   = useState(null);
  const [notes, setNotes]       = useState('');
  const [titleError, setTitleError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('Title is required.');
      return;
    }
    onAdd({
      title: title.trim(),
      due_date: dueDate ? dayjs(dueDate).format('YYYY-MM-DD') : null,
      notes: notes.trim() || null,
    });
    setTitle('');
    setDueDate(null);
    setNotes('');
    setTitleError('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        <TextField
          label="Task title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (e.target.value.trim()) setTitleError('');
          }}
          error={Boolean(titleError)}
          helperText={titleError || ' '}
          required
          fullWidth
          inputProps={{ 'aria-label': 'Task title' }}
        />
        <DatePicker
          label="Due date (optional)"
          value={dueDate}
          onChange={setDueDate}
          slotProps={{ textField: { fullWidth: true, helperText: ' ' } }}
        />
        <TextField
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          rows={2}
          fullWidth
          inputProps={{ 'aria-label': 'Notes' }}
          helperText=" "
        />
        <Button
          type="submit"
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
          sx={{ alignSelf: 'flex-start' }}
        >
          Add task
        </Button>
      </Stack>
    </Box>
  );
}
