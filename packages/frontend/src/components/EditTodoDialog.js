import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

export default function EditTodoDialog({ todo, open, onClose, onSave }) {
  const [title, setTitle]       = useState(todo?.title ?? '');
  const [dueDate, setDueDate]   = useState(todo?.due_date ? dayjs(todo.due_date) : null);
  const [notes, setNotes]       = useState(todo?.notes ?? '');
  const [titleError, setTitleError] = useState('');

  // Reset form when the dialog opens with a new todo
  React.useEffect(() => {
    if (open && todo) {
      setTitle(todo.title);
      setDueDate(todo.due_date ? dayjs(todo.due_date) : null);
      setNotes(todo.notes ?? '');
      setTitleError('');
    }
  }, [open, todo]);

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError('Title is required.');
      return;
    }
    onSave({
      ...todo,
      title: title.trim(),
      due_date: dueDate ? dayjs(dueDate).format('YYYY-MM-DD') : null,
      notes: notes.trim() || null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="edit-dialog-title">
      <DialogTitle id="edit-dialog-title">Edit task</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
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
            autoFocus
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
            helperText=" "
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}
