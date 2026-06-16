import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Clock, Monitor, User } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useScreenshot } from "@/hooks/useScreenshots";

export default function ScreenshotDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: screenshot, isLoading } = useScreenshot(id!);

  if (isLoading)
    return (
      <div className="p-6">
        <Skeleton className="h-96" />
      </div>
    );
  if (!screenshot) return <div className="p-6">Screenshot não encontrado</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <a href={screenshot.url} download>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Baixar
          </Button>
        </a>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <img src={screenshot.url} alt="Screenshot" className="w-full rounded-lg shadow-lg" />
        </div>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{screenshot.employee_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <span>{screenshot.app_name || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(screenshot.captured_at), "dd/MM/yyyy HH:mm:ss")}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
