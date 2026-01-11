import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
export const Toast = ({ message, type = 'info', duration = 3000, onHide }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }), Animated.delay(duration), Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true })]).start(onHide);
  }, []);
  const bg = type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3';
  return <Animated.View style={[styles.toast, { opacity, backgroundColor: bg }]}><Text style={styles.text}>{message}</Text></Animated.View>;
};
const styles = StyleSheet.create({ toast: { position: 'absolute', bottom: 50, left: 20, right: 20, padding: 16, borderRadius: 8 }, text: { color: '#fff', textAlign: 'center' } });