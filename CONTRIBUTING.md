# 🤝 Guia de Contribuição

Obrigado pelo interesse em contribuir com o **Sentinela**! Este guia ajudará você a entender nosso processo de desenvolvimento.

---

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Padrões de Código](#padrões-de-código)
- [Commits e Pull Requests](#commits-e-pull-requests)
- [Testes](#testes)
- [Documentação](#documentação)

---

## 📜 Código de Conduta

Ao contribuir, você concorda em manter um ambiente respeitoso e inclusivo:

- ✅ Use linguagem acolhedora e inclusiva
- ✅ Respeite diferentes pontos de vista
- ✅ Aceite críticas construtivas
- ✅ Foque no que é melhor para o projeto
- ❌ Não use linguagem ofensiva ou discriminatória
- ❌ Não faça ataques pessoais

---

## 🚀 Como Contribuir

### 1. Encontre uma Issue

- Procure por issues com label `good first issue` ou `help wanted`
- Comente na issue que deseja trabalhar nela
- Aguarde atribuição antes de começar

### 2. Fork e Clone

```bash
# Fork via GitHub UI, depois:
git clone https://github.com/seu-usuario/sentinela.git
cd sentinela
git remote add upstream https://github.com/adm01-debug/sentinela.git
```

### 3. Crie uma Branch

```bash
git checkout -b feature/sua-feature
# ou
git checkout -b fix/seu-bugfix
```

### 4. Desenvolva

- Siga os [Padrões de Código](#padrões-de-código)
- Escreva testes para novas funcionalidades
- Mantenha commits atômicos e descritivos

### 5. Submeta um Pull Request

```bash
git push origin feature/sua-feature
```

Abra um PR no GitHub com:
- Título descritivo
- Descrição do que foi feito
- Link para a issue relacionada
- Screenshots (se aplicável)

---

## ⚙️ Configuração do Ambiente

### Pré-requisitos

- Node.js 18+
- npm 9+
- Git
- VS Code (recomendado)

### Setup

```bash
# Clone
git clone https://github.com/adm01-debug/sentinela.git
cd sentinela

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Inicie o dev server
npm run dev
```

### Extensões VS Code Recomendadas

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

---

## 📏 Padrões de Código

### TypeScript

```typescript
// ✅ Bom: Tipagem explícita
interface Employee {
  id: string;
  name: string;
  email: string;
}

function getEmployee(id: string): Promise<Employee> {
  // ...
}

// ❌ Ruim: any
function getEmployee(id: any): any {
  // ...
}
```

### React

```tsx
// ✅ Bom: Componente funcional com tipos
interface Props {
  title: string;
  onClick: () => void;
}

export function Button({ title, onClick }: Props) {
  return (
    <button onClick={onClick}>
      {title}
    </button>
  );
}

// ❌ Ruim: Sem tipos, class component desnecessário
export class Button extends React.Component {
  render() {
    return <button>{this.props.title}</button>;
  }
}
```

### Imports

```typescript
// ✅ Ordem correta de imports
// 1. React/externos
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Componentes internos
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 3. Hooks/Utils
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

// 4. Types
import type { Employee } from '@/types';
```

### Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `EmployeeCard.tsx` |
| Hooks | camelCase, prefixo `use` | `useEmployees.ts` |
| Utilitários | camelCase | `formatDate.ts` |
| Constantes | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |
| Types/Interfaces | PascalCase | `Employee`, `UserRole` |

---

## 📝 Commits e Pull Requests

### Conventional Commits

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

#### Tipos

| Tipo | Descrição |
|------|-----------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Documentação |
| `style` | Formatação (não altera código) |
| `refactor` | Refatoração |
| `perf` | Melhoria de performance |
| `test` | Adição/correção de testes |
| `chore` | Manutenção, build, deps |

#### Exemplos

```bash
# Feature
git commit -m "feat(employees): add bulk import functionality"

# Fix
git commit -m "fix(auth): resolve token refresh race condition"

# Docs
git commit -m "docs(readme): update installation instructions"

# Breaking change
git commit -m "feat(api)!: change response format for violations endpoint

BREAKING CHANGE: The response format has changed from array to paginated object"
```

### Template de Pull Request

```markdown
## Descrição

Breve descrição do que foi feito.

## Tipo de mudança

- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Como testar

1. Passo 1
2. Passo 2
3. ...

## Checklist

- [ ] Meu código segue os padrões do projeto
- [ ] Fiz self-review do meu código
- [ ] Adicionei testes que provam que minha correção/feature funciona
- [ ] Testes novos e existentes passam localmente
- [ ] Atualizei a documentação (se necessário)

## Screenshots (se aplicável)

...

## Issue relacionada

Closes #123
```

---

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
npm run test

# Watch mode
npm run test:watch

# Cobertura
npm run test:coverage

# Arquivo específico
npm run test -- useAuth.test.ts
```

### Estrutura de Testes

```
src/
├── hooks/
│   ├── useAuth.tsx
│   └── __tests__/
│       └── useAuth.test.ts
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
```

### Exemplo de Teste

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useEmployees } from '../useEmployees';

describe('useEmployees', () => {
  it('should fetch employees successfully', async () => {
    const { result } = renderHook(() => useEmployees());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
  });
});
```

---

## 📖 Documentação

### JSDoc para Funções Públicas

```typescript
/**
 * Busca funcionários com filtros opcionais.
 * 
 * @param filters - Filtros para a busca
 * @param filters.status - Status do funcionário (active, inactive)
 * @param filters.department - Departamento
 * @returns Lista de funcionários filtrados
 * 
 * @example
 * ```tsx
 * const { data } = useEmployees({ status: 'active' });
 * ```
 */
export function useEmployees(filters?: EmployeeFilters) {
  // ...
}
```

### README em Módulos

Cada módulo complexo deve ter seu próprio README:

```
desktop-agent/
├── README.md        # Documentação do agente
├── src/
└── ...

mobile-app/
├── README.md        # Documentação do app
├── src/
└── ...
```

---

## ❓ Dúvidas?

- Abra uma [Discussion](https://github.com/adm01-debug/sentinela/discussions)
- Entre em contato: dev@promobrindes.com.br

---

**Obrigado por contribuir! 🎉**
