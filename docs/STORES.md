# State Management

## Overview

Zustand stores for state management.

## Stores

- `authStore` - Authentication state
- `uiStore` - UI state

## Usage

```typescript
import { useAuthStore } from "@/stores/authStore";
const { user, isAuthenticated } = useAuthStore();
```
