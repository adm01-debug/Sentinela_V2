import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
export const Skeleton = ({ width = '100%', height = 20, borderRadius = 4 }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const anim = Animated.loop(Animated.sequence([Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }), Animated.timing(opacity, { toValue: 0.3, duration: 500, useNativeDriver: true })]));
    anim.start(); return () => anim.stop();
  }, []);
  return <Animated.View style={[styles.sk, { width, height, borderRadius, opacity }]} />;
};
const styles = StyleSheet.create({ sk: { backgroundColor: '#E0E0E0' } });