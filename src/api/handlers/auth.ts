import { NextRequest, NextResponse } from "next/server";
import { loginSchema, registerSchema } from "@/validators/auth";

export async function handleLogin(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);
    
    // Auth logic here
    return NextResponse.json({ success: true, token: "jwt-token" });
  } catch (error) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
}

export async function handleRegister(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);
    
    // Registration logic here
    return NextResponse.json({ success: true, userId: "new-user-id" });
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 400 });
  }
}

export async function handleLogout(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("auth-token");
  return response;
}
