# Mobile App Documentation

## Overview

Sentinela Mobile is a React Native app built with Expo for employee monitoring on mobile devices.

## Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: React Context + TanStack Query
- **Backend**: Supabase
- **Push Notifications**: Expo Notifications

## Project Structure

```
mobile-app/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home screen
│   │   ├── location.tsx   # Location tracking
│   │   ├── reports.tsx    # Reports screen
│   │   └── profile.tsx    # User profile
├── components/            # Reusable components
├── src/
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   └── services/         # API services
└── __tests__/            # Test files
```

## Features

- Real-time location tracking
- Activity monitoring
- Push notifications
- Offline support
- Biometric authentication

## Getting Started

```bash
cd mobile-app
npm install
npx expo start
```

## Building

```bash
# Development build
npx eas build --platform ios --profile development
npx eas build --platform android --profile development

# Production build
npx eas build --platform all --profile production
```

## Environment Variables

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```
