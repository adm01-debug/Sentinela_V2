import React from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';

interface Props { children: React.ReactNode; style?: ViewStyle; horizontal?: boolean; }

export function ScrollContainer({ children, style, horizontal }: Props) {
  return <ScrollView style={[styles.container, style]} horizontal={horizontal} showsHorizontalScrollIndicator={false}>{children}</ScrollView>;
}

const styles = StyleSheet.create({ container: { flex: 1 } });