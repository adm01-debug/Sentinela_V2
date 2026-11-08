# Codex CLI — baseline deste repositório

Suplementa o `AGENTS.md` da raiz (que é a fonte das regras). Responda em PT-BR.

## Skill do repo

- Skill para Codex: `.agents/skills/sentinela-v2/SKILL.md`
- Skill equivalente para Claude: `.claude/skills/sentinela-v2/SKILL.md`
- Os dois arquivos são idênticos — alterou um, altere o outro no mesmo commit.
- Credenciais e MCPs privados ficam em `~/.codex/config.toml`, nunca neste repo.

## Baseline de MCP

Trate `.codex/config.toml` como o baseline seguro para trabalho neste repositório.

## Multi-agente

- Explorer: levantamento de evidência, somente leitura
- Reviewer: correção, segurança e regressão
- Docs researcher: verificação de API e release notes

## Leitura obrigatória antes de agir

`AGENTS.md` → `docs/agentes/mapa-repo.md` → o tema que você vai tocar (`banco.md`, `github-ci.md`,
`deploy-infra.md`, `regras-dominio.md`, `desktop-agent.md`) → `ESTADO_ATUAL.md` para qualquer
afirmação sobre o banco.
