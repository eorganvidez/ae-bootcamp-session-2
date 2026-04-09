const request = require('supertest');
const { app, db } = require('../../src/app');

beforeEach(() => {
  db.exec('DELETE FROM todos');
});

afterAll(() => {
  if (db) db.close();
});

// Helper: create a todo via the API and return the response body
const createTodo = async (fields = {}) => {
  const payload = { title: 'Integration todo', ...fields };
  const res = await request(app).post('/api/todos').send(payload);
  expect(res.status).toBe(201);
  return res.body;
};

describe('Todos API — integration', () => {
  describe('GET /api/todos', () => {
    it('returns todos sorted: incomplete before completed', async () => {
      const incomplete = await createTodo({ title: 'Still active' });
      const completed  = await createTodo({ title: 'Done' });
      await request(app).put(`/api/todos/${completed.id}`).send({ completed: true });

      const res = await request(app).get('/api/todos');
      const ids = res.body.map((t) => t.id);
      expect(ids.indexOf(incomplete.id)).toBeLessThan(ids.indexOf(completed.id));
    });

    it('returns todos sorted: earlier due_date before later due_date', async () => {
      const later   = await createTodo({ title: 'Later due',  due_date: '2027-12-31' });
      const earlier = await createTodo({ title: 'Earlier due', due_date: '2026-06-01' });

      const res = await request(app).get('/api/todos');
      const ids = res.body.filter((t) => !t.completed).map((t) => t.id);
      expect(ids.indexOf(earlier.id)).toBeLessThan(ids.indexOf(later.id));
    });

    it('returns todos with due_date before todos without', async () => {
      const noDue = await createTodo({ title: 'No due date' });
      const withDue = await createTodo({ title: 'Has due date', due_date: '2026-05-01' });

      const res = await request(app).get('/api/todos');
      const ids = res.body.filter((t) => !t.completed).map((t) => t.id);
      expect(ids.indexOf(withDue.id)).toBeLessThan(ids.indexOf(noDue.id));
    });
  });

  describe('POST /api/todos', () => {
    it('creates a todo with all optional fields', async () => {
      const res = await request(app).post('/api/todos').send({
        title: 'Full todo',
        due_date: '2026-08-20',
        notes: 'Some notes here',
      });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Full todo');
      expect(res.body.due_date).toBe('2026-08-20');
      expect(res.body.notes).toBe('Some notes here');
      expect(res.body.completed).toBe(false);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('created_at');
    });

    it('creates a todo without optional fields', async () => {
      const res = await request(app).post('/api/todos').send({ title: 'Minimal todo' });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Minimal todo');
      expect(res.body.due_date).toBeNull();
      expect(res.body.notes).toBeNull();
    });

    it('rejects a missing title with 400', async () => {
      const res = await request(app).post('/api/todos').send({ due_date: '2026-01-01' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Title is required');
    });

    it('rejects a whitespace-only title with 400', async () => {
      const res = await request(app).post('/api/todos').send({ title: '   ' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Title is required');
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('full round-trip: create → update title → verify', async () => {
      const todo = await createTodo({ title: 'Before update' });
      const res = await request(app)
        .put(`/api/todos/${todo.id}`)
        .send({ title: 'After update' });
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('After update');
      expect(res.body.id).toBe(todo.id);
    });

    it('full round-trip: create → complete → verify → re-open → verify', async () => {
      const todo = await createTodo({ title: 'Toggle complete' });

      const complete = await request(app).put(`/api/todos/${todo.id}`).send({ completed: true });
      expect(complete.status).toBe(200);
      expect(complete.body.completed).toBe(true);

      const reopen = await request(app).put(`/api/todos/${todo.id}`).send({ completed: false });
      expect(reopen.status).toBe(200);
      expect(reopen.body.completed).toBe(false);
    });

    it('updates due_date then removes it', async () => {
      const todo = await createTodo({ title: 'Date update' });

      const set = await request(app).put(`/api/todos/${todo.id}`).send({ due_date: '2026-11-11' });
      expect(set.body.due_date).toBe('2026-11-11');

      const unset = await request(app).put(`/api/todos/${todo.id}`).send({ due_date: null });
      expect(unset.body.due_date).toBeNull();
    });

    it('returns 404 for unknown id', async () => {
      const res = await request(app).put('/api/todos/999999').send({ title: 'Ghost' });
      expect(res.status).toBe(404);
    });

    it('returns 400 for non-numeric id', async () => {
      const res = await request(app).put('/api/todos/xyz').send({ title: 'Bad' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when setting title to empty string', async () => {
      const todo = await createTodo({ title: 'Valid' });
      const res = await request(app).put(`/api/todos/${todo.id}`).send({ title: '' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Title cannot be empty');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('full round-trip: create → delete → gone from list', async () => {
      const todo = await createTodo({ title: 'To be deleted' });
      const del = await request(app).delete(`/api/todos/${todo.id}`);
      expect(del.status).toBe(200);
      expect(del.body).toEqual({ message: 'Todo deleted successfully', id: todo.id });

      const list = await request(app).get('/api/todos');
      const ids = list.body.map((t) => t.id);
      expect(ids).not.toContain(todo.id);
    });

    it('returns 404 on second delete of the same todo', async () => {
      const todo = await createTodo({ title: 'Delete twice' });
      await request(app).delete(`/api/todos/${todo.id}`);
      const res = await request(app).delete(`/api/todos/${todo.id}`);
      expect(res.status).toBe(404);
    });

    it('returns 404 for unknown id', async () => {
      const res = await request(app).delete('/api/todos/999999');
      expect(res.status).toBe(404);
    });

    it('returns 400 for non-numeric id', async () => {
      const res = await request(app).delete('/api/todos/abc');
      expect(res.status).toBe(400);
    });
  });
});
