# React Contexts

## Overview

React contexts for global state.

## Available Contexts

- `AuthContext` - Authentication
- `ThemeContext` - Theme management
- `NotificationContext` - Notifications

## Usage

```typescript
import { useTheme } from "@/contexts/ThemeContext";
const { theme, setTheme } = useTheme();
```
