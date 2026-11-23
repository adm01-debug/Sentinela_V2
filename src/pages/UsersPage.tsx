import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, MoreVertical, Mail, Shield, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUsers, useDeleteUser } from "@/hooks/useUsers";
import { useToast } from "@/hooks/use-toast";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const { data: users } = useUsers();
  const { toast } = useToast();
  const deleteUser = useDeleteUser();
  const filtered = (users || []).filter(
    (u) => !search || u.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (!deletingUserId) return;
    deleteUser.mutate(deletingUserId, {
      onSuccess: () => {
        toast({ title: "Usuário removido" });
        setDeletingUserId(null);
      },
      onError: (e) =>
        toast({ title: "Erro", description: (e as Error).message, variant: "destructive" }),
    });
  };

  const deletingUser = users?.find((u) => u.id === deletingUserId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuários"
        showBackButton={false}
        actions={
          <Link to="/users/invite">
            <Button className="h-9 gap-2">
              <Plus className="h-4 w-4" />
              Convidar
            </Button>
          </Link>
        }
      />

      <div className="relative max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Buscar usuários..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="divide-y p-0">
          {filtered.map((user) => (
            <div key={user.id} className="hover:bg-accent/50 flex items-center justify-between p-4">
              <Link to={`/users/${user.id}`} className="flex flex-1 items-center gap-4">
                <Avatar>
                  <AvatarImage src={user.avatar ?? undefined} />
                  <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                </div>
              </Link>
              <div className="flex items-center gap-4">
                <Badge>
                  {typeof user.role === "object"
                    ? String((user.role as { name?: string })?.name || "")
                    : String(user.role || "")}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        window.location.href = `mailto:${user.email}`;
                      }}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar email
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/users/${user.id}`}>
                        <Shield className="mr-2 h-4 w-4" />
                        Gerenciar permissões
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeletingUserId(user.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remover
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-muted-foreground p-8 text-center">Nenhum usuário encontrado.</div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deletingUserId}
        onOpenChange={(open) => {
          if (!open) setDeletingUserId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. {deletingUser?.name} perderá acesso ao sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
