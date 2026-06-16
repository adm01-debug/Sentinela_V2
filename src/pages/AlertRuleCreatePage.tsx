import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface RuleFormData {
  name: string;
  category: string;
  status: string;
}

export default function AlertRuleCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createRule = useMutation({
    mutationFn: async (data: RuleFormData) => {
      const { error } = await supabase.from("application_rules").insert({
        name: data.name,
        category: data.category,
        status: data.status || "monitored",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-rules"] });
      toast.success("Regra criada com sucesso");
      navigate("/alerts/rules");
    },
    onError: () => {
      toast.error("Erro ao criar regra");
    },
  });

  const { register, handleSubmit, setValue } = useForm<RuleFormData>();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Nova Regra de Alerta</h1>
      </div>

      <form onSubmit={handleSubmit((data) => createRule.mutate(data))}>
        <Card>
          <CardHeader>
            <CardTitle>Configurar Regra</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Regra</Label>
              <Input
                id="name"
                {...register("name", { required: true })}
                placeholder="Nome da regra"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select onValueChange={(v) => setValue("category", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="productivity">Produtividade</SelectItem>
                  <SelectItem value="communication">Comunicação</SelectItem>
                  <SelectItem value="entertainment">Entretenimento</SelectItem>
                  <SelectItem value="development">Desenvolvimento</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select onValueChange={(v) => setValue("status", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allowed">Permitido</SelectItem>
                  <SelectItem value="blocked">Bloqueado</SelectItem>
                  <SelectItem value="monitored">Monitorado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createRule.isPending}>
              {createRule.isPending ? "Criando..." : "Criar Regra"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
