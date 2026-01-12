"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, FormSelect } from "@/components/Forms";
import { useCreateEmployee } from "@/hooks/api";

const departments = [
  { value: "engineering", label: "Engineering" },
  { value: "design", label: "Design" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
];

interface Props {
  onSuccess?: () => void;
}

export function EmployeeForm({ onSuccess }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const { mutate: create, isPending } = useCreateEmployee();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create({ name, email, department, status: "active" }, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField name="name" label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <FormField name="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <FormSelect name="department" label="Department" options={departments} value={department} onChange={setDepartment} required />
      <Button type="submit" disabled={isPending}>{isPending ? "Creating..." : "Create Employee"}</Button>
    </form>
  );
}
