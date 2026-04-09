import React from 'react';
import {
  Box,
  Checkbox,
  Chip,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import dayjs from 'dayjs';

function isOverdue(todo) {
  if (!todo.due_date || todo.completed) return false;
  return dayjs(todo.due_date).isBefore(dayjs(), 'day');
}

function formatDate(dateString) {
  if (!dateString) return null;
  return dayjs(dateString).format('MMM D, YYYY');
}

export default function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const overdue = isOverdue(todo);

  return (
    <ListItem
      alignItems="flex-start"
      disableGutters
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        opacity: todo.completed ? 0.6 : 1,
        py: 1.5,
      }}
      secondaryAction={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit task">
            <IconButton
              aria-label={`Edit task: ${todo.title}`}
              onClick={() => onEdit(todo)}
              size="small"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete task">
            <IconButton
              aria-label={`Delete task: ${todo.title}`}
              onClick={() => onDelete(todo.id)}
              size="small"
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      }
    >
      <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
        <Checkbox
          checked={todo.completed}
          onChange={() => onToggle(todo)}
          slotProps={{
            input: { 'aria-label': `Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}` },
          }}
        />
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography
            variant="body1"
            sx={{
              textDecoration: todo.completed ? 'line-through' : 'none',
              fontWeight: 500,
            }}
          >
            {todo.title}
          </Typography>
        }
        secondary={
          <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
            {todo.due_date && (
              <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color={overdue ? 'error' : 'text.secondary'}>
                  Due: {formatDate(todo.due_date)}
                </Typography>
                {overdue && (
                  <Chip label="Overdue" color="error" size="small" />
                )}
              </Box>
            )}
            {todo.notes && (
              <Typography variant="caption" color="text.secondary">
                {todo.notes}
              </Typography>
            )}
          </Box>
        }
      />
    </ListItem>
  );
}
