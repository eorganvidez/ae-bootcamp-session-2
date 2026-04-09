const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Use in-memory DB in test environments, file-backed otherwise for persistence
const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : './todos.db';
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    due_date TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Normalise a raw DB row: convert SQLite integer boolean to JS boolean
function normalise(row) {
  return { ...row, completed: row.completed === 1 };
}

// Sort: incomplete first, then earliest due_date, undated last, then newest
const SORT_SQL = `
  ORDER BY
    completed ASC,
    CASE WHEN due_date IS NULL THEN 1 ELSE 0 END ASC,
    due_date ASC,
    created_at DESC
`;

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

// GET /api/todos
app.get('/api/todos', (req, res) => {
  try {
    const todos = db.prepare(`SELECT * FROM todos ${SORT_SQL}`).all();
    res.json(todos.map(normalise));
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// POST /api/todos
app.post('/api/todos', (req, res) => {
  try {
    const { title, due_date, notes } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = db
      .prepare('INSERT INTO todos (title, due_date, notes) VALUES (?, ?, ?)')
      .run(title.trim(), due_date || null, notes || null);

    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(normalise(todo));
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// PUT /api/todos/:id
app.put('/api/todos/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const { title, completed, due_date, notes } = req.body;

    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }

    const updatedTitle    = title     !== undefined ? title.trim()           : existing.title;
    const updatedCompleted = completed !== undefined ? (completed ? 1 : 0)   : existing.completed;
    const updatedDueDate  = due_date  !== undefined ? (due_date || null)     : existing.due_date;
    const updatedNotes    = notes     !== undefined ? (notes || null)        : existing.notes;

    db.prepare(
      'UPDATE todos SET title = ?, completed = ?, due_date = ?, notes = ? WHERE id = ?'
    ).run(updatedTitle, updatedCompleted, updatedDueDate, updatedNotes, id);

    const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.json(normalise(updated));
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// DELETE /api/todos/:id
app.delete('/api/todos/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    db.prepare('DELETE FROM todos WHERE id = ?').run(id);
    res.json({ message: 'Todo deleted successfully', id });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

module.exports = { app, db };