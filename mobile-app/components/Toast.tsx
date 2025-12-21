import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onHide?: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onHide }: ToastProps) {
  const opacity = new Animated.Value(0);

  const colors = {
    success: '#10B981',
    error: '#EF4444',
    info: '#3B82F6',
  };

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(duration),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => onHide?.());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity, backgroundColor: colors[type] }]}>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 50, left: 20, right: 20, padding: 16, borderRadius: 8, alignItems: 'center' },
  message: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
});
