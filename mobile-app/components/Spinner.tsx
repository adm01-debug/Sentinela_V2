import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

interface Props { size?: 'small' | 'large'; color?: string; }

export function Spinner({ size = 'large', color = '#007AFF' }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { padding: 20, alignItems: 'center' } });