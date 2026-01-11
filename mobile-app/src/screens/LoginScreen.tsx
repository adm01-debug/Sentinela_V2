import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuthContext } from '../context/AuthContext';
export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthContext();
  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Error', 'Please fill in all fields'); return; }
    setIsLoading(true);
    try { await login(email, password); }
    catch (error) { Alert.alert('Login Failed', error.message || 'Please check your credentials'); }
    finally { setIsLoading(false); }
  };
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.form}>
        <Text style={styles.title}>Sentinela</Text>
        <Text style={styles.subtitle}>Employee Monitoring</Text>
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleLogin} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#fff' }, form: { flex: 1, justifyContent: 'center', padding: 24 }, title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#007AFF' }, subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 32 }, input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 16 }, button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12 }, buttonDisabled: { opacity: 0.6 }, buttonText: { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: '600' } });