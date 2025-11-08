import { Hono } from "hono";
import { verifyJwt } from "../libs/jwt";


interface JwtPayload {
  sub: string;
  email: string;
}

export const protectedRoute = new Hono<{ Bindings: {}; Variables: { user: JwtPayload }; Env: {}; State: {} }>();

// Middleware
protectedRoute.use("*", async (c, next) => {
  const auth = c.req.header("Authorization") || "";
  const match = auth.match(/^Bearer (.+)$/);
  if (!match) return c.json({ error: "Missing token" }, 401);

  const payload = verifyJwt(match[1]);
  if (!payload) return c.json({ error: "Invalid or expired token" }, 401);

  // TypeScript รู้ว่า c.set("user") ต้องเป็น JwtPayload
  c.set("user", payload as JwtPayload);
  await next();
});

// Route
protectedRoute.get("/", (c) => {
  const user = c.get("user"); // user มี type JwtPayload
  return c.json({ message: "Access granted", user },200);
});