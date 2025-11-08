import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";


const SECRET: string = process.env.JWT_SECRET!;

const options: SignOptions = {
  expiresIn: "1h",
};

export function signJwt(payload: object, expiresIn = "1h") {
  return jwt.sign(payload, SECRET, options);
}

export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}