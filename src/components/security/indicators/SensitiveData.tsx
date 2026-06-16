import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface SensitiveDataProps {
  data: string;
  className?: string;
}

export const SensitiveData: React.FC<SensitiveDataProps> = ({ data, className }) => {
  const [visible, setVisible] = React.useState(false);
  const maskedData = data.replace(/./g, "•");

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="font-mono">{visible ? data : maskedData}</span>
      <button
        onClick={() => setVisible(!visible)}
        className="rounded-md p-1 transition-colors hover:bg-muted"
        aria-label={visible ? "Hide" : "Show"}
      >
        {visible ? (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Eye className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
    </div>
  );
};
