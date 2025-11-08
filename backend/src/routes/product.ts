import { Hono } from "hono";
import { supabaseClient } from "../libs/client";

export const productsRoute = new Hono();

// GET /products → ดึง products ทั้งหมด
productsRoute.get("/", async (c) => {
  const name = c.req.query("name") || "";

  let query = supabaseClient.from("products").select("*");

  //   if have query param name, filter by name
  if (name) {
    query = query.eq("name", name);
  }

  const { data, error } = await query;

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// POST /products → เพิ่ม product ใหม่
productsRoute.post("/", async (c) => {
  const body = await c.req.json();

  // 1. Insert product
  const { data: product, error: productError } = await supabaseClient
    .from("products")
    .insert({
      name: body.name,
      description: body.description,
      price: body.price,
      category_id: body.category_id,
      image_url: body.image_url ?? null,
    })
    .select()
    .single();

  if (productError) return c.json({ error: productError.message }, 500);

  // 2. Insert stock ผูกกับ product_id ที่สร้างใหม่
  const { data: stock, error: stockError } = await supabaseClient
    .from("stocks")
    .insert({
      product_id: product.product_id,
      quantity: body.initial_stock ?? 0,
    })
    .select()
    .single();

  if (stockError) return c.json({ error: stockError.message }, 500);

  return c.json({ message: "Product created", product, stock }, 201);
});


productsRoute.post("/update", async (c) => {
  const body = await c.req.json();

  // 1. Insert product
  const { data: product, error: productError } = await supabaseClient
    .from("products")
    .update({
      name: body.name,
      description: body.description,
      price: body.price,
      category_id: body.category_id,
      image_url: body.image_url ?? null,
    })
    .eq('product_id', body.product_id)
    .select()
    .single();

  if (productError) return c.json({ error: productError.message }, 500);

  return c.json({ message: "Product updated", product }, 201);
});