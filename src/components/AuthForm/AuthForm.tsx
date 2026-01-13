import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "../ui/Card";

interface AuthFormProps {
  mode: "login" | "register" | "forgot-password";
  onSubmit: (data: { email: string; password?: string; name?: string }) => void;
  loading?: boolean;
  error?: string;
}

export function AuthForm({ mode, onSubmit, loading, error }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password: mode !== "forgot-password" ? password : undefined, name: mode === "register" ? name : undefined });
  };

  const titles = {
    login: "Welcome Back",
    register: "Create Account",
    "forgot-password": "Reset Password"
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{titles[mode]}</CardTitle>
        <CardDescription>
          {mode === "login" && "Enter your credentials to access your account"}
          {mode === "register" && "Fill in your details to create a new account"}
          {mode === "forgot-password" && "Enter your email to receive a reset link"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {mode !== "forgot-password" && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : mode === "login" ? "Sign In" : mode === "register" ? "Sign Up" : "Send Reset Link"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
