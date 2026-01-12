import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/helpers";

interface Props {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FormField({
  name,
  label,
  type = "text",
  placeholder,
  error,
  required,
  className,
  value,
  onChange,
}: Props) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={cn(error && "border-destructive")}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
