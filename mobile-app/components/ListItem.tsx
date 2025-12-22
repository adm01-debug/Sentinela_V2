import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props { title: string; subtitle?: string; leftIcon?: string; rightIcon?: string; onPress?: () => void; }

export function ListItem({ title, subtitle, leftIcon, rightIcon, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {leftIcon && <Text style={styles.leftIcon}>{leftIcon}</Text>}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {rightIcon && <Text style={styles.rightIcon}>{rightIcon}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({ container: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }, leftIcon: { fontSize: 24, marginRight: 12 }, content: { flex: 1 }, title: { fontSize: 16, fontWeight: '500' }, subtitle: { fontSize: 14, color: '#666', marginTop: 2 }, rightIcon: { fontSize: 16, color: '#999' } });