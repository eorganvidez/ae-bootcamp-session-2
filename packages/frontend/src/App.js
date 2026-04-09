import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Divider,
  List,
  Paper,
  Snackbar,
  Typography,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ChecklistIcon from '@mui/icons-material/Checklist';
import TodoForm from './components/TodoForm';
import TodoItem from './components/TodoItem';
import EditTodoDialog from './components/EditTodoDialog';
import FilterBar, { FILTERS } from './components/FilterBar';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    error:   { main: '#d32f2f' },
  },
});

function applyFilter(todos, filter) {
  if (filter === FILTERS.ACTIVE)    return todos.filter((t) => !t.completed);
  if (filter === FILTERS.COMPLETED) return todos.filter((t) => t.completed);
  return todos;
}

function App() {
  const [todos, setTodos]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [filter, setFilter]       = useState(FILTERS.ALL);
  const [editTarget, setEditTarget] = useState(null);
  const [snackbar, setSnackbar]   = useState('');

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/todos');
      if (!res.ok) throw new Error('Failed to load tasks');
      setTodos(await res.json());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  const handleAdd = async (fields) => {
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add task');
      }
      const created = await res.json();
      setTodos((prev) => [...prev, created]);
      setSnackbar('Task added.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggle = async (todo) => {
    try {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (!res.ok) throw new Error('Failed to update task');
      const updated = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveEdit = async (fields) => {
    try {
      const res = await fetch(`/api/todos/${fields.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:    fields.title,
          due_date: fields.due_date,
          notes:    fields.notes,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update task');
      }
      const updated = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditTarget(null);
      setSnackbar('Task updated.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setSnackbar('Task deleted.');
    } catch (err) {
      setError(err.message);
    }
  };

  const visible = applyFilter(todos, filter);

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ bgcolor: 'grey.100', minHeight: '100vh', py: 4 }}>
          <Container maxWidth="sm">
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <ChecklistIcon color="primary" fontSize="large" />
              <Typography variant="h4" component="h1" fontWeight={700}>
                To Do App
              </Typography>
            </Box>

            {/* Error banner */}
            {error && (
              <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Add task form */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" component="h2" gutterBottom>
                Add a new task
              </Typography>
              <TodoForm onAdd={handleAdd} />
            </Paper>

            {/* Filter bar */}
            <FilterBar filter={filter} onChange={setFilter} />

            {/* Task list */}
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" component="h2" gutterBottom>
                Tasks
              </Typography>
              <Divider sx={{ mb: 1 }} />

              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress aria-label="Loading tasks" />
                </Box>
              )}

              {!loading && visible.length === 0 && (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  {filter === FILTERS.ALL
                    ? 'No tasks yet. Add one above to get started.'
                    : `No ${filter} tasks.`}
                </Typography>
              )}

              {!loading && visible.length > 0 && (
                <List disablePadding aria-label="Task list" aria-live="polite">
                  {visible.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={handleToggle}
                      onEdit={setEditTarget}
                      onDelete={handleDelete}
                    />
                  ))}
                </List>
              )}
            </Paper>
          </Container>
        </Box>

        {/* Edit dialog */}
        {editTarget && (
          <EditTodoDialog
            todo={editTarget}
            open={Boolean(editTarget)}
            onClose={() => setEditTarget(null)}
            onSave={handleSaveEdit}
          />
        )}

        {/* Snackbar feedback */}
        <Snackbar
          open={Boolean(snackbar)}
          autoHideDuration={3000}
          onClose={() => setSnackbar('')}
          message={snackbar}
          aria-live="polite"
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;