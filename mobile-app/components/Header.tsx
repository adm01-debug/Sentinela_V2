import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';

interface HeaderProps {
  title: string;
  leftAction?: { icon: React.ReactNode; onPress: () => void };
  rightAction?: { icon: React.ReactNode; onPress: () => void };
}

export function Header({ title, leftAction, rightAction }: HeaderProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        {leftAction ? (
          <TouchableOpacity onPress={leftAction.onPress} style={styles.action}>
            {leftAction.icon}
          </TouchableOpacity>
        ) : <View style={styles.action} />}
        <Text style={styles.title}>{title}</Text>
        {rightAction ? (
          <TouchableOpacity onPress={rightAction.onPress} style={styles.action}>
            {rightAction.icon}
          </TouchableOpacity>
        ) : <View style={styles.action} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 18, fontWeight: '600', color: '#111827' },
  action: { width: 40, alignItems: 'center' },
});
