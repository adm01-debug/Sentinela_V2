import React from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { useAuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
export const SettingsScreen = () => {
  const { user, logout } = useAuthContext();
  const { mode, setThemeMode, isDark, theme } = useTheme();
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Logout', style: 'destructive', onPress: logout }]);
  };
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>
        <Text style={{ color: theme.textSecondary }}>{user?.email}</Text>
      </View>
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
        <View style={styles.row}><Text style={{ color: theme.text }}>Dark Mode</Text><Switch value={isDark} onValueChange={(v) => setThemeMode(v ? 'dark' : 'light')} /></View>
      </View>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.error }]} onPress={handleLogout}><Text style={styles.buttonText}>Logout</Text></TouchableOpacity>
    </ScrollView>
  );
};
const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 }, section: { borderRadius: 12, padding: 16, marginBottom: 16 }, sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, button: { padding: 16, borderRadius: 12, marginTop: 16 }, buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 } });