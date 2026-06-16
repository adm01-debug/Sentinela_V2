# Custom Themes Guide

## Creating a Theme

```typescript
// src/themes/custom.ts
export const customTheme = {
  colors: {
    primary: "#1890ff",
    secondary: "#52c41a",
    background: "#f5f5f5",
  },
  fonts: {
    body: "Inter, sans-serif",
  },
};
```

## Applying Theme

```typescript
<ThemeProvider theme={customTheme}>
  <App />
</ThemeProvider>
```

## Dark Mode

Toggle with `useTheme().toggleDarkMode()`
