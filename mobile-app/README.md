# Sentinela Mobile App

App mobile do sistema Sentinela para monitoramento de funcionários.

## Tecnologias

- **React Native** com **Expo SDK 50**
- **TypeScript** para tipagem
- **Supabase** para backend
- **React Navigation** para navegação
- **TanStack Query** para gerenciamento de estado

## Funcionalidades

- ✅ Autenticação segura (SecureStore)
- ✅ Tracking de localização em background
- ✅ Sincronização com geofences
- ✅ Notificações push
- ✅ Registro de atividade

## Pré-requisitos

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI (para builds): `npm install -g eas-cli`

## Instalação

```bash
cd mobile-app
npm install
```

## Configuração

Crie um arquivo `.env` com:

```env
EXPO_PUBLIC_SUPABASE_URL=sua_url_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
```

## Executar

```bash
# Desenvolvimento
npm start

# Android
npm run android

# iOS
npm run ios
```

## Build de Produção

```bash
# Configurar EAS
eas build:configure

# Build Android
npm run build:android

# Build iOS
npm run build:ios
```

## Estrutura

```
mobile-app/
├── App.tsx                 # Entry point
├── src/
│   ├── contexts/          # Contextos React
│   │   ├── AuthContext.tsx
│   │   └── LocationContext.tsx
│   ├── screens/           # Telas
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── ActivityScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── components/        # Componentes reutilizáveis
│   ├── hooks/             # Custom hooks
│   └── lib/               # Bibliotecas e utils
│       └── supabase.ts
```

## Permissões Necessárias

### Android
- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`
- `ACCESS_BACKGROUND_LOCATION`
- `FOREGROUND_SERVICE`

### iOS
- `NSLocationWhenInUseUsageDescription`
- `NSLocationAlwaysAndWhenInUseUsageDescription`
- `UIBackgroundModes: location`
