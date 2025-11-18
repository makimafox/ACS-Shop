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
    try {      for (const product of res.rows) {
        const stockRes = await pool.query(
          "SELECT quantity FROM stocks WHERE product_id=$1",
          [product.product_id]
        );
        if (stockRes.rows.length > 0) {
          product.stock_quantity = stockRes.rows[0].quantity;
        } else {
          product.stock_quantity = 0;
        }
      }
    } catch (stockErr: any) {
      console.error("Error fetching stock for products:", stockErr);
    }
    return c.json({ success: true, products: res.rows });
  } catch (err: any) {
    console.error("Error fetching products:", err);
    return c.json({ success: false, message: err.message }, 500);
  }
});

productsRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const res = await pool.query("SELECT * FROM products WHERE product_id=$1", [
      id,
    ]);
    if (res.rows.length === 0) {
      return c.json({ success: false, message: "Product not found" }, 404);
    }

    try {
      const stockRes = await pool.query(
        "SELECT quantity FROM stocks WHERE product_id=$1",
        [id]
      );
      if (stockRes.rows.length > 0) {
        res.rows[0].stock_quantity = stockRes.rows[0].quantity;
      } else {
        res.rows[0].stock_quantity = 0;
      }
    } catch (stockErr: any) {
      console.error("Error fetching stock for product:", stockErr);
      res.rows[0].stock_quantity = 0;
    }
    return c.json({ success: true, product: res.rows[0] });
  } catch (err: any) {
    console.error("Error fetching product:", err);
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
    const category_id = parseInt(formData.get("category_id") as string);
    const stock_quantity = parseInt(formData.get("stock_quantity") as string);

    if (!file) {
      return c.json({ success: false, message: "No file uploaded" }, 400);
    }

    console.log("Received file:", file.name, file.size, file.type);
    console.log("Product details:", {
      name,
      description,
      price,
      category_id,
      stock_quantity,
    });

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

    try {
      await pool.query(
        `INSERT INTO stocks (product_id, quantity)
         VALUES ($1, $2)`,
        [res.rows[0].product_id, stock_quantity]
      );
    } catch (stockErr: any) {
      console.error("Error creating stock for product:", stockErr);
      // Optionally, you might want to delete the created product here if stock creation fails
    }

    return c.json({ success: true, product: res.rows[0] });
  } catch (err: any) {
    console.error("Error creating product:", err);
    return c.json({ success: false, message: err.message }, 500);
  }
});

productsRoute.post("/update", async (c) => {
  try {
    const formData = await c.req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category_id = parseInt(formData.get("category_id") as string);
    const stock_quantity = parseInt(formData.get("stock_quantity") as string);
    const product_id = parseInt(formData.get("product_id") as string);
    const res = await pool.query(
      `UPDATE products SET category_id=$1, name=$2, description=$3, price=$4 WHERE product_id=$5 RETURNING *`,
      [category_id, name, description, price, product_id]
    );

    try {
      await pool.query(`UPDATE stocks SET quantity=$1 WHERE product_id=$2`, [
        stock_quantity,
        product_id,
      ]);
    } catch (stockErr: any) {
      console.error("Error updating stock for product:", stockErr);
    }

    return c.json({ success: true, product: res.rows[0] });
  } catch (err: any) {
    console.error("Error updating product:", err);
    return c.json({ success: false, message: err.message }, 500);
  }
});

productsRoute.post("/updateimg", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    const product_id = parseInt(formData.get("product_id") as string);

    if (!file) {
      return c.json({ success: false, message: "No file uploaded" }, 400);
    }

    console.log("Received file for update:", file.name, file.size, file.type);

    // Save file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    // Update product image_url
    const res = await pool.query(
      `UPDATE products SET image_url=$1 WHERE product_id=$2 RETURNING *`,
      [filename, product_id]
    );

    return c.json({ success: true, product: res.rows[0] });
  } catch (err: any) {
    console.error("Error updating product image:", err);
    return c.json({ success: false, message: err.message }, 500);
  }
});


productsRoute.post("/delete", async (c) => {
  const body = await c.req.json();
  const id = body.id;

  if (!id) return c.json({ success: false, message: 'Missing id in request body' }, 400);

  try {
    // Delete product + return deleted row
    try {
      await pool.query('DELETE FROM stocks WHERE product_id=$1', [id]);
    } catch (stockErr: any) {
      console.error("Error deleting stock for product:", stockErr);
    }

    const res = await pool.query(
      'DELETE FROM products WHERE product_id=$1 RETURNING *',
      [id]
    );

    if (res.rowCount === 0) {
      return c.json({ success: false, message: 'Product not found' }, 404);
    }

    return c.json(
      { success: true, message: 'Product deleted', product: res.rows[0] },
      200
    );

  } catch (err: any) {
    console.error('DB error (product delete):', err);
    return c.json({ success: false, message: err.message || 'DB error' }, 500);
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
