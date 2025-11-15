import { pool } from "../libs/db";
import bcrypt from "bcryptjs";

async function seed() {
  console.log('Starting DB seed...');
  try {
    await pool.query('BEGIN');

    // Truncate all tables in correct order (dependents first)
    await pool.query(
      `TRUNCATE payments, order_items, orders, stocks, products, categories, users RESTART IDENTITY CASCADE;`
    );

    // Insert users
    const passwordHash = await bcrypt.hash('Password123!', 10);
    const userRes = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, phone, address) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      ['Alice Example', 'alice@example.com', passwordHash, 'user', '012-345-6789', '123 Example St']
    );
    const user = userRes.rows[0];

    // Insert categories
    const catRes = await pool.query(
      `INSERT INTO categories (name, description) VALUES
      ($1,$2),
      ($3,$4)
      RETURNING *`,
      ['Electronics', 'Devices and gadgets', 'Clothing', 'Apparel and accessories']
    );
    const categories = catRes.rows;

    // Insert products
    const prodRes = await pool.query(
      `INSERT INTO products (category_id, name, description, price, image_url) VALUES
      ($1,$2,$3,$4,$5),
      ($6,$7,$8,$9,$10)
      RETURNING *`,
      [
        categories[0].category_id,
        'Smartphone X',
        'A modern smartphone',
        699.99,
        'https://example.com/smartphone.jpg',
        categories[0].category_id,
        'Wireless Headphones',
        'Noise-cancelling headphones',
        199.99,
        'https://example.com/headphones.jpg',
      ]
    );
    const products = prodRes.rows;

    // Insert stocks
    for (const p of products) {
      await pool.query('INSERT INTO stocks (product_id, quantity) VALUES ($1,$2)', [p.product_id, 50]);
    }

    // Create an order
    const orderRes = await pool.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES ($1,$2,$3) RETURNING *',
      [user.user_id, 899.98, 'Pending']
    );
    const order = orderRes.rows[0];

    // Insert order items
    await pool.query(
      'INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1,$2,$3), ($4,$5,$6)',
      [order.order_id, products[0].product_id, 1, order.order_id, products[1].product_id, 1]
    );

    // Insert payment
    await pool.query(
      'INSERT INTO payments (order_id, amount, status) VALUES ($1,$2,$3)',
      [order.order_id, 899.98, 'Success']
    );

    await pool.query('COMMIT');
    console.log('DB seed completed successfully');
  } catch (err) {
    console.error('DB seed failed:', err);
    await pool.query('ROLLBACK').catch(() => {});
  } finally {
    // do not close the pool here so the application can continue using it
  }
}

// Run when executed directly via tsx/node: e.g. `tsx src/helper/seed.ts` or `pnpm run seed`
if (process.argv[1] && (process.argv[1].endsWith('seed.ts') || process.argv[1].endsWith('seed.js'))) {
  seed().then(() => process.exit(0)).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { seed };
