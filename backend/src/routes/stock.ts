import { Hono } from "hono";
import { supabaseClient } from "../libs/client";

export const stockRoute = new Hono();

// GET /stocks → ดึง stocks ทั้งหมด
stockRoute.get("/", async (c) => {
  return c.json({ message: "List of stocks" });
});

// POST /stocks → เพิ่ม stock ใหม่
stockRoute.post("/update", async (c) => {
  const body = await c.req.json();

  const { data, error } = await supabaseClient
    .from("stocks")
    .update({
      quantity: body.quantity,
    })
    .eq("product_id", body.product_id)
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: "Stock updated", stock: data }, 200);
});