import React from "react";
import { Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EncryptionStatusProps {
  encrypted: boolean;
  algorithm?: string;
  className?: string;
}

export const EncryptionStatus: React.FC<EncryptionStatusProps> = ({
  encrypted,
  algorithm,
  className,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2", className)}>
            {encrypted ? (
              <>
                <Lock className="h-4 w-4 text-success" />
                <span className="text-sm text-success">Encrypted</span>
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">Not Encrypted</span>
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {encrypted
            ? `Data encrypted${algorithm ? ` with ${algorithm}` : ""}`
            : "Data is not encrypted"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
