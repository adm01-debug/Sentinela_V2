"use client";
import { useEmployees } from "@/hooks/api";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/helpers";

interface Props {
  filters?: { search?: string; department?: string; status?: string };
  page?: number;
  onPageChange?: (page: number) => void;
}

export function EmployeeList({ filters = {}, page = 1, onPageChange }: Props) {
  const { data, isLoading } = useEmployees({ ...filters, page });

  const columns = [
    {
      key: "name",
      header: "Employee",
      render: (emp: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={emp.avatar} />
            <AvatarFallback>{initials(emp.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{emp.name}</div>
            <div className="text-sm text-muted-foreground">{emp.email}</div>
          </div>
        </div>
      ),
    },
    { key: "department", header: "Department" },
    { key: "position", header: "Position" },
    {
      key: "status",
      header: "Status",
      render: (emp: any) => <StatusBadge status={emp.status} />,
    },
  ];

  return (
    <DataTable
      data={data?.data || []}
      columns={columns}
      isLoading={isLoading}
      page={page}
      totalPages={Math.ceil((data?.total || 0) / 20)}
      onPageChange={onPageChange}
      emptyMessage="No employees found"
    />
  );
}
