import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API } from "@/constants";

interface LoginData { email: string; password: string; }
interface User { id: string; email: string; name: string; }

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: LoginData) => {
      const res = await fetch(`${API.BASE_URL}${API.ENDPOINTS.AUTH.LOGIN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Login failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await fetch(`${API.BASE_URL}${API.ENDPOINTS.AUTH.LOGOUT}`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useCurrentUser() {
  return useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch(`${API.BASE_URL}/auth/me`);
      if (!res.ok) throw new Error("Not authenticated");
      return res.json();
    },
    retry: false,
  });
}
