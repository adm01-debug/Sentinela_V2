import React from 'react';
import { View, StyleSheet } from 'react-native';

interface FormProps {
  children: React.ReactNode;
  onSubmit?: () => void;
}

export function Form({ children }: FormProps) {
  return <View style={styles.container}>{children}</View>;
}

interface FormFieldProps {
  children: React.ReactNode;
  error?: string;
}

export function FormField({ children, error }: FormFieldProps) {
  return (
    <View style={styles.field}>
      {children}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

import { Text } from 'react-native';

const styles = StyleSheet.create({
  container: { gap: 16 },
  field: { marginBottom: 12 },
  error: { color: '#EF4444', fontSize: 12, marginTop: 4 },
});
