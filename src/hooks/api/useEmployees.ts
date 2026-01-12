import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API } from "@/constants";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  status: string;
}

interface EmployeeFilter {
  search?: string;
  department?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function useEmployees(filter: EmployeeFilter = {}) {
  const params = new URLSearchParams();
  Object.entries(filter).forEach(([key, value]) => {
    if (value) params.append(key, String(value));
  });

  return useQuery<{ data: Employee[]; total: number }>({
    queryKey: ["employees", filter],
    queryFn: async () => {
      const res = await fetch(`${API.BASE_URL}${API.ENDPOINTS.EMPLOYEES}?${params}`);
      if (!res.ok) throw new Error("Failed to fetch employees");
      return res.json();
    },
  });
}

export function useEmployee(id: string) {
  return useQuery<Employee>({
    queryKey: ["employee", id],
    queryFn: async () => {
      const res = await fetch(`${API.BASE_URL}${API.ENDPOINTS.EMPLOYEES}/${id}`);
      if (!res.ok) throw new Error("Employee not found");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<Employee, "id">) => {
      const res = await fetch(`${API.BASE_URL}${API.ENDPOINTS.EMPLOYEES}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create employee");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}
