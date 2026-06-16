import { Edit, Trash2, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { EmployeeEditDialog } from "./EmployeeEditDialog";
import { EmployeeWithDetails } from "@/hooks/useEmployees";
import { Employee } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDeleteEmployee } from "@/hooks/useEmployees";

interface Props {
  employee: EmployeeWithDetails;
}

export const EmployeeHeader = ({ employee }: Props) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const deleteEmployee = useDeleteEmployee();
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDelete = async () => {
    if (confirm(`Tem certeza que deseja excluir ${displayName}?`)) {
      try {
        await deleteEmployee.mutateAsync(employee.id);
        toast.success("Funcionário excluído com sucesso");
        navigate("/employees");
      } catch (error) {
        toast.error("Erro ao excluir funcionário");
      }
    }
  };

  const legacy = employee as { name?: string | null; avatar?: string | null };
  const displayName = employee.full_name ?? legacy.name ?? "Sem nome";
  const avatarSrc = employee.avatar_url || legacy.avatar || undefined;
  const roleLabel = employee.role || employee.position || "-";
  const departmentLabel = employee.department ?? "-";

  return (
    <div className="flex items-start justify-between rounded-lg bg-card p-6">
      <div className="flex gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={avatarSrc} alt={displayName} />
          <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <Badge variant={employee.status === "active" ? "default" : "secondary"}>
              {employee.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {roleLabel} - {departmentLabel}
          </p>
          <div className="mt-2 flex gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Mail className="h-4 w-4" /> {employee.email}
            </span>
            {employee.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" /> {employee.phone}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setIsEditOpen(true)}>
          <Edit className="mr-2 h-4 w-4" /> Editar
        </Button>
        <Button variant="destructive" onClick={handleDelete} disabled={deleteEmployee.isPending}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <EmployeeEditDialog
        employee={employee as unknown as Employee}
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </div>
  );
};
