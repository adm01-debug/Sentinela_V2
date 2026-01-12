import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

interface Props {
  title?: string;
  message?: string;
}

export function NotFound({ 
  title = "Page not found", 
  message = "The page you're looking for doesn't exist." 
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-8 max-w-md">{message}</p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go back
        </Button>
        <Button asChild>
          <Link href="/dashboard">
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
