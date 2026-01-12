import { NextRequest, NextResponse } from "next/server";
import { AuthenticationError, AuthorizationError } from "@/errors";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  organizationId: string;
}

export async function authMiddleware(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new AuthenticationError("No token provided");
  }

  try {
    // Verify token logic here
    const user: AuthUser = { id: "1", email: "user@test.com", role: "user", organizationId: "org1" };
    return user;
  } catch {
    throw new AuthenticationError("Invalid token");
  }
}

export function requireRole(...roles: string[]) {
  return async (user: AuthUser) => {
    if (!roles.includes(user.role)) {
      throw new AuthorizationError("Insufficient permissions");
    }
    return user;
  };
}

export function requirePermission(permission: string) {
  return async (user: AuthUser) => {
    // Check permission logic
    return user;
  };
}
