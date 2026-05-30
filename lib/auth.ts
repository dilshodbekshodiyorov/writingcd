import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "writingcd-fallback-secret-min-32-characters-here"
);

export async function hashPassword(p: string) { return bcrypt.hash(p, 12); }
export async function verifyPassword(p: string, h: string) { return bcrypt.compare(p, h); }

export interface JwtPayload {
  id: string; email: string; name: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
}

export async function createToken(payload: JwtPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt().setExpirationTime("7d").sign(SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JwtPayload;
  } catch { return null; }
}

export async function getCurrentUser(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}
