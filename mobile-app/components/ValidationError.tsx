import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props { errors: string[]; }

export function ValidationError({ errors }: Props) {
  if (!errors.length) return null;
  return (
    <View style={styles.container}>
      {errors.map((e, i) => <Text key={i} style={styles.error}>• {e}</Text>)}
    </View>
  );
}

const styles = StyleSheet.create({ container: { backgroundColor: '#ffebee', padding: 12, borderRadius: 8, marginBottom: 16 }, error: { color: '#c62828', fontSize: 14, marginBottom: 4 } });