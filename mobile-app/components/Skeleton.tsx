import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface Props { width?: number | string; height?: number; borderRadius?: number; }

export function Skeleton({ width = '100%', height = 20, borderRadius = 4 }: Props) {
  return <View style={[styles.skeleton, { width, height, borderRadius }]} />;
}

const styles = StyleSheet.create({ skeleton: { backgroundColor: '#e0e0e0' } });