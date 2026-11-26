import { CheckCircle2, Crosshair, Loader2, MapPin, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGeofencePositionCheck,
  type GeofencePositionArea,
} from "@/hooks/useGeofencePositionCheck";

interface GeofencePositionCheckProps {
  areas?: GeofencePositionArea[];
}

export function GeofencePositionCheck({ areas = [] }: GeofencePositionCheckProps) {
  const {
    employees,
    employeesLoading,
    employeeId,
    setEmployeeId,
    latitude,
    setLatitude,
    longitude,
    setLongitude,
    applyArea,
    submit,
    isChecking,
    result,
    error,
  } = useGeofencePositionCheck();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Testar posição</CardTitle>
        <CardDescription>
          Verifique se um funcionário está dentro ou fora das cercas cadastradas. A checagem usa a
          mesma regra aplicada pelo aplicativo em campo e registra violação quando a área monitorada
          é restrita.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="position-check-employee">Funcionário</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger id="position-check-employee">
                <SelectValue placeholder={employeesLoading ? "Carregando..." : "Selecione"} />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="position-check-latitude">Latitude</Label>
            <Input
              id="position-check-latitude"
              inputMode="decimal"
              placeholder="-23.55052"
              value={latitude}
              onChange={(event) => setLatitude(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position-check-longitude">Longitude</Label>
            <Input
              id="position-check-longitude"
              inputMode="decimal"
              placeholder="-46.63331"
              value={longitude}
              onChange={(event) => setLongitude(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position-check-area">Usar coordenadas de uma área</Label>
            <Select
              value=""
              onValueChange={(value) => {
                const area = areas.find((item) => item.id === value);
                if (area) applyArea(area);
              }}
              disabled={areas.length === 0}
            >
              <SelectTrigger id="position-check-area">
                <SelectValue placeholder={areas.length === 0 ? "Nenhuma área" : "Escolher área"} />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={submit} disabled={isChecking}>
            {isChecking ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Crosshair className="mr-2 h-4 w-4" />
            )}
            Verificar posição
          </Button>
          {error && (
            <span className="text-destructive text-sm" role="alert">
              {error}
            </span>
          )}
        </div>

        <div aria-live="polite" className="space-y-3">
          {result && (
            <>
              <p className="text-muted-foreground text-sm">
                {new Date(result.timestamp).toLocaleString("pt-BR")} ·{" "}
                {result.violations_count > 0
                  ? `${result.violations_count} violação(ões) registrada(s)`
                  : "Nenhuma violação registrada"}
              </p>
              {result.results.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhuma cerca ativa foi avaliada para esta posição.
                </p>
              ) : (
                <ul className="space-y-2">
                  {result.results.map((row) => (
                    <li
                      key={row.geofence_id}
                      className="bg-muted/40 flex flex-wrap items-center justify-between gap-2 rounded-md px-3 py-2 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        {row.is_inside ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <XCircle className="text-destructive h-4 w-4" />
                        )}
                        {row.geofence_name}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {row.is_inside ? "Dentro da área" : "Fora da área"}
                        {row.event_type ? ` · ${row.event_type}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {!result && !error && (
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              Nenhuma verificação executada ainda.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default GeofencePositionCheck;
