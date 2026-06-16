import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useAlertRules } from "@/hooks/useAlerts";
import { supabase } from "@/integrations/supabase/client";

interface AlertRule {
  id: string;
  name: string;
  status: string;
  category?: string;
}

export default function AlertRulesPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: rulesData, isLoading } = useAlertRules();
  const queryClient = useQueryClient();

  const rules = (rulesData || []) as AlertRule[];

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("application_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-rules"] });
    },
  });

  const toggleRule = useMutation({
    mutationFn: async (id: string) => {
      const rule = rules.find((r) => r.id === id);
      if (!rule) return;
      const newStatus = rule.status === "allowed" ? "blocked" : "allowed";
      const { error } = await supabase
        .from("application_rules")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-rules"] });
    },
  });

  if (isLoading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Regras de Alerta</h1>
        <Link to="/alerts/rules/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Regra
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <CardTitle className="text-base">{rule.name}</CardTitle>
              </div>
              <Switch
                checked={rule.status === "allowed"}
                onCheckedChange={() => toggleRule.mutate(rule.id)}
              />
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant={rule.status === "blocked" ? "destructive" : "secondary"}>
                  {rule.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Categoria: {rule.category || "N/A"}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setDeleteId(rule.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir regra?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteRule.mutate(deleteId!);
                setDeleteId(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
