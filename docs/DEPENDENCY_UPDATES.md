# Dependency Update Status

## Pending Updates (from Dependabot)

### Main App
- [ ] @vitest/ui: 2.1.9 → 4.0.16
- [ ] @radix-ui/react-dialog: 1.1.14 → 1.1.15
- [ ] sonner: 1.7.4 → 2.0.7
- [ ] react, @types/react: Update to latest
- [ ] @radix-ui/react-switch: 1.2.5 → 1.2.6
- [ ] recharts: 2.15.4 → 3.6.0
- [ ] @radix-ui/react-navigation-menu: 1.2.13 → 1.2.14
- [ ] tailwindcss: 3.4.17 → 4.1.18

### Mobile App
- [ ] @react-native-async-storage/async-storage: 1.24.0 → 2.2.0
- [ ] expo-secure-store: 13.0.2 → 15.0.8
- [ ] react-native-safe-area-context: 4.8.2 → 5.6.2
- [ ] expo-status-bar: 1.11.1 → 3.0.9
- [ ] react-native-screens: 3.29.0 → 4.19.0

### Desktop Agent
- [ ] node-fetch: 2.7.0 → 3.3.2
- [ ] electron-store: 8.2.0 → 11.0.2
- [ ] electron: 28.3.3 → 39.2.7
- [ ] @types/uuid: 9.0.8 → 11.0.0
- [ ] uuid: 9.0.1 → 13.0.0

### CI/CD
- [ ] actions/setup-node: 4 → 6
- [ ] actions/checkout: 4 → 6
- [ ] codecov/codecov-action: 4 → 5
- [ ] treosh/lighthouse-ci-action: 11 → 12

## Update Instructions

```bash
# Run the update script
./scripts/update-deps.sh

# For mobile app
./scripts/update-mobile-deps.sh

# For desktop agent
./scripts/update-desktop-deps.sh
```

## Notes

- Always test after updating
- Check breaking changes in changelogs
- Update one major version at a time for large updates
