import { Hono } from "hono";
import { supabaseClient } from "../libs/client";


export const categoryRoute = new Hono();

// GET /categories → ดึง categories ทั้งหมด
categoryRoute.get("/", async (c) => {
  const limitParam = c.req.query("limit");

  let query = supabaseClient.from("categories").select("*");

  if (limitParam) {
    const limit = parseInt(limitParam, 10);
    if (isNaN(limit) || limit <= 0) {
      return c.json({ error: "Invalid limit parameter" }, 400);
    }
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// POST /categories → เพิ่ม category ใหม่
categoryRoute.post("/", async (c) => {
  const body = await c.req.json();

  const {data, error} = await supabaseClient.from('categories').insert({
    name: body.name,
    description: body.description
  }).select();

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: "Category created", category: body }, 201);
});

categoryRoute.post("/update", async (c) => {
  const body = await c.req.json();

  const {data, error} = await supabaseClient.from('categories').update({
    name: body.name,
    description: body.description
  }).eq('id', body.id).select();

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: "Category updated", category: body }, 200);
});