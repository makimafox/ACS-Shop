import { Hono } from "hono";
import { pool } from "../libs/db";
import bcrypt from "bcryptjs";
import { signJwt, verifyJwt } from "../libs/jwt";

export const userRoute = new Hono();

// ✅ GET /users → ดึง users ทั้งหมด
userRoute.get("/", async (c) => {
  // support pagination: ?limit=10&offset=0
  const limitParam = c.req.query("limit");
  const offsetParam = c.req.query("offset");
  try {
    const params: any[] = [];
    let sql = "SELECT user_id, name, email, role, address FROM users";

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
    console.error("DB error (users GET):", err);
    return c.json({ error: err.message || "DB error" }, 500);
  }
});

// ✅ POST /users → เพิ่ม user ใหม่
userRoute.post("/signup", async (c) => {
  const body = await c.req.json();
  const hashedPassword = await bcrypt.hash(body.password, 10);
  try {
    const res = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, address) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [body.name, body.email, hashedPassword, body.phone, body.address]
    );
    return c.json(res.rows[0], 201);
  } catch (err: any) {
    console.error("DB error (signup):", err);
    // unique email violation -> 23505
    if (err.code === "23505")
      return c.json({ error: "Email already exists" }, 400);
    return c.json({ error: err.message || "DB error" }, 500);
  }
});

userRoute.post("/signin", async (c) => {
  const { email, password } = await c.req.json();
  try {
    const res = await pool.query(
      `SELECT * FROM users WHERE email = $1 LIMIT 1`,
      [email]
    );
    const user = res.rows[0];
    if (!user) return c.json({ error: "Invalid credentials" }, 401);

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return c.json({ error: "Invalid credentials" }, 401);

    // user id column is user_id
    const token = signJwt({
      id: user.user_id,
      email: user.email,
      role: user.role,
    });
    return c.json({ token }, 200);
  } catch (err: any) {
    console.error("DB error (signin):", err);
    return c.json({ error: err.message || "DB error" }, 500);
  }
});

userRoute.post("/getinfo", async (c) => {
  const { token } = await c.req.json();
  console.log("Received token:", token);
  const payload = verifyJwt(token);
  if (!payload || typeof payload === "string") {
    return c.json({ error: "Invalid token" }, 401);
  } else {
    return c.json(payload, 200);
  }
});

userRoute.post("/settings/username", async (c) => {
  const { username, token } = await c.req.json();
  const payload = verifyJwt(token);
  console.log("Payload:", payload);
  if (!payload || typeof payload === "string") {
    return c.json({ error: "Invalid token" }, 401);
  }
  try {
    const res = await pool.query(
      `UPDATE users SET name = $1 WHERE user_id = $2 RETURNING user_id, name, email, role, address`,
      [username, payload.id]
    );
    return c.json(res.rows[0], 200);
  } catch (err: any) {
    console.error("DB error (update username):", err);
    return c.json({ error: err.message || "DB error" }, 500);
  }
});

userRoute.post("/settings/address", async (c) => {
  const { address, token } = await c.req.json();
  const payload = verifyJwt(token);
  console.log("Payload:", payload);
  if (!payload || typeof payload === "string") {
    return c.json({ error: "Invalid token" }, 401);
  }
  try {
    const res = await pool.query(
      `UPDATE users SET address = $1 WHERE user_id = $2 RETURNING user_id, name, email, role, address`,
      [address, payload.id]
    );
    return c.json(res.rows[0], 200);
  } catch (err: any) {
    console.error("DB error (update address):", err);
    return c.json({ error: err.message || "DB error" }, 500);
  }
});

userRoute.post("/settings/password", async (c) => {
  const { oldPassword, newPassword, token } = await c.req.json();
  const payload = verifyJwt(token);
  console.log("Payload:", payload);
  if (!payload || typeof payload === "string") {
    return c.json({ error: "Invalid token" }, 401);
  }
  try {
    const res = await pool.query(
      `SELECT password_hash FROM users WHERE user_id = $1 LIMIT 1`,
      [payload.id]
    );
    const user = res.rows[0];
    if (!user) return c.json({ error: "User not found" }, 404);
    const ok = await bcrypt.compare(oldPassword, user.password_hash);
    if (!ok) return c.json({ error: "Old password is incorrect" }, 401);
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE users SET password_hash = $1 WHERE user_id = $2`, [
      hashedNewPassword,
      payload.id,
    ]);
    return c.json({ message: "Password updated successfully" }, 200);
  } catch (err: any) {
    console.error("DB error (update password):", err);
    return c.json({ error: err.message || "DB error" }, 500);
  }
});


userRoute.post("/settings/phone", async (c) => {
  const { phone, token } = await c.req.json();
  const payload = verifyJwt(token);
  console.log("Payload:", payload);
  if (!payload || typeof payload === "string") {
    return c.json({ error: "Invalid token" }, 401);
  }
  try {
    const res = await pool.query(
      `UPDATE users SET phone = $1 WHERE user_id = $2 RETURNING user_id, name, email, role, address, phone`,
      [phone, payload.id]
    );
    return c.json(res.rows[0], 200);
  } catch (err: any) {
    console.error("DB error (update phone):", err);
    return c.json({ error: err.message || "DB error" }, 500);
  }
});