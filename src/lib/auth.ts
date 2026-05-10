import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "session";
const EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60; // 7 days

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing env: JWT_SECRET");
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: { sub: string; username: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRES_IN_SECONDS}s`)
    .sign(getSecret());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string, username: string) {
  const expiresAt = new Date(Date.now() + EXPIRES_IN_SECONDS * 1000);
  const token = await signToken({ sub: userId, username });
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export { COOKIE_NAME };
