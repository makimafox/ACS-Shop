import { Hono } from "hono";
import { pool } from "../libs/db";


export const paymentRoute = new Hono();

// GET /payments → ดึง payments ทั้งหมด
paymentRoute.get('/', async (c) => {
  // support pagination: ?limit=10&offset=0
  const limitParam = c.req.query('limit');
  const offsetParam = c.req.query('offset');
  try {
    const params: any[] = [];
    let sql = 'SELECT * FROM payments';

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
    console.error('DB error (payments GET):', err);
    return c.json({ error: err.message || 'DB error' }, 500);
  }
});

// POST /payments → เพิ่ม payment ใหม่
paymentRoute.post("/", async (c) => {
  const body = await c.req.json();
    try {
      const res = await pool.query('INSERT INTO payments (order_id, amount, status) VALUES ($1,$2,$3) RETURNING *', [body.order_id, body.amount, body.status]);
      return c.json({ message: 'Payment created', payment: res.rows[0] }, 201);
    } catch (err: any) {
      console.error('DB error (payment create):', err);
      return c.json({ error: err.message || 'DB error' }, 500);
    }
});