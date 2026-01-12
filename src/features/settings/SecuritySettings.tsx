"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/Forms";
import { InfoCard } from "@/components/Cards";

interface Props {
  onSave?: (data: any) => void;
}

export function SecuritySettings({ onSave }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return;
    onSave?.({ currentPassword, newPassword });
  };

  return (
    <InfoCard title="Security" description="Update your password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField name="currentPassword" label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
        <FormField name="newPassword" label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        <FormField name="confirmPassword" label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        <Button type="submit">Update Password</Button>
      </form>
    </InfoCard>
  );
}
