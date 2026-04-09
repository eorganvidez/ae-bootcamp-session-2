const { expect } = require('@playwright/test');

class TodoPage {
  constructor(page) {
    this.page = page;

    // Form
    this.titleInput    = page.getByLabel('Task title');
    this.addButton     = page.getByRole('button', { name: /add task/i });

    // Filters
    this.filterAll       = page.getByRole('button', { name: /show all tasks/i });
    this.filterActive    = page.getByRole('button', { name: /show active tasks/i });
    this.filterCompleted = page.getByRole('button', { name: /show completed tasks/i });

    // Task list
    this.taskList = page.getByRole('list', { name: /task list/i });
  }

  async goto() {
    await this.page.goto('/');
    // Wait for loading spinner to disappear
    await expect(this.page.getByRole('progressbar')).not.toBeVisible({ timeout: 10000 });
  }

  async addTask(title, { dueDate, notes } = {}) {
    await this.titleInput.fill(title);
    if (dueDate) {
      await this.page.getByLabel(/due date/i).fill(dueDate);
    }
    if (notes) {
      await this.page.getByLabel(/notes/i).fill(notes);
    }
    await this.addButton.click();
  }

  getTaskItem(title) {
    return this.taskList.getByText(title);
  }

  getCheckboxFor(title) {
    return this.page.getByRole('checkbox', { name: new RegExp(`mark "${title}"`, 'i') });
  }

  getEditButtonFor(title) {
    return this.page.getByRole('button', { name: new RegExp(`edit task: ${title}`, 'i') });
  }

  getDeleteButtonFor(title) {
    return this.page.getByRole('button', { name: new RegExp(`delete task: ${title}`, 'i') });
  }

  async editTask(currentTitle, { title, notes } = {}) {
    await this.getEditButtonFor(currentTitle).click();
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    if (title !== undefined) {
      const titleField = dialog.getByLabel(/task title/i);
      await titleField.clear();
      await titleField.fill(title);
    }
    if (notes !== undefined) {
      const notesField = dialog.getByLabel(/notes/i);
      await notesField.clear();
      await notesField.fill(notes);
    }
    await dialog.getByRole('button', { name: /save/i }).click();
    await expect(dialog).not.toBeVisible();
  }

  async deleteTask(title) {
    await this.getDeleteButtonFor(title).click();
  }

  async toggleTask(title) {
    await this.getCheckboxFor(title).click();
  }
}

module.exports = { TodoPage };
