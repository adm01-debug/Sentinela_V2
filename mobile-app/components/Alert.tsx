import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  onClose?: () => void;
}

export function Alert({ type = 'info', title, message, onClose }: AlertProps) {
  const colors = {
    info: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  };

  return (
    <View style={[styles.container, { borderLeftColor: colors[type] }]}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.close}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderLeftWidth: 4,
    padding: 12,
    marginVertical: 4,
  },
  content: { flex: 1 },
  title: { fontWeight: '600', fontSize: 14, color: '#111827' },
  message: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  close: { padding: 4 },
  closeText: { fontSize: 20, color: '#9CA3AF' },
});
