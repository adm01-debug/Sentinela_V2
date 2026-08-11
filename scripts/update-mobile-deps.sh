#!/bin/bash
# Mobile App Dependency Update Script

cd mobile-app

echo "🔄 Updating mobile dependencies..."

npm install @react-native-async-storage/async-storage@latest
npm install expo-secure-store@latest
npm install react-native-safe-area-context@latest
npm install expo-status-bar@latest
npm install react-native-screens@latest

echo "✅ Mobile dependencies updated!"
