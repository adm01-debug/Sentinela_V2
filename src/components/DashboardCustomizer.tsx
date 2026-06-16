import { useState } from "react";
import { Settings2, GripVertical, RotateCcw, LayoutDashboard, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboardLayout, DashboardWidget } from "@/hooks/useDashboardLayout";
import { cn } from "@/lib/utils";

const widgetIcons: Record<DashboardWidget["type"], string> = {
  stats: "📊",
  chart: "📈",
  alerts: "🚨",
  employees: "👥",
  ranking: "🏆",
  security: "🔒",
  custom: "⚙️",
};

const sizeLabels: Record<NonNullable<DashboardWidget["size"]>, string> = {
  small: "Pequeno (1/4)",
  medium: "Médio (1/3)",
  large: "Grande (2/3)",
  full: "Largura total",
};

export function DashboardCustomizer() {
  const { widgets, toggleWidget, resizeWidget, resetLayout } = useDashboardLayout();

  const [open, setOpen] = useState(false);

  const visibleCount = widgets.filter((w) => w.visible).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          Personalizar
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" />
            Personalizar Dashboard
          </SheetTitle>
          <SheetDescription>
            Escolha quais widgets exibir e seu tamanho.
            {visibleCount} de {widgets.length} widgets visíveis.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-6">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className={cn(
                "flex items-center gap-4 rounded-lg border p-3 transition-colors",
                widget.visible ? "bg-background" : "bg-muted/50 opacity-60"
              )}
            >
              {/* Drag handle */}
              <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />

              {/* Icon e título */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span>{widgetIcons[widget.type]}</span>
                  <span className="truncate font-medium">{widget.title}</span>
                </div>
                <Badge variant="outline" className="mt-1 text-xs">
                  {widget.type}
                </Badge>
              </div>

              {/* Seletor de tamanho */}
              <Select
                value={widget.size || "medium"}
                onValueChange={(value) => resizeWidget(widget.id, value as DashboardWidget["size"])}
                disabled={!widget.visible}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(sizeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Toggle visibilidade */}
              <div className="flex items-center gap-2">
                {widget.visible ? (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
                <Switch checked={widget.visible} onCheckedChange={() => toggleWidget(widget.id)} />
              </div>
            </div>
          ))}
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={resetLayout} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Restaurar padrão
          </Button>
          <Button onClick={() => setOpen(false)}>Concluir</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
