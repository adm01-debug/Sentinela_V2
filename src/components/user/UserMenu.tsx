import { User, Settings, LogOut, HelpCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/user/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

export function UserMenu() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const displayName = user.name || user.email?.split("@")[0] || "Usuário";
  const displayEmail = user.email || "";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
        <UserAvatar name={displayName} avatarUrl={user.avatar} className="h-8 w-8" />
        <span className="hidden text-sm font-medium md:block">{displayName}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{displayName}</p>
          <p className="text-xs text-muted-foreground">{displayEmail}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings/profile">
            <User className="mr-2 h-4 w-4" />
            Meu Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/help">
            <HelpCircle className="mr-2 h-4 w-4" />
            Ajuda
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
