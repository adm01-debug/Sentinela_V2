import { useState } from "react";
import { User, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useUpdateProfile } from "@/hooks/useAuth";

export default function ProfileSettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(
    ((user as unknown as Record<string, unknown>)?.phone as string) || ""
  );

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ name, phone });
      toast({ title: "Perfil atualizado!" });
    } catch (err) {
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Falha ao salvar",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <User className="text-primary h-6 w-6" />
          Configurações de Perfil
        </h1>
        <p className="text-muted-foreground mt-1">Gerencie suas informações pessoais</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="mb-4 flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">
                {name?.charAt(0) || user?.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{name || "Usuário"}</p>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
            </div>
          </div>
          <div>
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
          <Button onClick={handleSave} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {updateProfile.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export { ProfileSettingsPage };
