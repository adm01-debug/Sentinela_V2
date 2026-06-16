// UserAvatar component
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  name?: string;
  avatarUrl?: string;
  className?: string;
}

export function UserAvatar({ name, avatarUrl, className }: UserAvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";
  return (
    <Avatar className={className}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
