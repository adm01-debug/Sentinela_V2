# Sentinela Mobile App

Aplicativo móvel para monitoramento de funcionários (Android e iOS).

## Visão Geral

O Mobile App permite:
- Rastreamento de localização GPS
- Check-in/Check-out de ponto
- Visualização de relatórios
- Notificações push
- Geofencing

## Tecnologias

- React Native 0.73+
- Expo SDK 50
- TypeScript
- React Navigation 6
- TanStack Query
- Zustand (estado)
- NativeWind (styling)

## Arquitetura

```
mobile-app/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx         # Home
│   │   ├── location.tsx      # Rastreamento
│   │   ├── reports.tsx       # Relatórios
│   │   └── profile.tsx       # Perfil
│   ├── _layout.tsx
│   └── auth/
│       ├── login.tsx
│       └── register.tsx
├── components/
│   ├── ui/
│   ├── maps/
│   └── charts/
├── hooks/
├── services/
├── stores/
├── utils/
├── app.json
├── package.json
└── tsconfig.json
```

## Requisitos

- Node.js 18+
- Expo CLI
- Android Studio (para Android)
- Xcode (para iOS)
- Conta Expo EAS

## Instalação

### Desenvolvimento

```bash
cd mobile-app
npm install
npx expo start
```

### Build

```bash
# Preview (interno)
eas build --profile preview --platform all

# Production
eas build --profile production --platform all
```

## Configuração

### app.json

```json
{
  "expo": {
    "name": "Sentinela",
    "slug": "sentinela",
    "version": "1.0.0",
    "orientation": "portrait",
    "scheme": "sentinela",
    "plugins": [
      "expo-location",
      "expo-notifications",
      "@react-native-firebase/app"
    ],
    "android": {
      "package": "com.sentinela.app",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION"
      ]
    },
    "ios": {
      "bundleIdentifier": "com.sentinela.app",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "...",
        "NSLocationAlwaysUsageDescription": "...",
        "UIBackgroundModes": ["location", "fetch"]
      }
    }
  }
}
```

## Funcionalidades

### Rastreamento de Localização

```typescript
import * as Location from 'expo-location';

// Permissão
const { status } = await Location.requestForegroundPermissionsAsync();

// Background tracking
await Location.startLocationUpdatesAsync('LOCATION_TASK', {
  accuracy: Location.Accuracy.High,
  timeInterval: 60000,
  distanceInterval: 100,
  foregroundService: {
    notificationTitle: 'Sentinela',
    notificationBody: 'Rastreamento ativo',
  },
});
```

### Geofencing

```typescript
// Criar geofence
await Location.startGeofencingAsync('GEOFENCE_TASK', [
  {
    identifier: 'office',
    latitude: -23.550520,
    longitude: -46.633308,
    radius: 100,
    notifyOnEnter: true,
    notifyOnExit: true,
  },
]);
```

### Push Notifications

```typescript
import * as Notifications from 'expo-notifications';

// Token FCM
const token = await Notifications.getExpoPushTokenAsync();

// Listener
Notifications.addNotificationReceivedListener(notification => {
  // Handle notification
});
```

### Check-in/Check-out

```typescript
interface TimeEntry {
  id: string;
  employeeId: string;
  type: 'check_in' | 'check_out';
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
  };
  photo?: string;
}
```

## API de Comunicação

### Endpoints Mobile

```typescript
// Check-in
POST /api/mobile/checkin
{
  "latitude": -23.550520,
  "longitude": -46.633308,
  "photo": "base64..."
}

// Enviar localização
POST /api/mobile/location
{
  "latitude": -23.550520,
  "longitude": -46.633308,
  "accuracy": 10,
  "timestamp": "2024-01-15T09:00:00Z"
}

// Buscar geofences
GET /api/mobile/geofences
```

## Estado Global (Zustand)

```typescript
interface AppState {
  user: User | null;
  isTracking: boolean;
  lastLocation: Location | null;
  
  setUser: (user: User) => void;
  setTracking: (tracking: boolean) => void;
  setLocation: (location: Location) => void;
}

const useAppStore = create<AppState>((set) => ({
  user: null,
  isTracking: false,
  lastLocation: null,
  
  setUser: (user) => set({ user }),
  setTracking: (isTracking) => set({ isTracking }),
  setLocation: (lastLocation) => set({ lastLocation }),
}));
```

## Navegação

```typescript
// app/_layout.tsx
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

// app/(tabs)/_layout.tsx
export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="location" options={{ title: 'Localização' }} />
      <Tabs.Screen name="reports" options={{ title: 'Relatórios' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
```

## Offline Support

```typescript
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Queue de sincronização
const syncQueue = {
  add: async (data: any) => {
    const queue = await AsyncStorage.getItem('syncQueue') || '[]';
    const items = JSON.parse(queue);
    items.push(data);
    await AsyncStorage.setItem('syncQueue', JSON.stringify(items));
  },
  
  process: async () => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) return;
    
    const queue = await AsyncStorage.getItem('syncQueue') || '[]';
    const items = JSON.parse(queue);
    
    for (const item of items) {
      await api.sync(item);
    }
    
    await AsyncStorage.removeItem('syncQueue');
  },
};
```

## Segurança

### Autenticação

- JWT armazenado em SecureStore
- Refresh token automático
- Biometria opcional

```typescript
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('token', token);
const token = await SecureStore.getItemAsync('token');
```

### Permissões

```typescript
const requestPermissions = async () => {
  // Localização
  const { status: locationStatus } = 
    await Location.requestForegroundPermissionsAsync();
  
  // Background location
  const { status: bgStatus } = 
    await Location.requestBackgroundPermissionsAsync();
  
  // Notificações
  const { status: notifStatus } = 
    await Notifications.requestPermissionsAsync();
  
  return {
    location: locationStatus === 'granted',
    backgroundLocation: bgStatus === 'granted',
    notifications: notifStatus === 'granted',
  };
};
```

## Testes

```bash
# Unit tests
npm run test

# E2E com Detox
npm run test:e2e

# Coverage
npm run test:coverage
```

## Publicação

### Google Play

```bash
eas build --platform android --profile production
eas submit --platform android
```

### App Store

```bash
eas build --platform ios --profile production
eas submit --platform ios
```

## Troubleshooting

### Localização não funciona

1. Verificar permissões concedidas
2. Verificar se GPS está ativo
3. Android: Verificar modo de bateria
4. iOS: Verificar "Always Allow"

### Push não chega

1. Verificar token FCM
2. Verificar certificados APNS
3. Verificar configuração do Firebase

### App trava

1. Verificar logs com `expo start --dev-client`
2. Limpar cache: `expo start -c`
3. Reinstalar dependências

## Contribuição

1. Fork o repositório
2. Crie uma branch
3. Faça as alterações
4. Abra um Pull Request
