import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface PasswordResetRequest {
  id: string;
  user_email: string;
  user_name: string | null;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  reviewer_notes: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export function usePasswordResetRequests() {
  const queryClient = useQueryClient();

  // Fetch all requests (admin)
  const {
    data: requests = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["password-reset-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("password_reset_requests")
        .select("*")
        .order("requested_at", { ascending: false });

      if (error) throw error;
      return data as PasswordResetRequest[];
    },
  });

  // Create request (public)
  const createRequestMutation = useMutation({
    mutationFn: async ({
      email,
      name,
      reason,
    }: {
      email: string;
      name?: string;
      reason?: string;
    }) => {
      const { error } = await supabase.from("password_reset_requests").insert([
        {
          user_email: email,
          user_name: name,
          reason: reason,
          ip_address: null, // Would need edge function to get real IP
          user_agent: navigator.userAgent,
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Solicitação enviada! Aguarde aprovação do administrador.");
    },
    onError: (error) => {
      logger.error("Error creating request:", error);
      toast.error("Erro ao enviar solicitação");
    },
  });

  // Approve request (admin)
  const approveRequestMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Update status
      const { error: updateError } = await supabase
        .from("password_reset_requests")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          reviewer_notes: notes,
        })
        .eq("id", id);

      if (updateError) throw updateError;

      // Get request details
      const { data: request } = await supabase
        .from("password_reset_requests")
        .select("user_email")
        .eq("id", id)
        .single();

      if (!request) throw new Error("Request not found");

      // Call edge function to send reset email
      const { error: fnError } = await supabase.functions.invoke("send-password-reset", {
        body: { email: request.user_email },
      });

      if (fnError) throw fnError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["password-reset-requests"] });
      toast.success("Solicitação aprovada e email de reset enviado");
    },
    onError: (error) => {
      logger.error("Error approving request:", error);
      toast.error("Erro ao aprovar solicitação");
    },
  });

  // Reject request (admin)
  const rejectRequestMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("password_reset_requests")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          reviewer_notes: notes,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["password-reset-requests"] });
      toast.success("Solicitação rejeitada");
    },
    onError: (error) => {
      logger.error("Error rejecting request:", error);
      toast.error("Erro ao rejeitar solicitação");
    },
  });

  // Delete request (admin)
  const deleteRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("password_reset_requests").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["password-reset-requests"] });
      toast.success("Solicitação removida");
    },
    onError: (error) => {
      logger.error("Error deleting request:", error);
      toast.error("Erro ao remover solicitação");
    },
  });

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const approvedRequests = requests.filter((r) => r.status === "approved");
  const rejectedRequests = requests.filter((r) => r.status === "rejected");

  return {
    requests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    isLoading,
    refetch,
    createRequest: createRequestMutation.mutate,
    approveRequest: approveRequestMutation.mutate,
    rejectRequest: rejectRequestMutation.mutate,
    deleteRequest: deleteRequestMutation.mutate,
    isCreating: createRequestMutation.isPending,
    isApproving: approveRequestMutation.isPending,
    isRejecting: rejectRequestMutation.isPending,
    isDeleting: deleteRequestMutation.isPending,
  };
}
