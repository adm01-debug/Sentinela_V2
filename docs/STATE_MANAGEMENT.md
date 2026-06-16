# State Management

Sentinela uses Zustand for state management with a modular store architecture.

## Store Structure

```
src/stores/
├── authStore.ts      # Authentication state
├── employeeStore.ts  # Employee data
├── screenshotStore.ts # Screenshots
├── settingsStore.ts  # App settings
├── uiStore.ts        # UI state
└── index.ts          # Barrel exports
```

## Creating a Store

```typescript
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface MyStore {
  data: string[];
  addItem: (item: string) => void;
  reset: () => void;
}

export const useMyStore = create<MyStore>()(
  devtools(
    persist(
      (set) => ({
        data: [],
        addItem: (item) => set((state) => ({ data: [...state.data, item] })),
        reset: () => set({ data: [] }),
      }),
      { name: "my-store" }
    )
  )
);
```

## Best Practices

1. Keep stores focused and small
2. Use selectors for derived state
3. Implement reset functions
4. Use devtools in development
