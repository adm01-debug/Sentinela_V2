import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props { title?: string; color?: string; }

export function MapMarker({ title, color = '#ff4444' }: Props) {
  return (
    <View style={[styles.marker, { backgroundColor: color }]}>
      {title && <Text style={styles.title}>{title}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({ marker: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' }, title: { color: '#fff', fontSize: 10 } });