# ACS-Shop Backend

This is the backend API for the ACS-Shop application, built with **[Hono](https://hono.dev/)**, Node.js, and PostgreSQL.

## 🚀 Features
- **Hono Framework:** Fast and lightweight web framework.
- **PostgreSQL Database:** Handled via the `pg` driver.
- **Authentication:** JWT (JSON Web Tokens) and bcrypt for password hashing.
- **Docker Support:** Ready-to-use PostgreSQL and pgAdmin via Docker Compose.
- **TypeScript:** Fully typed codebase.

## 📋 Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **pnpm**
- **Docker & Docker Compose** (for running the database locally)

## 🛠️ Getting Started

### 1. Install Dependencies
Inside the `backend` directory, install the required packages:
```bash
npm install
# or
pnpm install
```

### 2. Environment Variables
Create a `.env` file based on the provided example:
```bash
cp .env.example .env
```
*(The default `.env.example` values are pre-configured to match the `docker-compose.yml` settings.)*

### 3. Start the Database
Spin up the PostgreSQL database and pgAdmin using Docker:
```bash
docker-compose up -d
```
- **PostgreSQL** runs on `localhost:5432`
- **pgAdmin** runs on `http://localhost:8080`
  - **Email:** `admin@example.com`
  - **Password:** `1234`

### 4. Start the Development Server
Run the application in development mode with auto-reload:
```bash
npm run dev
```
The server will start at `http://localhost:8000`.

*(Note: The database tables will be initialized automatically upon server start.)*

### 5. Seed the Database (Optional)
To insert dummy data into your local database, simply navigate to the seed endpoint in your browser or via curl:
```
http://localhost:8000/seed
```

## 📜 Available Scripts

- `npm run dev`: Starts the development server using `tsx watch`.
- `npm run build`: Compiles the TypeScript code into the `dist/` directory.
- `npm run start`: Runs the compiled production code.

## 🚏 API Routes Overview
The following base routes are available:

- `GET /` - API Health check
- `GET /seed` - Seed the database
- `/users` - User registration, login, and management
- `/products` - Product listing and management
- `/category` - Product categories
- `/stock` - Inventory and stock management
- `/order` - Order processing
- `/payment` - Payment handling
- `/protected` - Example of a JWT protected route
