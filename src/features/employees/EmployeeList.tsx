"use client";
import { useEmployees } from "@/hooks/api";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(data?.data || []).map((emp: any) => (
          <TableRow key={emp.id}>
            <TableCell>
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
            </TableCell>
            <TableCell>{emp.department}</TableCell>
            <TableCell>{emp.position}</TableCell>
            <TableCell><StatusBadge status={emp.status} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
