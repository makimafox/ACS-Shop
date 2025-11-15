

export async function init(pool: any) {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(10) NOT NULL DEFAULT 'user',
        phone VARCHAR(20),
        address TEXT
      );

      CREATE TABLE IF NOT EXISTS categories (
        category_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS products (
        product_id SERIAL PRIMARY KEY,
        category_id INTEGER NOT NULL REFERENCES categories(category_id),
        name VARCHAR(150) NOT NULL,
        description TEXT,
        price NUMERIC(10,2) NOT NULL,
        image_url VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS stocks (
        stock_id SERIAL PRIMARY KEY,
        quantity INTEGER,
        product_id INTEGER NOT NULL REFERENCES products(product_id)
      );

      CREATE TABLE IF NOT EXISTS orders (
        order_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id),
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) NOT NULL DEFAULT 'Pending',
        total_amount NUMERIC(10,2) NOT NULL,
        CHECK (status IN ('Pending','Processing','Shipped','Completed','Cancelled'))
      );

      CREATE TABLE IF NOT EXISTS order_items (
        order_item_id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(product_id),
        quantity INTEGER NOT NULL CHECK (quantity > 0)
      );

      CREATE TABLE IF NOT EXISTS payments (
        payment_id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL UNIQUE REFERENCES orders(order_id) ON DELETE CASCADE,
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        amount NUMERIC(10,2) NOT NULL,
        status VARCHAR(20) NOT NULL,
        CHECK (status IN ('Success','Failed'))
      );
    `);

    console.log("Database tables created or already exist");
  } catch (err) {
    console.error("Error creating tables:", err);
    throw err; // rethrow so caller can handle
  }
}