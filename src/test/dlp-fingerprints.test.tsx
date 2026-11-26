import { webcrypto } from "node:crypto";
import { beforeAll, describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  ACTIONS,
  ACTION_LABEL,
  CHUNK_SIZE,
  EMPTY_DOCUMENT_FORM,
  MAX_CHUNKS_PER_DOCUMENT,
  MIN_CHUNK_CHARS,
  ROW_LIMIT,
  SEVERITIES,
  buildFingerprintRows,
  chunkText,
  filterDocuments,
  formatChunkLabel,
  groupDocuments,
  isTextFile,
  normalizeText,
  sha256Hex,
  useDlpFingerprintsPage,
  validateDocumentForm,
  type DocumentFormData,
  type FingerprintRow,
} from "@/hooks/useDlpFingerprintsPage";
import { supabase } from "@/integrations/supabase/client";

const { toastMock } = vi.hoisted(() => ({ toastMock: vi.fn() }));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastMock }) }));

beforeAll(() => {
  if (!globalThis.crypto?.subtle) {
    vi.stubGlobal("crypto", webcrypto);
  }
});

const LONG_TEXT = "Contrato confidencial de prestacao de servicos. ".repeat(12);

function row(over: Partial<FingerprintRow>): FingerprintRow {
  return {
    id: "f1",
    company_id: "company-1",
    document_name: "contrato.txt",
    document_type: "contrato",
    chunk_hash: "abc",
    chunk_index: 0,
    total_chunks: 2,
    severity: "high",
    action: "block",
    is_active: true,
    created_at: "2026-11-26T10:00:00Z",
    ...over,
  };
}

type Call = [string, unknown[]];

function makeBuilder(result: unknown) {
  const calls: Call[] = [];
  const builder: Record<string, unknown> = {};
  for (const method of ["select", "insert", "order", "limit", "eq", "delete", "update"]) {
    builder[method] = vi.fn((...args: unknown[]) => {
      calls.push([method, args]);
      return builder;
    });
  }
  builder.then = (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
    Promise.resolve(result).then(onFulfilled, onRejected);
  return { builder, calls };
}

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

describe("normalizeText", () => {
  it("colapsa espacos e quebras de linha", () => {
    expect(normalizeText("  a \n\n b\tc  ")).toBe("a b c");
  });

  it("texto vazio continua vazio", () => {
    expect(normalizeText("   \n  ")).toBe("");
  });
});

describe("chunkText", () => {
  it("corta em blocos do tamanho configurado", () => {
    const chunks = chunkText("a".repeat(CHUNK_SIZE * 3));
    expect(chunks).toHaveLength(3);
    expect(chunks.every((chunk) => chunk.length === CHUNK_SIZE)).toBe(true);
  });

  it("descarta a sobra menor que o minimo", () => {
    const text = `${"a".repeat(CHUNK_SIZE)}${"b".repeat(10)}`;
    const chunks = chunkText(text);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toHaveLength(CHUNK_SIZE);
  });

  it("texto curto gera um unico chunk", () => {
    const chunks = chunkText("Documento curto mas acima do minimo de utilidade");
    expect(chunks).toHaveLength(1);
  });

  it("texto sem conteudo util nao gera chunk", () => {
    expect(chunkText("   ")).toEqual([]);
    expect(chunkText("")).toEqual([]);
  });

  it("respeita o teto de chunks por documento", () => {
    const huge = "x".repeat(CHUNK_SIZE * (MAX_CHUNKS_PER_DOCUMENT + 50));
    expect(chunkText(huge)).toHaveLength(MAX_CHUNKS_PER_DOCUMENT);
  });

  it("normaliza antes de cortar", () => {
    const chunks = chunkText(`a\n\nb   c ${"d".repeat(MIN_CHUNK_CHARS)}`);
    expect(chunks[0]).not.toContain("\n");
  });
});

describe("sha256Hex", () => {
  it("bate com o vetor conhecido do SHA-256", async () => {
    expect(await sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
  });

  it("devolve 64 caracteres hexadecimais", async () => {
    const hash = await sha256Hex("texto");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("e deterministico e sensivel ao conteudo", async () => {
    expect(await sha256Hex("abc")).toBe(await sha256Hex("abc"));
    expect(await sha256Hex("abc")).not.toBe(await sha256Hex("abd"));
  });
});

describe("isTextFile", () => {
  it("aceita extensoes de texto", () => {
    expect(isTextFile("contrato.txt")).toBe(true);
    expect(isTextFile("BASE.CSV")).toBe(true);
    expect(isTextFile("dados.json")).toBe(true);
  });

  it("recusa binarios", () => {
    expect(isTextFile("contrato.pdf")).toBe(false);
    expect(isTextFile("contrato.docx")).toBe(false);
    expect(isTextFile("sem-extensao")).toBe(false);
  });
});

describe("formatChunkLabel", () => {
  it("descreve a contagem", () => {
    expect(formatChunkLabel(1, 1)).toBe("1 chunk");
    expect(formatChunkLabel(3, 3)).toBe("3 chunks");
    expect(formatChunkLabel(2, 5)).toBe("2 de 5 chunks");
  });
});

describe("validateDocumentForm", () => {
  const valid: DocumentFormData = {
    documentName: "contrato-mestre.txt",
    documentType: "contrato",
    severity: "high",
    action: "block",
    text: LONG_TEXT,
  };

  it("aceita documento valido", () => {
    expect(validateDocumentForm(valid)).toEqual({});
  });

  it("exige nome com pelo menos 3 caracteres", () => {
    expect(validateDocumentForm({ ...valid, documentName: "ab" }).documentName).toBeTruthy();
  });

  it("bloqueia nome ja registrado, sem diferenciar maiusculas", () => {
    expect(
      validateDocumentForm({ ...valid, documentName: "CONTRATO-MESTRE.TXT" }, [
        "contrato-mestre.txt",
      ]).documentName
    ).toContain("Ja existe");
  });

  it("exige texto minimo", () => {
    expect(validateDocumentForm({ ...valid, text: "curto" }).text).toBeTruthy();
  });

  it("aceita formulario preenchido com o texto do arquivo", () => {
    expect(
      validateDocumentForm({ ...EMPTY_DOCUMENT_FORM, documentName: "doc.txt", text: LONG_TEXT })
    ).toEqual({});
  });
});

describe("groupDocuments", () => {
  it("agrega chunks por documento", () => {
    const documents = groupDocuments([
      row({ id: "1", chunk_index: 0, total_chunks: 2 }),
      row({ id: "2", chunk_index: 1, total_chunks: 2 }),
    ]);
    expect(documents).toHaveLength(1);
    expect(documents[0].storedChunks).toBe(2);
    expect(documents[0].totalChunks).toBe(2);
    expect(documents[0].documentName).toBe("contrato.txt");
  });

  it("documento so fica ativo se todos os chunks estiverem ativos", () => {
    const documents = groupDocuments([
      row({ id: "1", is_active: true }),
      row({ id: "2", is_active: false }),
    ]);
    expect(documents[0].isActive).toBe(false);
  });

  it("ordena do mais recente para o mais antigo", () => {
    const documents = groupDocuments([
      row({ id: "1", document_name: "antigo.txt", created_at: "2026-01-01T00:00:00Z" }),
      row({ id: "2", document_name: "novo.txt", created_at: "2026-11-01T00:00:00Z" }),
    ]);
    expect(documents.map((document) => document.documentName)).toEqual(["novo.txt", "antigo.txt"]);
  });

  it("sem chunks devolve lista vazia", () => {
    expect(groupDocuments([])).toEqual([]);
  });
});

describe("filterDocuments", () => {
  const documents = groupDocuments([
    row({ id: "1", document_name: "contrato.txt" }),
    row({ id: "2", document_name: "folha.csv", severity: "critical", action: "alert" }),
  ]);

  it("busca por nome, severidade e acao", () => {
    expect(filterDocuments(documents, "folha")).toHaveLength(1);
    expect(filterDocuments(documents, "critical")).toHaveLength(1);
    expect(filterDocuments(documents, "alert")).toHaveLength(1);
  });

  it("sem termo devolve tudo", () => {
    expect(filterDocuments(documents, "  ")).toHaveLength(2);
  });
});

describe("buildFingerprintRows", () => {
  it("gera um registro por chunk com hash e indice", async () => {
    const rows = await buildFingerprintRows(
      { ...EMPTY_DOCUMENT_FORM, documentName: "  contrato.txt  ", text: LONG_TEXT },
      "admin-1"
    );
    expect(rows.length).toBeGreaterThan(1);
    expect(rows[0].document_name).toBe("contrato.txt");
    expect(rows[0].chunk_index).toBe(0);
    expect(rows.every((item) => item.total_chunks === rows.length)).toBe(true);
    expect(new Set(rows.map((item) => item.chunk_hash)).size).toBe(rows.length);
    expect(rows[0].created_by).toBe("admin-1");
    expect(rows[0].is_active).toBe(true);
  });

  it("propaga severidade e acao escolhidas", async () => {
    const rows = await buildFingerprintRows(
      {
        ...EMPTY_DOCUMENT_FORM,
        documentName: "doc.txt",
        severity: "critical",
        action: "redact",
        text: LONG_TEXT,
      },
      null
    );
    expect(rows.every((item) => item.severity === "critical" && item.action === "redact")).toBe(
      true
    );
  });

  it("tipo vazio vira null", async () => {
    const rows = await buildFingerprintRows(
      { ...EMPTY_DOCUMENT_FORM, documentName: "doc.txt", documentType: "   ", text: LONG_TEXT },
      null
    );
    expect(rows[0].document_type).toBeNull();
  });

  it("recusa documento sem texto", async () => {
    await expect(
      buildFingerprintRows({ ...EMPTY_DOCUMENT_FORM, documentName: "doc.txt" }, null)
    ).rejects.toThrow("vazio");
  });
});

describe("constantes de dominio", () => {
  it("expoe as acoes e severidades da tabela", () => {
    expect(ACTIONS).toEqual(["alert", "redact", "block"]);
    expect(SEVERITIES).toEqual(["low", "medium", "high", "critical"]);
    expect(ACTION_LABEL.block).toBe("Bloquear");
    expect(ROW_LIMIT).toBe(5000);
  });
});

describe("useDlpFingerprintsPage", () => {
  let result: unknown = { data: [], error: null };
  let calls: Call[] = [];
  let writes: { method: string; args: unknown[] }[] = [];

  beforeEach(() => {
    result = { data: [], error: null };
    calls = [];
    writes = [];
    toastMock.mockClear();
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: "admin-1" } },
      error: null,
    } as never);

    vi.mocked(supabase.from).mockImplementation((() => {
      const { builder, calls: builderCalls } = makeBuilder(result);
      calls = builderCalls;
      for (const method of ["insert", "update", "delete", "eq"]) {
        const original = builder[method] as (...args: unknown[]) => unknown;
        builder[method] = vi.fn((...args: unknown[]) => {
          writes.push({ method, args });
          return original(...args);
        });
      }
      return builder;
    }) as never);
  });

  it("carrega com teto e ordena por criacao", async () => {
    result = { data: [row({ id: "1" })], error: null };
    const { result: hook } = renderHook(() => useDlpFingerprintsPage(), { wrapper });
    await waitFor(() => expect(hook.current.documents).toHaveLength(1));
    expect(calls.find((call) => call[0] === "limit")?.[1]).toEqual([ROW_LIMIT]);
    expect(calls.find((call) => call[0] === "order")?.[1]).toEqual([
      "created_at",
      { ascending: false },
    ]);
  });

  it("agrupa chunks e conta documentos ativos", async () => {
    result = {
      data: [
        row({ id: "1", is_active: true }),
        row({ id: "2", is_active: true }),
        row({ id: "3", document_name: "outro.txt", is_active: false }),
      ],
      error: null,
    };
    const { result: hook } = renderHook(() => useDlpFingerprintsPage(), { wrapper });
    await waitFor(() => expect(hook.current.documents).toHaveLength(2));
    expect(hook.current.totalRows).toBe(3);
    expect(hook.current.activeDocuments).toBe(1);
  });

  it("registra documento inserindo todos os chunks de uma vez", async () => {
    const { result: hook } = renderHook(() => useDlpFingerprintsPage(), { wrapper });
    await waitFor(() => expect(hook.current.isLoading).toBe(false));

    act(() => hook.current.openCreate());
    act(() =>
      hook.current.setFormData({
        documentName: "contrato.txt",
        documentType: "contrato",
        severity: "critical",
        action: "block",
        text: LONG_TEXT,
      })
    );
    act(() => hook.current.handleSubmit());

    await waitFor(() => expect(hook.current.dialogOpen).toBe(false));
    const insert = writes.find((write) => write.method === "insert");
    const payload = insert?.args[0] as unknown[];
    expect(Array.isArray(payload)).toBe(true);
    expect(payload.length).toBeGreaterThan(1);
    expect(payload[0]).toMatchObject({
      document_name: "contrato.txt",
      document_type: "contrato",
      severity: "critical",
      action: "block",
      created_by: "admin-1",
    });
  });

  it("nao registra documento com nome repetido", async () => {
    result = { data: [row({})], error: null };
    const { result: hook } = renderHook(() => useDlpFingerprintsPage(), { wrapper });
    await waitFor(() => expect(hook.current.documents).toHaveLength(1));

    act(() => hook.current.openCreate());
    act(() =>
      hook.current.setFormData({
        ...EMPTY_DOCUMENT_FORM,
        documentName: "contrato.txt",
        text: LONG_TEXT,
      })
    );
    act(() => hook.current.handleSubmit());

    await waitFor(() => expect(hook.current.showErrors).toBe(true));
    expect(writes.filter((write) => write.method === "insert")).toHaveLength(0);
  });

  it("nao registra documento sem texto", async () => {
    const { result: hook } = renderHook(() => useDlpFingerprintsPage(), { wrapper });
    await waitFor(() => expect(hook.current.isLoading).toBe(false));

    act(() => hook.current.openCreate());
    act(() =>
      hook.current.setFormData({ ...EMPTY_DOCUMENT_FORM, documentName: "doc.txt", text: "curto" })
    );
    act(() => hook.current.handleSubmit());

    await waitFor(() => expect(hook.current.showErrors).toBe(true));
    expect(writes).toHaveLength(0);
    expect(hook.current.dialogOpen).toBe(true);
  });

  it("desativa todas as chunks do documento", async () => {
    const document = groupDocuments([row({ id: "1" }), row({ id: "2" })])[0];
    const { result: hook } = renderHook(() => useDlpFingerprintsPage(), { wrapper });
    await waitFor(() => expect(hook.current.isLoading).toBe(false));

    act(() => hook.current.toggleDocument(document));

    await waitFor(() => expect(writes.some((write) => write.method === "update")).toBe(true));
    expect(writes.find((write) => write.method === "update")?.args[0]).toEqual({
      is_active: false,
    });
    expect(writes.find((write) => write.method === "eq")?.args).toEqual([
      "document_name",
      "contrato.txt",
    ]);
  });

  it("ajusta severidade e acao do documento", async () => {
    const document = groupDocuments([row({})])[0];
    const { result: hook } = renderHook(() => useDlpFingerprintsPage(), { wrapper });
    await waitFor(() => expect(hook.current.isLoading).toBe(false));

    act(() => hook.current.openTuning(document));
    act(() => hook.current.setTuningForm({ severity: "critical", action: "alert" }));
    act(() => hook.current.handleTuningSubmit());

    await waitFor(() => expect(hook.current.tuning).toBeNull());
    expect(writes.find((write) => write.method === "update")?.args[0]).toEqual({
      severity: "critical",
      action: "alert",
    });
  });

  it("remove o documento pelo nome", async () => {
    const document = groupDocuments([row({})])[0];
    const { result: hook } = renderHook(() => useDlpFingerprintsPage(), { wrapper });
    await waitFor(() => expect(hook.current.isLoading).toBe(false));

    act(() => hook.current.setRemoving(document));
    act(() => hook.current.handleRemove());

    await waitFor(() => expect(hook.current.removing).toBeNull());
    expect(writes.find((write) => write.method === "delete")).toBeTruthy();
    expect(writes.find((write) => write.method === "eq")?.args).toEqual([
      "document_name",
      "contrato.txt",
    ]);
  });

  it("mantem o dialogo aberto quando o banco recusa", async () => {
    const { result: hook } = renderHook(() => useDlpFingerprintsPage(), { wrapper });
    await waitFor(() => expect(hook.current.isLoading).toBe(false));

    result = { data: null, error: new Error("RLS bloqueou") };
    act(() => hook.current.openCreate());
    act(() =>
      hook.current.setFormData({ ...EMPTY_DOCUMENT_FORM, documentName: "doc.txt", text: LONG_TEXT })
    );
    act(() => hook.current.handleSubmit());

    await waitFor(() => expect(toastMock).toHaveBeenCalled());
    expect(hook.current.dialogOpen).toBe(true);
  });

  it("preenche nome e tipo ao receber arquivo de texto", async () => {
    const { result: hook } = renderHook(() => useDlpFingerprintsPage(), { wrapper });
    await waitFor(() => expect(hook.current.isLoading).toBe(false));

    const file = new File([LONG_TEXT], "folha-pagamento.txt", { type: "text/plain" });
    await act(async () => {
      await hook.current.handleFile(file);
    });

    expect(hook.current.formData.documentName).toBe("folha-pagamento.txt");
    expect(hook.current.formData.documentType).toBe("txt");
    expect(hook.current.formData.text).toBe(LONG_TEXT);
  });

  it("recusa binario sem alterar o formulario", async () => {
    const { result: hook } = renderHook(() => useDlpFingerprintsPage(), { wrapper });
    await waitFor(() => expect(hook.current.isLoading).toBe(false));

    const file = new File(["%PDF-1.4"], "contrato.pdf", { type: "application/pdf" });
    await act(async () => {
      await hook.current.handleFile(file);
    });

    expect(hook.current.formData.documentName).toBe("");
    expect(toastMock.mock.calls[0][0]).toMatchObject({ variant: "destructive" });
  });

  it("filtra a lista de documentos na busca", async () => {
    result = {
      data: [row({ id: "1" }), row({ id: "2", document_name: "folha.csv" })],
      error: null,
    };
    const { result: hook } = renderHook(() => useDlpFingerprintsPage(), { wrapper });
    await waitFor(() => expect(hook.current.documents).toHaveLength(2));

    act(() => hook.current.setTerm("folha"));
    expect(hook.current.visibleDocuments.map((document) => document.documentName)).toEqual([
      "folha.csv",
    ]);
  });
});
