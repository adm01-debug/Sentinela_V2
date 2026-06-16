import * as React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import { Smartphone, Key, Shield, CheckCircle, Copy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export interface TwoFactorWizardProps {
  onComplete: (code: string) => Promise<void>;
  onCancel?: () => void;
  qrCodeUrl?: string;
  secretKey?: string;
  className?: string;
}

type Step = "intro" | "setup" | "verify" | "complete";

export function TwoFactorWizard({
  onComplete,
  onCancel,
  qrCodeUrl,
  secretKey,
  className,
}: TwoFactorWizardProps) {
  const [step, setStep] = useState<Step>("intro");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "verify") {
      codeInputRef.current?.focus();
    }
  }, [step]);

  const handleCopySecret = useCallback(async () => {
    if (secretKey) {
      await navigator.clipboard.writeText(secretKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [secretKey]);

  const handleVerify = useCallback(async () => {
    if (code.length !== 6) {
      setError("Code must be 6 digits");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onComplete(code);
      setStep("complete");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [code, onComplete]);

  const steps = [
    { id: "intro", label: "Introduction", icon: Shield },
    { id: "setup", label: "Setup", icon: Smartphone },
    { id: "verify", label: "Verify", icon: Key },
    { id: "complete", label: "Complete", icon: CheckCircle },
  ];

  const currentIndex = steps.findIndex((s) => s.id === step);

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <div className="mb-4 flex items-center justify-between">
          {steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <div
                className={cn(
                  "flex flex-col items-center",
                  i <= currentIndex ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2",
                    i <= currentIndex ? "border-primary bg-primary/10" : "border-muted"
                  )}
                >
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="mt-1 text-xs">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn("mx-2 h-0.5 flex-1", i < currentIndex ? "bg-primary" : "bg-muted")}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          {step === "intro" && "Add an extra layer of security to your account"}
          {step === "setup" && "Scan the QR code with your authenticator app"}
          {step === "verify" && "Enter the 6-digit code from your app"}
          {step === "complete" && "2FA has been successfully enabled!"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "intro" && (
          <div className="space-y-4">
            <div className="space-y-2 rounded-lg bg-muted/50 p-4">
              <h4 className="font-medium">What you will need:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• An authenticator app (Google Authenticator, Authy, etc.)</li>
                <li>• Your smartphone</li>
              </ul>
            </div>
            <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Once enabled, you will need your phone to sign in.
              </p>
            </div>
          </div>
        )}
        {step === "setup" && (
          <div className="space-y-4">
            {qrCodeUrl && (
              <div className="flex justify-center rounded-lg bg-white p-4">
                <img src={qrCodeUrl} alt="QR Code" className="h-48 w-48" />
              </div>
            )}
            {secretKey && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Or enter this key manually:</p>
                <div className="flex gap-2">
                  <code className="flex-1 break-all rounded bg-muted p-2 font-mono text-sm">
                    {secretKey}
                  </code>
                  <Button size="icon" variant="outline" onClick={handleCopySecret}>
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        {step === "verify" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="2fa-verification-code" className="text-sm font-medium">
                Verification Code
              </label>
              <Input
                ref={codeInputRef}
                id="2fa-verification-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="text-center text-2xl tracking-widest"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
        )}
        {step === "complete" && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <Badge variant="outline" className="border-green-600 text-green-600">
                2FA Enabled
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Your account is now protected with two-factor authentication.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {step !== "complete" && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        {step === "intro" && <Button onClick={() => setStep("setup")}>Get Started</Button>}
        {step === "setup" && <Button onClick={() => setStep("verify")}>Continue</Button>}
        {step === "verify" && (
          <Button onClick={handleVerify} disabled={loading || code.length !== 6}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Verify & Enable
          </Button>
        )}
        {step === "complete" && (
          <Button onClick={onCancel} className="w-full">
            Done
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
export default TwoFactorWizard;
