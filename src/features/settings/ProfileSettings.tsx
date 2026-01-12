"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/Forms";
import { InfoCard } from "@/components/Cards";

interface Props {
  initialData?: { name: string; email: string; phone?: string };
  onSave?: (data: any) => void;
}

export function ProfileSettings({ initialData, onSave }: Props) {
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.({ name, email, phone });
  };

  return (
    <InfoCard title="Profile" description="Manage your profile information">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField name="name" label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <FormField name="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <FormField name="phone" label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Button type="submit">Save Changes</Button>
      </form>
    </InfoCard>
  );
}
