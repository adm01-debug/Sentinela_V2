"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/Forms";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Registration logic
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField name="name" label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <FormField name="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <FormField name="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <FormField name="confirmPassword" label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
      <Button type="submit" className="w-full">Create account</Button>
    </form>
  );
}
