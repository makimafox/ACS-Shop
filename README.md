# ACS-Shop Project

Welcome to the ACS-Shop repository. This project is structured into two main parts: the **Frontend** and the **Backend**.

## 📁 Project Structure

- **[`/backend`](./backend/)**
  - Contains the API server built with **Hono**, **Node.js**, and **PostgreSQL**.
  - Handles database operations, business logic, JWT authentication, and routing.
  - Includes Docker configuration for easy local database setup.
  - *See the [Backend README](./backend/README.md) for detailed setup and API instructions.*

- **[`/frontend`](./frontend/)**
  - Contains the user interface built with HTML, CSS, and vanilla JavaScript.
  - Features e-commerce pages such as product listings, shopping cart, admin dashboard, login/signup, and order history.
  - Can be served using any static file server (e.g., Live Server, Nginx, etc.).

## 🚀 Getting Started

To get the full application running locally:

1. **Start the Backend:**
   Navigate to the `backend` directory, install dependencies, spin up the database via Docker, and start the development server. 
   *(Follow the steps in [backend/README.md](./backend/README.md))*

2. **Run the Frontend:**
   Navigate to the `frontend` directory and serve the HTML files. Since these are static files, you can use the VS Code "Live Server" extension or run a simple Python/Node static server.
   For example, using Python:
   ```bash
   cd frontend
   python -m http.server 8080
   ```
   Then open `http://localhost:8080/landing.html` (or whichever your main entry file is) in your browser.
