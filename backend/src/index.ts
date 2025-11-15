import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { userRoute } from './routes/users'
import { protectedRoute } from './routes/protected'
import { productsRoute } from './routes/product'
import { categoryRoute } from './routes/category'
import { stockRoute } from './routes/stock'
import { cors } from 'hono/cors'
import { init } from './helper/init'
import { pool } from './libs/db'
import { seed } from './helper/seed'

init(pool).then(() => {
  console.log('Database initialized')
}).catch((err:any) => {
  console.error('Error initializing database:', err)
})


const app = new Hono()

app.use(
  '*',
  cors({
    origin: '*', // allow all origins
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)

// mount user routes → /users
app.route('/users', userRoute)
app.route('/protected', protectedRoute)
app.route('/products', productsRoute)
app.route('/category', categoryRoute)
app.route('/stock', stockRoute)

// test route
app.get('/', (c) => c.text('Hono + MySQL2 API running!'))
app.get('/seed', async (c) => {
  try {
    await seed();
    return c.text('Database seeded successfully');
  } catch (err) {
    return c.text('Error seeding database: ');
  }
})

serve({
  fetch: app.fetch,
  port: 8000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
