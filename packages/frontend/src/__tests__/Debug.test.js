import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

const TODO_1 = { id: 1, title: 'Buy milk', completed: false, due_date: null, notes: null, created_at: '2026-01-01T00:00:00.000Z' };
const server = setupServer(
  rest.get('/api/todos', (req, res, ctx) => res(ctx.status(200), ctx.json([TODO_1]))),
);
beforeAll(() => server.listen());
afterAll(() => server.close());

test('debug: inspect checkbox DOM', async () => {
  render(<App />);
  await screen.findByText('Buy milk');

  const allChecks = document.querySelectorAll('[role="checkbox"], input[type="checkbox"]');
  console.log('Checkbox-like elements found:', allChecks.length);
  allChecks.forEach((el, i) => {
    console.log(`El ${i}: tag=${el.tagName} role=${el.getAttribute('role')} aria-label="${el.getAttribute('aria-label')}" aria-checked=${el.getAttribute('aria-checked')} aria-hidden=${el.getAttribute('aria-hidden')}`);
  });
});
