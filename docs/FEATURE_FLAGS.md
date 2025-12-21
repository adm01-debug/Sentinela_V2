# Feature Flags

## Configuration
```typescript
const flags = {
  newDashboard: true,
  betaFeatures: false,
  darkMode: true,
};
```

## Usage
```typescript
if (flags.newDashboard) {
  // Show new dashboard
}
```