import { Hono } from "hono";
import { pool } from "../libs/db";

export const stockRoute = new Hono();

// GET /stocks → ดึง stocks ทั้งหมด
stockRoute.get('/', async (c) => {
  // support pagination: ?limit=10&offset=0
  const limitParam = c.req.query('limit');
  const offsetParam = c.req.query('offset');
  try {
    const params: any[] = [];
    let sql = `SELECT s.*, p.name AS product_name FROM stocks s LEFT JOIN products p ON s.product_id = p.product_id`;

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
    console.error('DB error (stocks GET):', err);
    return c.json({ error: err.message || 'DB error' }, 500);
  }
})

// POST /stocks → เพิ่ม stock ใหม่
stockRoute.post("/update", async (c) => {
  const body = await c.req.json();
  try {
    const res = await pool.query('UPDATE stocks SET quantity=$1 WHERE product_id=$2 RETURNING *', [body.quantity, body.product_id]);
    return c.json({ message: 'Stock updated', stock: res.rows[0] }, 200);
  } catch (err: any) {
    console.error('DB error (stock update):', err);
    return c.json({ error: err.message || 'DB error' }, 500);
  }
});