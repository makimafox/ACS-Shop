import { Hono } from "hono";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../libs/db";

export const productsRoute = new Hono();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

productsRoute.get("/", async (c) => {
  try {
    const res = await pool.query("SELECT * FROM products");
    return c.json({ success: true, products: res.rows });
  } catch (err: any) {
    console.error("Error fetching products:", err);
    return c.json({ success: false, message: err.message }, 500);
  }
});

productsRoute.post("/", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category_id = formData.get("category_id") as string;
    const stock_quantity = parseInt(formData.get("stock_quantity") as string);

    if (!file) {
      return c.json({ success: false, message: "No file uploaded" }, 400);
    }

    // Save file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    // Insert all product info including image_url
    const res = await pool.query(
      `INSERT INTO products (category_id, name, description, price, image_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [category_id, name, description, price, filename]
    );

    return c.json({ success: true, product: res.rows[0] });
  } catch (err: any) {
    console.error("Error creating product:", err);
    return c.json({ success: false, message: err.message }, 500);
  }
});

productsRoute.get("/images/:filename", async (c) => {
  const { filename } = c.req.param();
  const filePath = path.join(uploadDir, filename);

  if (!fs.existsSync(filePath)) {
    return c.json({ success: false, message: "File not found" }, 404);
  }

  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(filename).toLowerCase();
  let contentType = "application/octet-stream";

  switch (ext) {
    case ".jpg":
    case ".jpeg":
      contentType = "image/jpeg";
      break;
    case ".png":
      contentType = "image/png";
      break;
    case ".gif":
      contentType = "image/gif";
      break;
    case ".webp":
      contentType = "image/webp";
      break;
  }

  return c.body(fileBuffer, 200, {
    "Content-Type": contentType,
  });
});
