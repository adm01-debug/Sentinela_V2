#!/usr/bin/env node
// Cruza os jobs do agendador de producao (`cron.job`) com `supabase/functions/`.
//
// Os jobs criados pelo painel vivem no banco, nao no repositorio: foi assim que
// o cron do escalonamento de SLA passou invisivel ate a #268. Sem essa leitura,
// "edge sem chamador no repo" nao prova "codigo morto" e uma limpeza pode
// derrubar automacao que ninguem ve (ver docs/pendencias/_linha-de-base.md).
//
// Uso: node scripts/ci/checar-cron.mjs <resposta-da-management-api.json> [--probe]
//
// Sem `--probe` so compara com o repositorio. Com `--probe` confere o endpoint
// publico das funcoes ausentes do repo (404 = nao existe em producao) e falha
// quando um job aponta para funcao inexistente.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PROJETO = process.env.SUPABASE_PROJECT_REF ?? "jgnmwvzephsozsqmcpzb";
const REF_FUNCAO = /functions\/v1\/([a-z0-9][a-z0-9-]*)/g;

// A resposta vem do wrapper de retry, que imprime o corpo do comando e a linha
// "OK na tentativa N." no mesmo stdout: recorta do primeiro `[`/`{` ao ultimo
// `]`/`}` antes de tentar o parse.
export function extrairJson(texto) {
  const inicio = texto.search(/[[{]/);
  const fim = Math.max(texto.lastIndexOf("}"), texto.lastIndexOf("]"));
  if (inicio < 0 || fim < inicio) return null;
  try {
    return JSON.parse(texto.slice(inicio, fim + 1));
  } catch {
    return null;
  }
}

export function funcoesNoRepo(raiz = RAIZ) {
  return new Set(
    fs
      .readdirSync(path.join(raiz, "supabase/functions"), { withFileTypes: true })
      .filter((entrada) => entrada.isDirectory())
      .map((entrada) => entrada.name)
  );
}

export function referencias(jobs) {
  const porFuncao = new Map();
  for (const job of jobs) {
    for (const achado of String(job?.command ?? "").matchAll(REF_FUNCAO)) {
      const alvo = porFuncao.get(achado[1]) ?? { funcao: achado[1], jobs: [] };
      alvo.jobs.push(job?.jobname ?? `job ${job?.jobid ?? "?"}`);
      porFuncao.set(achado[1], alvo);
    }
  }
  return [...porFuncao.values()].sort((a, b) => a.funcao.localeCompare(b.funcao));
}

export function classificar(jobs, noRepo) {
  const referenciadas = referencias(jobs);
  return {
    referenciadas,
    foraDoRepo: referenciadas.filter((ref) => !noRepo.has(ref.funcao)),
  };
}

export async function statusEmProducao(nome, projeto = PROJETO) {
  try {
    const resposta = await fetch(`https://${projeto}.supabase.co/functions/v1/${nome}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    return resposta.status;
  } catch {
    return 0;
  }
}

async function principal(argv) {
  const [arquivo, ...opcoes] = argv;
  if (!arquivo) {
    console.error("uso: node scripts/ci/checar-cron.mjs <resposta.json> [--probe]");
    return 2;
  }

  const dados = extrairJson(fs.readFileSync(arquivo, "utf8"));
  if (dados === null) {
    console.error("::error::resposta da Management API nao e JSON legivel.");
    return 1;
  }
  if (!Array.isArray(dados)) {
    console.log(`Agendador nao devolveu lista de jobs: ${JSON.stringify(dados).slice(0, 300)}`);
    console.log(
      "Nenhum job lido nesta rodada (auth, pg_cron ausente ou permissao): trate como nao verificado."
    );
    return 0;
  }

  console.log(`jobs no agendador de producao: ${dados.length}`);
  for (const job of dados) {
    console.log(`- ${job?.jobname} [${job?.schedule}] ativo=${job?.active} jobid=${job?.jobid}`);
  }

  const { referenciadas, foraDoRepo } = classificar(dados, funcoesNoRepo());
  console.log(`funcoes referenciadas por jobs: ${referenciadas.length}`);
  for (const ref of referenciadas) {
    const onde = foraDoRepo.includes(ref) ? "fora do repo" : "no repo";
    console.log(`- ${ref.funcao} (${onde}) <- ${ref.jobs.join(", ")}`);
  }

  if (!opcoes.includes("--probe")) return 0;
  if (foraDoRepo.length === 0) {
    console.log("Todos os jobs apontam para funcoes que existem no repositorio.");
    return 0;
  }

  let quebrados = 0;
  for (const ref of foraDoRepo) {
    const status = await statusEmProducao(ref.funcao);
    if (status === 404) quebrados += 1;
    console.log(`- ${ref.funcao}: HTTP ${status} <- ${ref.jobs.join(", ")}`);
  }
  if (quebrados > 0) {
    console.error(
      `::error::${quebrados} job(s) do agendador apontam para funcao inexistente em producao (404).`
    );
    return 1;
  }
  console.log(
    "Nenhum job aponta para funcao inexistente em producao (as ausentes do repo respondem)."
  );
  return 0;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  process.exitCode = await principal(process.argv.slice(2));
}
