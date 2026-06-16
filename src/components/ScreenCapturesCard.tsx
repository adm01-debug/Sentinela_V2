import { useState, memo, useEffect, useMemo, ReactNode } from "react";
import {
  Monitor,
  Loader2,
  Maximize2,
  FileText,
  Copy,
  Check,
  Search,
  X,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { logger } from "@/lib/logger";

interface ScreenCapture {
  id: string;
  employee_name: string;
  device: string | null;
  capture_url: string;
  app_name: string | null;
  window_title: string | null;
  captured_at: string;
  extracted_text: string | null;
  ocr_processed_at: string | null;
}

interface SensitiveKeyword {
  rule_value: string;
  severity: string;
}

function ScreenCapturesCardBase() {
  const [captures, setCaptures] = useState<ScreenCapture[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCapture, setSelectedCapture] = useState<ScreenCapture | null>(null);
  const [ocrLoading, setOcrLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sensitiveKeywords, setSensitiveKeywords] = useState<SensitiveKeyword[]>([]);

  useEffect(() => {
    fetchCaptures();
    fetchSensitiveKeywords();
  }, []);

  const fetchCaptures = async () => {
    try {
      const { data, error } = await supabase
        .from("screen_captures")
        .select("*")
        .order("captured_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setCaptures(data || []);
    } catch (error) {
      logger.error("Error fetching screen captures:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSensitiveKeywords = async () => {
    try {
      const { data, error } = await supabase
        .from("violation_rules")
        .select("rule_value, severity")
        .eq("rule_type", "blocked_keyword")
        .eq("is_active", true);

      if (error) throw error;
      setSensitiveKeywords(data || []);
    } catch (error) {
      logger.error("Error fetching sensitive keywords:", error);
    }
  };

  const filteredCaptures = useMemo(() => {
    if (!searchQuery.trim()) return captures.slice(0, 12);

    const query = searchQuery.toLowerCase();
    return captures.filter(
      (capture) =>
        capture.extracted_text?.toLowerCase().includes(query) ||
        capture.employee_name.toLowerCase().includes(query) ||
        capture.window_title?.toLowerCase().includes(query) ||
        capture.app_name?.toLowerCase().includes(query)
    );
  }, [captures, searchQuery]);

  const getOcrStatus = (capture: ScreenCapture) => {
    if (capture.extracted_text) return "completed";
    if (capture.ocr_processed_at) return "no-text";
    const capturedAt = new Date(capture.captured_at).getTime();
    const now = Date.now();
    const twoMinutes = 2 * 60 * 1000;
    if (now - capturedAt < twoMinutes) return "processing";
    return "pending";
  };

  const findSensitiveKeywordsInText = (text: string): { keyword: string; severity: string }[] => {
    if (!text) return [];
    const textLower = text.toLowerCase();
    return sensitiveKeywords
      .filter((kw) => textLower.includes(kw.rule_value.toLowerCase()))
      .map((kw) => ({ keyword: kw.rule_value, severity: kw.severity }));
  };

  const highlightSensitiveText = (text: string): ReactNode => {
    if (!text || sensitiveKeywords.length === 0) return text;

    // Build regex from all sensitive keywords
    const keywordPatterns = sensitiveKeywords
      .map((kw) => kw.rule_value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .filter(Boolean);

    if (keywordPatterns.length === 0) return text;

    const regex = new RegExp(`(${keywordPatterns.join("|")})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) => {
      const matchedKeyword = sensitiveKeywords.find(
        (kw) => kw.rule_value.toLowerCase() === part.toLowerCase()
      );

      if (matchedKeyword) {
        const severityColor =
          matchedKeyword.severity === "critical"
            ? "bg-red-500/30 border-red-500"
            : matchedKeyword.severity === "high"
              ? "bg-orange-500/30 border-orange-500"
              : "bg-yellow-500/30 border-yellow-500";

        return (
          <TooltipProvider key={i}>
            <Tooltip>
              <TooltipTrigger asChild>
                <mark
                  className={`${severityColor} cursor-help rounded border px-1 font-semibold text-foreground`}
                >
                  {part}
                </mark>
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                  <span>
                    Palavra sensível: <strong>{matchedKeyword.rule_value}</strong>
                  </span>
                  <Badge variant="outline" className="ml-1 text-[10px]">
                    {matchedKeyword.severity}
                  </Badge>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      return part;
    });
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="rounded bg-yellow-500/30 px-0.5 text-foreground">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const runOcr = async (capture: ScreenCapture) => {
    setOcrLoading(capture.id);
    try {
      const { data, error } = await supabase.functions.invoke("ocr-screenshot", {
        body: {
          screenshot_id: capture.id,
          screenshot_url: capture.capture_url,
        },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Update local state
      setCaptures((prev) =>
        prev.map((c) =>
          c.id === capture.id
            ? {
                ...c,
                extracted_text: data.extracted_text,
                ocr_processed_at: new Date().toISOString(),
              }
            : c
        )
      );

      if (selectedCapture?.id === capture.id) {
        setSelectedCapture({
          ...selectedCapture,
          extracted_text: data.extracted_text,
          ocr_processed_at: new Date().toISOString(),
        });
      }

      toast.success("Texto extraído com sucesso!");
    } catch (error) {
      logger.error("OCR error:", error);
      toast.error("Erro ao extrair texto da imagem");
    } finally {
      setOcrLoading(null);
    }
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Texto copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            Capturas de Tela
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              Capturas de Tela
            </CardTitle>
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por texto OCR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 pr-8 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          {searchQuery && (
            <p className="mt-2 text-xs text-muted-foreground">
              {filteredCaptures.length} resultado(s) para &quot;{searchQuery}&quot;
            </p>
          )}
        </CardHeader>
        <CardContent>
          {captures.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Nenhuma captura de tela</p>
          ) : filteredCaptures.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Nenhum resultado encontrado para &quot;{searchQuery}&quot;
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {filteredCaptures.map((capture) => (
                <div
                  key={capture.id}
                  role="button"
                  tabIndex={0}
                  className="group relative cursor-pointer overflow-hidden rounded-lg border border-border/50 bg-muted/30"
                  onClick={() => setSelectedCapture(capture)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedCapture(capture);
                    }
                  }}
                >
                  <div className="relative aspect-video">
                    <img
                      src={capture.capture_url}
                      alt={`Captura de ${capture.employee_name}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <Maximize2 className="h-5 w-5 text-white" />
                      {capture.extracted_text && <FileText className="h-5 w-5 text-green-400" />}
                    </div>
                    {/* OCR Status Badge */}
                    <div className="absolute right-1 top-1">
                      {(() => {
                        const status = getOcrStatus(capture);
                        if (status === "completed") {
                          return (
                            <Badge
                              variant="secondary"
                              className="bg-green-500/80 px-1 text-[10px] text-white"
                            >
                              OCR
                            </Badge>
                          );
                        }
                        if (status === "processing") {
                          return (
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1 bg-blue-500/80 px-1 text-[10px] text-white"
                            >
                              <Loader2 className="h-2.5 w-2.5 animate-spin" />
                              OCR
                            </Badge>
                          );
                        }
                        if (status === "no-text") {
                          return (
                            <Badge
                              variant="secondary"
                              className="bg-gray-500/80 px-1 text-[10px] text-white"
                            >
                              Sem texto
                            </Badge>
                          );
                        }
                        return (
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1 bg-amber-500/80 px-1 text-[10px] text-white"
                          >
                            <Clock className="h-2.5 w-2.5" />
                            Pendente
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="truncate text-sm font-medium">
                      {highlightMatch(capture.employee_name, searchQuery)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {highlightMatch(
                        capture.window_title || capture.app_name || "Desktop",
                        searchQuery
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(capture.captured_at).toLocaleString("pt-BR")}
                    </p>
                    {searchQuery &&
                      capture.extracted_text?.toLowerCase().includes(searchQuery.toLowerCase()) && (
                        <p className="mt-1 truncate text-xs text-green-600 dark:text-green-400">
                          <FileText className="mr-1 inline h-3 w-3" />
                          Texto OCR contém &quot;{searchQuery}&quot;
                        </p>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedCapture} onOpenChange={() => setSelectedCapture(null)}>
        <DialogContent className="max-h-[90vh] max-w-5xl">
          {selectedCapture && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{selectedCapture.employee_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCapture.window_title || selectedCapture.app_name || "Desktop"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(selectedCapture.captured_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedCapture.device && (
                    <Badge variant="outline">{selectedCapture.device}</Badge>
                  )}
                  <Button
                    size="sm"
                    variant={selectedCapture.extracted_text ? "outline" : "default"}
                    onClick={() => runOcr(selectedCapture)}
                    disabled={ocrLoading === selectedCapture.id}
                  >
                    {ocrLoading === selectedCapture.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Extraindo...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        {selectedCapture.extracted_text ? "Reprocessar OCR" : "Extrair Texto (OCR)"}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="image" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="image">Imagem</TabsTrigger>
                  <TabsTrigger value="text" disabled={!selectedCapture.extracted_text}>
                    Texto Extraído
                    {selectedCapture.extracted_text && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        OCR
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="image" className="mt-4">
                  <img
                    src={selectedCapture.capture_url}
                    alt={`Captura de ${selectedCapture.employee_name}`}
                    className="w-full rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </TabsContent>

                <TabsContent value="text" className="mt-4">
                  {selectedCapture.extracted_text && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">
                            Processado em:{" "}
                            {selectedCapture.ocr_processed_at
                              ? new Date(selectedCapture.ocr_processed_at).toLocaleString("pt-BR")
                              : "N/A"}
                          </p>
                          {(() => {
                            const foundKeywords = findSensitiveKeywordsInText(
                              selectedCapture.extracted_text!
                            );
                            if (foundKeywords.length > 0) {
                              return (
                                <Badge
                                  variant="destructive"
                                  className="flex items-center gap-1 text-xs"
                                >
                                  <AlertTriangle className="h-3 w-3" />
                                  {foundKeywords.length} palavra(s) sensível(is)
                                </Badge>
                              );
                            }
                            return null;
                          })()}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyText(selectedCapture.extracted_text!)}
                        >
                          {copied ? (
                            <Check className="mr-1 h-4 w-4" />
                          ) : (
                            <Copy className="mr-1 h-4 w-4" />
                          )}
                          Copiar
                        </Button>
                      </div>
                      <ScrollArea className="h-[400px] rounded-lg border bg-muted/30 p-4">
                        <pre className="whitespace-pre-wrap font-mono text-sm">
                          {highlightSensitiveText(selectedCapture.extracted_text)}
                        </pre>
                      </ScrollArea>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Memo wrappers
export const ScreenCapturesCard = memo(ScreenCapturesCardBase);
