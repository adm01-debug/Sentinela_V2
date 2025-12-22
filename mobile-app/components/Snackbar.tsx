import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

interface Props { visible: boolean; message: string; action?: { label: string; onPress: () => void }; onDismiss: () => void; }

export function Snackbar({ visible, message, action, onDismiss }: Props) {
  if (!visible) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {action && <TouchableOpacity onPress={action.onPress}><Text style={styles.action}>{action.label}</Text></TouchableOpacity>}
    </View>
  );
}

const styles = StyleSheet.create({ container: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#333', padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }, message: { flex: 1, color: '#fff' }, action: { color: '#007AFF', fontWeight: '600', marginLeft: 16 } });