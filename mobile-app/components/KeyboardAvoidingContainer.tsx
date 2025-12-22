import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

interface Props { children: React.ReactNode; }

export function KeyboardAvoidingContainer({ children }: Props) {
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });