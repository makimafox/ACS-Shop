import { Hono } from "hono";
import { supabaseClient } from "../libs/client";
import bcrypt from "bcryptjs";
import { signJwt } from "../libs/jwt";

export const userRoute = new Hono();

// ✅ GET /users → ดึง users ทั้งหมด
userRoute.get("/", async (c) => {

  return c.text("Get all users");
});

// ✅ POST /users → เพิ่ม user ใหม่
userRoute.post("/signup", async (c) => {
  const body = await c.req.json();
  const hashedPassword = await bcrypt.hash(body.password, 10);

  const { data, error } = await supabaseClient
    .from("users")
    .insert({
      name: body.name,
      email: body.email,
      password_hash: hashedPassword,
    })
    .select();

  if (error) return c.json({ error: error.message }, 500);

  return c.json(data[0], 201);
});

userRoute.post("/signin", async (c) => {

  const { email, password } = await c.req.json();

  const { data: user, error } = await supabaseClient
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) return c.json({ error: "Invalid credentials" }, 401);

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return c.json({ error: "Invalid credentials" }, 401);

  const token = signJwt({ sub: user.id, email: user.email, role: user.role });
  return c.json({ token },200);
});

userRoute.get("/:id", async (c) => {});
