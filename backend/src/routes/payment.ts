import { Hono } from "hono";
import { supabaseClient } from "../libs/client";


export const paymentRoute = new Hono();

// GET /payments → ดึง payments ทั้งหมด
paymentRoute.get("/", async (c) => {
  const { data, error } = await supabaseClient.from('payments').select('*');
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// POST /payments → เพิ่ม payment ใหม่
paymentRoute.post("/", async (c) => {
  const body = await c.req.json();

    const { data, error } = await supabaseClient.from('payments').insert({
        order_id: body.order_id,
        amount: body.amount,
        method: body.method,
        status: body.status
    }).select();

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ message: "Payment created", payment: data[0] }, 201);   
});