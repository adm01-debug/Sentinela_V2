# Guia de Instalação

## Requisitos

- Node.js 18+
- npm 9+ ou pnpm
- Git
- Conta Supabase
- Conta Mapbox (opcional)

## Instalação Rápida

```bash
# Clone o repositório
git clone https://github.com/adm01-debug/sentinela.git
cd sentinela

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Execute em desenvolvimento
npm run dev
```

## Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Copie as credenciais para `.env`
3. Execute as migrations:
   ```bash
   npx supabase db push
   ```

## Configuração do Desktop Agent

```bash
cd desktop-agent
npm install
npm run dev
```

## Configuração do Mobile App

```bash
cd mobile-app
npm install
npx expo start
```

## Verificação

```bash
npm run build
npm run test
```
