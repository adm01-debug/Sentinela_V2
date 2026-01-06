import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, Smartphone, Key, CheckCircle, Copy, Loader2 } from "lucide-react";

interface TwoFactorWizardProps {
  onComplete: (code: string) => Promise<void>;
  onCancel?: () => void;
  qrCodeUrl?: string;
  secret?: string;
  className?: string;
}

type Step = "intro" | "setup" | "verify" | "complete";

export function TwoFactorWizard({ onComplete, onCancel, qrCodeUrl = "", secret = "JBSWY3DPEHPK3PXP", className }: TwoFactorWizardProps) {
  const [step, setStep] = React.useState<Step>("intro");
  const [code, setCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const handleCopySecret = async () => { await navigator.clipboard.writeText(secret); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const handleVerify = async () => {
    if (code.length !== 6) { setError("O código deve ter 6 dígitos"); return; }
    setIsLoading(true); setError("");
    try { await onComplete(code); setStep("complete"); } catch { setError("Código inválido."); } finally { setIsLoading(false); }
  };

  const steps = [{ id: "intro", label: "Início" }, { id: "setup", label: "Configurar" }, { id: "verify", label: "Verificar" }, { id: "complete", label: "Concluído" }];
  const currentIndex = steps.findIndex((s) => s.id === step);

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2"><Shield className="h-5 w-5 text-primary" /><CardTitle>Autenticação 2FA</CardTitle></div>
        <div className="flex gap-1">{steps.map((s, i) => (<div key={s.id} className={cn("h-1 flex-1 rounded-full transition-colors", i <= currentIndex ? "bg-primary" : "bg-muted")} />))}</div>
      </CardHeader>
      <CardContent>
        {step === "intro" && (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"><Key className="h-8 w-8 text-primary" /></div>
            <div><h3 className="font-semibold">Proteja sua conta</h3><p className="text-sm text-muted-foreground mt-1">Adicione segurança extra com autenticador.</p></div>
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground"><Smartphone className="h-4 w-4" /><span>Google Authenticator, Authy</span></div>
          </div>
        )}
        {step === "setup" && (
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">Escaneie o QR Code ou use o código:</p>
            {qrCodeUrl && <img src={qrCodeUrl} alt="QR" className="w-48 h-48 mx-auto bg-white p-2 rounded" />}
            <div className="flex items-center justify-center gap-2">
              <code className="px-3 py-1.5 bg-muted rounded font-mono text-sm">{secret}</code>
              <Button variant="ghost" size="icon" onClick={handleCopySecret}>{copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}</Button>
            </div>
          </div>
        )}
        {step === "verify" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">Digite o código de 6 dígitos:</p>
            <div className="space-y-2">
              <Label htmlFor="code">Código</Label>
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" className="text-center text-2xl tracking-widest font-mono" maxLength={6} />
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            </div>
          </div>
        )}
        {step === "complete" && (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle className="h-8 w-8 text-green-600" /></div>
            <div><h3 className="font-semibold text-green-600">2FA Ativado!</h3><p className="text-sm text-muted-foreground mt-1">Sua conta está protegida.</p></div>
            <Badge variant="secondary" className="gap-1"><Shield className="h-3 w-3" /> Ativado</Badge>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        {step !== "complete" && onCancel && <Button variant="outline" onClick={onCancel} className="flex-1">Cancelar</Button>}
        {step === "intro" && <Button onClick={() => setStep("setup")} className="flex-1">Começar</Button>}
        {step === "setup" && <Button onClick={() => setStep("verify")} className="flex-1">Próximo</Button>}
        {step === "verify" && <Button onClick={handleVerify} disabled={isLoading || code.length !== 6} className="flex-1">{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verificar"}</Button>}
        {step === "complete" && <Button onClick={onCancel} className="flex-1">Concluir</Button>}
      </CardFooter>
    </Card>
  );
}

export default TwoFactorWizard;
