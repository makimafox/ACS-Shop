import { Hono } from "hono";
import { supabaseClient } from "../libs/client";


export const categoryRoute = new Hono();

// GET /categories → ดึง categories ทั้งหมด
categoryRoute.get("/", async (c) => {
    const { data, error } = await supabaseClient.from("categories").select("*");

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