const request = require('supertest');
const { app, db } = require('../src/app');

afterAll(() => {
  if (db) db.close();
});

// Helper: create a todo and return the body
const createTodo = async (fields = {}) => {
  const payload = { title: 'Test Todo', ...fields };
  const response = await request(app)
    .post('/api/todos')
    .send(payload)
    .set('Accept', 'application/json');
  expect(response.status).toBe(201);
  return response.body;
};

describe('Health check', () => {
  it('GET / returns ok', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});

describe('GET /api/todos', () => {
  it('returns an array of todos', async () => {
    await createTodo({ title: 'Sort test todo' });
    const response = await request(app).get('/api/todos');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('todo items have the expected shape', async () => {
    await createTodo({ title: 'Shape test', due_date: '2026-12-01', notes: 'some notes' });
    const response = await request(app).get('/api/todos');
    const todo = response.body[0];
    expect(todo).toHaveProperty('id');
    expect(todo).toHaveProperty('title');
    expect(todo).toHaveProperty('completed');
    expect(todo).toHaveProperty('due_date');
    expect(todo).toHaveProperty('notes');
    expect(todo).toHaveProperty('created_at');
    expect(typeof todo.completed).toBe('boolean');
  });

  it('incomplete todos appear before completed ones', async () => {
    const a = await createTodo({ title: 'Incomplete' });
    const b = await createTodo({ title: 'Complete me' });
    await request(app).put(`/api/todos/${b.id}`).send({ completed: true });

    const response = await request(app).get('/api/todos');
    const ids = response.body.map((t) => t.id);
    expect(ids.indexOf(a.id)).toBeLessThan(ids.indexOf(b.id));
  });
});

describe('POST /api/todos', () => {
  it('creates a new todo and returns 201', async () => {
    const response = await request(app)
      .post('/api/todos')
      .send({ title: 'Buy milk', due_date: '2026-06-01', notes: 'skimmed' });
    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Buy milk');
    expect(response.body.due_date).toBe('2026-06-01');
    expect(response.body.notes).toBe('skimmed');
    expect(response.body.completed).toBe(false);
  });

  it('returns 400 when title is missing', async () => {
    const response = await request(app).post('/api/todos').send({});
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Title is required');
  });

  it('returns 400 when title is blank', async () => {
    const response = await request(app).post('/api/todos').send({ title: '   ' });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Title is required');
  });

  it('trims whitespace from the title', async () => {
    const response = await request(app).post('/api/todos').send({ title: '  Trimmed  ' });
    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Trimmed');
  });
});

describe('PUT /api/todos/:id', () => {
  it('updates the title of a todo', async () => {
    const todo = await createTodo({ title: 'Original' });
    const response = await request(app)
      .put(`/api/todos/${todo.id}`)
      .send({ title: 'Updated' });
    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated');
  });

  it('marks a todo as complete', async () => {
    const todo = await createTodo({ title: 'Mark complete' });
    const response = await request(app)
      .put(`/api/todos/${todo.id}`)
      .send({ completed: true });
    expect(response.status).toBe(200);
    expect(response.body.completed).toBe(true);
  });

  it('marks a completed todo as incomplete', async () => {
    const todo = await createTodo({ title: 'Mark incomplete' });
    await request(app).put(`/api/todos/${todo.id}`).send({ completed: true });
    const response = await request(app)
      .put(`/api/todos/${todo.id}`)
      .send({ completed: false });
    expect(response.status).toBe(200);
    expect(response.body.completed).toBe(false);
  });

  it('updates due_date and notes', async () => {
    const todo = await createTodo({ title: 'Update fields' });
    const response = await request(app)
      .put(`/api/todos/${todo.id}`)
      .send({ due_date: '2026-09-15', notes: 'updated notes' });
    expect(response.status).toBe(200);
    expect(response.body.due_date).toBe('2026-09-15');
    expect(response.body.notes).toBe('updated notes');
  });

  it('returns 404 for a non-existent id', async () => {
    const response = await request(app).put('/api/todos/999999').send({ title: 'Ghost' });
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Todo not found');
  });

  it('returns 400 for an invalid id', async () => {
    const response = await request(app).put('/api/todos/abc').send({ title: 'Bad' });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Valid todo ID is required');
  });

  it('returns 400 when title is set to empty string', async () => {
    const todo = await createTodo({ title: 'Will fail update' });
    const response = await request(app).put(`/api/todos/${todo.id}`).send({ title: '' });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Title cannot be empty');
  });
});

describe('DELETE /api/todos/:id', () => {
  it('deletes an existing todo', async () => {
    const todo = await createTodo({ title: 'Delete me' });
    const response = await request(app).delete(`/api/todos/${todo.id}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Todo deleted successfully', id: todo.id });
  });

  it('returns 404 after the todo is already deleted', async () => {
    const todo = await createTodo({ title: 'Delete twice' });
    await request(app).delete(`/api/todos/${todo.id}`);
    const response = await request(app).delete(`/api/todos/${todo.id}`);
    expect(response.status).toBe(404);
  });

  it('returns 404 for a non-existent id', async () => {
    const response = await request(app).delete('/api/todos/999999');
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Todo not found');
  });

  it('returns 400 for an invalid id', async () => {
    const response = await request(app).delete('/api/todos/abc');
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Valid todo ID is required');
  });
});