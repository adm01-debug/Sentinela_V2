import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props { icon?: string; title: string; description?: string; }

export function EmptyState({ icon = '📭', title, description }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }, icon: { fontSize: 48, marginBottom: 16 }, title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' }, description: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8 } });