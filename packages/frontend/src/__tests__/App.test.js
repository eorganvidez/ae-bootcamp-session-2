import React, { act } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

// ─── Fixtures ────────────────────────────────────────────────────────────────
const TODO_1 = { id: 1, title: 'Buy milk', completed: false, due_date: null,         notes: null, created_at: '2026-01-01T00:00:00.000Z' };
const TODO_2 = { id: 2, title: 'Write tests', completed: true,  due_date: '2026-03-01', notes: 'important', created_at: '2026-01-02T00:00:00.000Z' };
const TODO_OVERDUE = { id: 3, title: 'Overdue task', completed: false, due_date: '2020-01-01', notes: null, created_at: '2026-01-03T00:00:00.000Z' };

// ─── Mock Server ─────────────────────────────────────────────────────────────
let serverTodos = [TODO_1, TODO_2];

const server = setupServer(
  rest.get('/api/todos', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(serverTodos))
  ),
  rest.post('/api/todos', (req, res, ctx) => {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res(ctx.status(400), ctx.json({ error: 'Title is required' }));
    }
    const created = { id: 99, title: title.trim(), completed: false, due_date: req.body.due_date ?? null, notes: req.body.notes ?? null, created_at: new Date().toISOString() };
    return res(ctx.status(201), ctx.json(created));
  }),
  rest.put('/api/todos/:id', (req, res, ctx) => {
    const id = parseInt(req.params.id, 10);
    const todo = serverTodos.find((t) => t.id === id);
    if (!todo) return res(ctx.status(404), ctx.json({ error: 'Not found' }));
    const updated = { ...todo, ...req.body, completed: req.body.completed ?? todo.completed };
    return res(ctx.status(200), ctx.json(updated));
  }),
  rest.delete('/api/todos/:id', (req, res, ctx) => {
    const id = parseInt(req.params.id, 10);
    serverTodos = serverTodos.filter((t) => t.id !== id);
    return res(ctx.status(200), ctx.json({ message: 'Todo deleted successfully', id }));
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  serverTodos = [TODO_1, TODO_2];
});
afterAll(() => server.close());

// ─── Helpers ─────────────────────────────────────────────────────────────────
const renderApp = async () => {
  await act(async () => { render(<App />); });
  await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('App', () => {
  test('displays fetched todos and page heading', async () => {
    await renderApp();
    expect(screen.getByRole('heading', { name: /to do app/i })).toBeInTheDocument();
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(screen.getByText('Write tests')).toBeInTheDocument();
  });

  test('shows a loading spinner then hides it after fetch', async () => {
    render(<App />);
    // Spinner must appear synchronously before the async fetch completes
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
  });

  test('shows empty state when no tasks exist', async () => {
    serverTodos = [];
    await renderApp();
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  test('shows an error alert when the API fails', async () => {
    server.use(rest.get('/api/todos', (req, res, ctx) => res(ctx.status(500))));
    await renderApp();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('adds a new task', async () => {
    const user = userEvent.setup();
    await renderApp();
    await user.type(screen.getByLabelText(/task title/i), 'New task');
    await user.click(screen.getByRole('button', { name: /add task/i }));
    await waitFor(() => expect(screen.getByText('New task')).toBeInTheDocument());
  });

  test('shows validation error when submitting empty title', async () => {
    const user = userEvent.setup();
    await renderApp();
    await user.click(screen.getByRole('button', { name: /add task/i }));
    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
  });

  test('toggles a task from incomplete to complete', async () => {
    const user = userEvent.setup();
    serverTodos = [TODO_1];
    await renderApp();
    // Use findBy to retry until the list has rendered (avoids timing sensitivity)
    const checkbox = await screen.findByRole('checkbox', { name: /mark "Buy milk"/i });
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    await waitFor(() => expect(checkbox).toBeChecked());
  });

  test('deletes a task', async () => {
    const user = userEvent.setup();
    await renderApp();
    const deleteBtn = screen.getByRole('button', { name: /delete task: buy milk/i });
    await user.click(deleteBtn);
    await waitFor(() => expect(screen.queryByText('Buy milk')).not.toBeInTheDocument());
  });

  test('filter Active shows only incomplete tasks', async () => {
    await renderApp();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /show active tasks/i }));
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(screen.queryByText('Write tests')).not.toBeInTheDocument();
  });

  test('filter Completed shows only completed tasks', async () => {
    await renderApp();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /show completed tasks/i }));
    expect(screen.queryByText('Buy milk')).not.toBeInTheDocument();
    expect(screen.getByText('Write tests')).toBeInTheDocument();
  });

  test('displays overdue chip for an overdue incomplete task', async () => {
    serverTodos = [TODO_OVERDUE];
    await renderApp();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  test('does not show overdue chip for a completed task past due date', async () => {
    serverTodos = [{ ...TODO_OVERDUE, completed: true }];
    await renderApp();
    expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
  });

  test('opens and saves the edit dialog', async () => {
    const user = userEvent.setup();
    await renderApp();
    await user.click(screen.getByRole('button', { name: /edit task: buy milk/i }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByDisplayValue('Buy milk')).toBeInTheDocument();
    const titleInput = within(dialog).getByLabelText(/task title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Buy oat milk');
    await user.click(within(dialog).getByRole('button', { name: /save/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('Buy oat milk')).toBeInTheDocument();
  });
});
