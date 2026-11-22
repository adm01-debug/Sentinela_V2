import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PasswordResetRequestForm } from "@/components/auth/PasswordResetRequestForm";

const schema = z.object({
  email: z.string().email("Email inválido"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"email" | "approval">("email");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({
        title: "Instruções enviadas",
        description: "Verifique seu email para redefinir sua senha.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao enviar email";
      toast({ title: "Erro", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === "approval") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <PasswordResetRequestForm />
        <div className="flex flex-col items-center gap-2">
          <Button variant="link" onClick={() => setMode("email")}>
            Prefiro receber o link por email
          </Button>
          <Link to="/login" className="text-muted-foreground hover:text-primary text-sm">
            Voltar ao login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Esqueceu a senha?</CardTitle>
          <CardDescription>Digite seu email para receber as instruções</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar instruções"}
            </Button>
            <Button type="button" variant="link" size="sm" onClick={() => setMode("approval")}>
              Solicitar redefinição com aprovação do administrador
            </Button>
            <Link to="/login" className="text-muted-foreground hover:text-primary text-sm">
              Voltar ao login
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
