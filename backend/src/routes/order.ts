import { Hono } from "hono";
import { pool } from "../libs/db";
import { verifyJwt } from "../libs/jwt";

export const orderRoute = new Hono();

// GET /orders → ดึง orders ทั้งหมด
orderRoute.get("/", async (c) => {
  // support pagination: ?limit=10&offset=0
  const limitParam = c.req.query("limit");
  const offsetParam = c.req.query("offset");
  try {
    const params: any[] = [];
    let sql = "SELECT * FROM orders";

    if (limitParam) {
      const limit = parseInt(limitParam, 10);
      if (isNaN(limit) || limit <= 0)
        return c.json({ error: "Invalid limit parameter" }, 400);
      params.push(limit);
      sql += ` LIMIT $${params.length}`;
    }

    if (offsetParam) {
      const offset = parseInt(offsetParam, 10);
      if (isNaN(offset) || offset < 0)
        return c.json({ error: "Invalid offset parameter" }, 400);
      params.push(offset);
      sql += ` OFFSET $${params.length}`;
    }

    const res = await pool.query(sql, params);
    return c.json(res.rows);
  } catch (err: any) {
    console.error("DB error (orders GET):", err);
    return c.json({ error: err.message || "DB error" }, 500);
  }
});

// POST /orders → เพิ่ม order ใหม่
orderRoute.post("/", async (c) => {
  const body = await c.req.json();
    let userId;
  try {
    const payload = verifyJwt(body.token);
    if (!payload || typeof payload === 'string') {
      return c.json({ error: "Invalid token" }, 401);
    }
    userId = payload.id;
    
  } catch (err: any) {
    console.error("JWT error (order create):", err);
    return c.json({ error: "Invalid token" }, 401);
  }
  try {
    await pool.query("BEGIN");
    const orderRes = await pool.query(
      "INSERT INTO orders (user_id, total_amount) VALUES ($1,$2) RETURNING *",
      [userId, body.total_amount]
    );
    const order = orderRes.rows[0];

    const items = body.items || [];
    console.log("Order items:", items);
    const insertedItems = [];
    for (const item of items) {
      const r = await pool.query(
        "INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1,$2,$3) RETURNING *",
        [order.order_id, item.id, item.qty]
      );
      insertedItems.push(r.rows[0]);
    }

    await pool.query("COMMIT");
    return c.json(
      { message: "Order created", order, items: insertedItems },
      201
    );
  } catch (err: any) {
    await pool.query("ROLLBACK").catch(() => {});
    console.error("DB error (order create):", err);
    return c.json({ error: err.message || "DB error" }, 500);
  }
});
