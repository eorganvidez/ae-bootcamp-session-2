const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

// Each test uses a fresh TodoPage instance and navigates to the app.
// The backend is file-backed so we clean up tasks created during tests.
// Tests are designed to be runnable independently: each creates its own data.

test.describe('TODO app — critical user journeys', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  // ── Journey 1: Create a new task ──────────────────────────────────────────
  test('user can create a new task and see it in the list', async () => {
    const title = `E2E task ${Date.now()}`;
    await todoPage.addTask(title);
    await expect(todoPage.getTaskItem(title)).toBeVisible();
  });

  // ── Journey 2: Empty title validation ─────────────────────────────────────
  test('user cannot create a task with an empty title', async () => {
    await todoPage.addButton.click();
    await expect(todoPage.page.getByText(/title is required/i)).toBeVisible();
  });

  // ── Journey 3: Mark task as complete ──────────────────────────────────────
  test('user can mark a task as complete', async () => {
    const title = `Complete me ${Date.now()}`;
    await todoPage.addTask(title);
    const checkbox = todoPage.getCheckboxFor(title);
    await expect(checkbox).not.toBeChecked();
    await todoPage.toggleTask(title);
    await expect(checkbox).toBeChecked();
  });

  // ── Journey 4: Edit a task ────────────────────────────────────────────────
  test('user can edit the title of an existing task', async () => {
    const original = `Edit me ${Date.now()}`;
    const updated  = `Edited ${Date.now()}`;
    await todoPage.addTask(original);
    await todoPage.editTask(original, { title: updated });
    await expect(todoPage.getTaskItem(updated)).toBeVisible();
    await expect(todoPage.page.getByText(original)).not.toBeVisible();
  });

  // ── Journey 5: Delete a task ──────────────────────────────────────────────
  test('user can delete a task and it disappears from the list', async () => {
    const title = `Delete me ${Date.now()}`;
    await todoPage.addTask(title);
    await expect(todoPage.getTaskItem(title)).toBeVisible();
    await todoPage.deleteTask(title);
    await expect(todoPage.page.getByText(title)).not.toBeVisible();
  });

  // ── Journey 6: Filter active and completed tasks ──────────────────────────
  test('user can filter tasks by active and completed', async () => {
    const activeTitle    = `Active ${Date.now()}`;
    const completedTitle = `Completed ${Date.now()}`;

    await todoPage.addTask(activeTitle);
    await todoPage.addTask(completedTitle);
    await todoPage.toggleTask(completedTitle);

    // Active filter
    await todoPage.filterActive.click();
    await expect(todoPage.getTaskItem(activeTitle)).toBeVisible();
    await expect(todoPage.page.getByText(completedTitle)).not.toBeVisible();

    // Completed filter
    await todoPage.filterCompleted.click();
    await expect(todoPage.page.getByText(activeTitle)).not.toBeVisible();
    await expect(todoPage.getTaskItem(completedTitle)).toBeVisible();

    // All filter restores both
    await todoPage.filterAll.click();
    await expect(todoPage.getTaskItem(activeTitle)).toBeVisible();
    await expect(todoPage.getTaskItem(completedTitle)).toBeVisible();
  });

  // ── Journey 7: Overdue indicator ─────────────────────────────────────────
  test('overdue incomplete task shows an Overdue chip', async ({ page }) => {
    // Seed an overdue task directly via the API to avoid date-picker complexity
    const res = await page.request.post('http://localhost:3030/api/todos', {
      data: { title: `Overdue ${Date.now()}`, due_date: '2020-01-01' },
    });
    expect(res.ok()).toBeTruthy();
    const { title } = await res.json();

    await todoPage.goto();
    await expect(todoPage.page.getByText('Overdue').first()).toBeVisible();

    // Clean up
    const list = await page.request.get('http://localhost:3030/api/todos');
    const todos = await list.json();
    const created = todos.find((t) => t.title === title);
    if (created) await page.request.delete(`http://localhost:3030/api/todos/${created.id}`);
  });

  // ── Journey 8: Tasks persist after page reload ────────────────────────────
  test('tasks are still present after the page is reloaded', async ({ page }) => {
    const title = `Persist me ${Date.now()}`;
    await todoPage.addTask(title);
    await expect(todoPage.getTaskItem(title)).toBeVisible();

    await page.reload();
    await expect(page.getByRole('progressbar')).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText(title)).toBeVisible();

    // Clean up
    const list = await page.request.get('http://localhost:3030/api/todos');
    const todos = await list.json();
    const created = todos.find((t) => t.title === title);
    if (created) await page.request.delete(`http://localhost:3030/api/todos/${created.id}`);
  });
});
