"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/Forms";
import { useLogin } from "@/hooks/api";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: login, isPending, error } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField name="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <FormField name="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <p className="text-sm text-destructive">{error.message}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
