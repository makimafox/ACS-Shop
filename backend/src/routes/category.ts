import { Hono } from "hono";
import { pool } from "../libs/db";

export const categoryRoute = new Hono();

// GET /categories → ดึง categories ทั้งหมด
categoryRoute.get("/", async (c) => {
  // support optional pagination: ?limit=10&offset=0
  const limitParam = c.req.query("limit");
  const offsetParam = c.req.query("offset");
  try {
    const params: any[] = [];
    let sql = "SELECT * FROM categories";

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
    console.error("DB error (categories GET):", err);
    return c.json({ error: err.message || "DB error" }, 500);
  }
});


categoryRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const res = await pool.query("SELECT * FROM categories WHERE category_id=$1", [id]);
    if (res.rows.length === 0) {
      return c.json({ error: "Category not found" }, 404);
    }
    return c.json(res.rows[0]);
  } catch (err: any) {
    console.error("DB error (category GET):", err);
    return c.json({ error: err.message || "DB error" }, 500);
  }
});

// POST /categories → เพิ่ม category ใหม่
categoryRoute.post("/", async (c) => {
  const body = await c.req.json();
  try {
    const res = await pool.query(
      "INSERT INTO categories (name, description) VALUES ($1,$2) RETURNING *",
      [body.name, body.description]
    );
    return c.json({ message: "Category created", category: res.rows[0] }, 201);
  } catch (err: any) {
    console.error("DB error (category create):", err);
    return c.json({ error: err.message || "DB error" }, 500);
  }
});

categoryRoute.post("/update", async (c) => {
  const body = await c.req.json();
  try {
    const res = await pool.query(
      "UPDATE categories SET name=$1, description=$2 WHERE category_id=$3 RETURNING *",
      [body.name, body.description, body.id]
    );
    return c.json({ message: "Category updated", category: res.rows[0] }, 200);
  } catch (err: any) {
    console.error("DB error (category update):", err);
    return c.json({ error: err.message || "DB error" }, 500);
  }
});


// DELETE /categories → ลบ category
categoryRoute.post("/delete", async (c) => {
  const body = await c.req.json();
  const id = body.id;

  console.log("Deleting category with id:", id);

  if (!id) return c.json({ error: 'Missing id in request body' }, 400);

  try {
    // Check reference products
    const prodRes = await pool.query(
      'SELECT COUNT(*) FROM products WHERE category_id=$1',
      [id]
    );

    const count = parseInt(prodRes.rows[0]?.count || '0', 10);

    if (count > 0) {
      return c.json({
        error: `Cannot delete category: ${count} product(s) reference it. Remove or reassign products first.`
      }, 400);
    }

    // Delete category + return deleted row
    const res = await pool.query(
      'DELETE FROM categories WHERE category_id=$1 RETURNING *',
      [id]
    );

    if (res.rowCount === 0) {
      return c.json({ error: 'Category not found' }, 404);
    }

    return c.json(
      { message: 'Category deleted', category: res.rows[0] },
      200
    );

  } catch (err: any) {
    console.error('DB error (category delete):', err);

    if (err.code === '23503') {
      return c.json({
        error: 'Cannot delete category because other records reference it (foreign key constraint).'
      }, 400);
    }

    return c.json({ error: err.message || 'DB error' }, 500);
  }
});