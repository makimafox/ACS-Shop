import { Hono } from "hono";
import { pool } from "../libs/db";


export const categoryRoute = new Hono();

// GET /categories → ดึง categories ทั้งหมด
categoryRoute.get('/', async (c) => {
  // support optional pagination: ?limit=10&offset=0
  const limitParam = c.req.query('limit');
  const offsetParam = c.req.query('offset');
  try {
    const params: any[] = [];
    let sql = 'SELECT * FROM categories';

    if (limitParam) {
      const limit = parseInt(limitParam, 10);
      if (isNaN(limit) || limit <= 0) return c.json({ error: 'Invalid limit parameter' }, 400);
      params.push(limit);
      sql += ` LIMIT $${params.length}`;
    }

    if (offsetParam) {
      const offset = parseInt(offsetParam, 10);
      if (isNaN(offset) || offset < 0) return c.json({ error: 'Invalid offset parameter' }, 400);
      params.push(offset);
      sql += ` OFFSET $${params.length}`;
    }

    const res = await pool.query(sql, params);
    return c.json(res.rows);
  } catch (err: any) {
    console.error('DB error (categories GET):', err);
    return c.json({ error: err.message || 'DB error' }, 500);
  }
});

// POST /categories → เพิ่ม category ใหม่
categoryRoute.post("/", async (c) => {
  const body = await c.req.json();
  try {
    const res = await pool.query('INSERT INTO categories (name, description) VALUES ($1,$2) RETURNING *', [body.name, body.description]);
    return c.json({ message: 'Category created', category: res.rows[0] }, 201);
  } catch (err: any) {
    console.error('DB error (category create):', err);
    return c.json({ error: err.message || 'DB error' }, 500);
  }
});

categoryRoute.post("/update", async (c) => {
  const body = await c.req.json();
  try {
    const res = await pool.query('UPDATE categories SET name=$1, description=$2 WHERE category_id=$3 RETURNING *', [body.name, body.description, body.id]);
    return c.json({ message: 'Category updated', category: res.rows[0] }, 200);
  } catch (err: any) {
    console.error('DB error (category update):', err);
    return c.json({ error: err.message || 'DB error' }, 500);
  }
});