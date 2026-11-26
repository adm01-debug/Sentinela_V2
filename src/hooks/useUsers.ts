import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  createdAt: string;
}

interface ProfileRow {
  id: string;
  full_name?: string | null;
  email?: string | null;
  created_at: string;
}

interface UpdateUserData {
  full_name?: string;
  email?: string;
}

export interface UserCompanyLink {
  companyId: string;
  companyName: string;
}

export interface UserDetail extends UserProfile {
  roles: string[];
  companies: UserCompanyLink[];
}

export interface InviteUserInput {
  email: string;
  role?: string;
  full_name?: string;
}

/**
 * `roles` vem de `user_roles`, a tabela que o AuthProvider le para autorizar.
 * Antes o papel era fixo "user", entao a lista mostrava "user" ate para admin.
 */
const mapProfileToUser = (p: ProfileRow, roles: string[] = []): UserProfile => ({
  id: p.id,
  name: p.full_name || p.email?.split("@")[0] || "Unknown",
  email: p.email || "",
  role: roles[0] ?? "user",
  avatar: null,
  createdAt: p.created_at,
});

/** Le `user_roles` dos ids informados e devolve mapa id -> papeis. */
const fetchRolesByUser = async (ids: string[]): Promise<Map<string, string[]>> => {
  const mapa = new Map<string, string[]>();
  if (!ids.length) return mapa;
  const { data, error } = await supabase
    .from("user_roles")
    .select("user_id, role")
    .in("user_id", ids);
  if (error) throw error;
  for (const row of data ?? []) {
    const userId = (row as { user_id: string }).user_id;
    const atuais = mapa.get(userId) ?? [];
    atuais.push(String((row as { role: string }).role));
    mapa.set(userId, atuais);
  }
  return mapa;
};

/** A mensagem util da edge vem no corpo da resposta, nao em `fnError.message`. */
const edgeErrorMessage = async (fnError: unknown): Promise<string> => {
  const context = (fnError as { context?: Response }).context;
  const body = context
    ? await context
        .clone()
        .json()
        .catch(() => null)
    : null;
  const detail = (body as { error?: string } | null)?.error;
  return detail || (fnError as Error)?.message || "Falha na chamada da funcao";
};

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const profiles = (data || []) as ProfileRow[];
      const roles = await fetchRolesByUser(profiles.map((p) => p.id));
      return profiles.map((p) => mapProfileToUser(p, roles.get(p.id) ?? []));
    },
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      const roles = await fetchRolesByUser([id]);
      return mapProfileToUser(data as ProfileRow, roles.get(id) ?? []);
    },
    enabled: !!id,
  });
};

/** Perfil + papeis + empresas de um usuario (tela /admin/users/:id). */
export const useUserDetail = (id?: string) => {
  return useQuery({
    queryKey: ["user-detail", id],
    enabled: !!id,
    queryFn: async (): Promise<UserDetail> => {
      const userId = id as string;
      const [profileRes, roles] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        fetchRolesByUser([userId]),
      ]);
      if (profileRes.error) throw profileRes.error;
      if (!profileRes.data) throw new Error("Usuario nao encontrado");

      const { data: links, error: linksError } = await supabase
        .from("user_companies")
        .select("company_id, companies(name)")
        .eq("user_id", userId);
      if (linksError) throw linksError;

      const companies = (
        (links ?? []) as Array<{ company_id: string; companies?: { name?: string | null } | null }>
      ).map((row) => ({
        companyId: row.company_id,
        companyName: row.companies?.name ?? row.company_id,
      }));

      return {
        ...mapProfileToUser(profileRes.data as ProfileRow, roles.get(userId) ?? []),
        roles: roles.get(userId) ?? [],
        companies,
      };
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const { data: result, error } = await supabase
        .from("profiles")
        .insert(data)
        .select()
        .maybeSingle();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserData }) => {
      const { data: result, error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

/**
 * Convida um usuario de verdade (edge `admin-invite-user`).
 *
 * Antes este hook era um stub: devolvia `{ email, role }` sem chamar nada, entao
 * o botao "Convidar" nao criava login, nem papel, nem vinculo de empresa.
 */
export const useInviteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: InviteUserInput) => {
      const { data, error: fnError } = await supabase.functions.invoke("admin-invite-user", {
        body: input,
      });
      if (fnError) throw new Error(await edgeErrorMessage(fnError));
      if (data && typeof data === "object" && "error" in data && data.error) {
        throw new Error(String((data as { error: string }).error));
      }
      return data as { user_id: string; email: string; role: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
