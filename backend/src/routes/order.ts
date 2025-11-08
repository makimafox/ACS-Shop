import { Hono } from "hono";
import { supabaseClient } from "../libs/client";

export const orderRoute = new Hono();

// GET /orders → ดึง orders ทั้งหมด
orderRoute.get("/", async (c) => {
    const {data, error} = await supabaseClient.from('orders').select('*');
    if (error) return c.json({ error: error.message }, 500);
    return c.json(data);
});

// POST /orders → เพิ่ม order ใหม่
orderRoute.post("/", async (c) => {
    const body = await c.req.json();

    const { data, error } = await supabaseClient.from('orders').insert({
        user_id: body.user_id,
        total_amount: body.total_amount,
        status: body.status
    }).select();

    if (error) return c.json({ error: error.message }, 500);
    
    const { data: orderItems, error: orderItemsError } = await supabaseClient.from('order_items').insert(
        body.items.map((item: any) => ({
            order_id: data[0].order_id,
            product_id: item.product_id,
            quantity: item.quantity,
        }))
    ).select();

    if (orderItemsError) return c.json({ error: orderItemsError.message }, 500);

    return c.json({ message: "Order created", order: data[0], items: orderItems }, 201);
});