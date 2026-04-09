import React from 'react';
import { Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';

export const FILTERS = { ALL: 'all', ACTIVE: 'active', COMPLETED: 'completed' };

export default function FilterBar({ filter, onChange }) {
  return (
    <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={(_, value) => { if (value) onChange(value); }}
        aria-label="Filter tasks"
        size="small"
      >
        <ToggleButton value={FILTERS.ALL}       aria-label="Show all tasks">All</ToggleButton>
        <ToggleButton value={FILTERS.ACTIVE}    aria-label="Show active tasks">Active</ToggleButton>
        <ToggleButton value={FILTERS.COMPLETED} aria-label="Show completed tasks">Completed</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}
