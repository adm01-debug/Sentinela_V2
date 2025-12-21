import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface FooterItem {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  active?: boolean;
}

interface FooterProps {
  items: FooterItem[];
}

export function Footer({ items }: FooterProps) {
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <TouchableOpacity key={index} style={styles.item} onPress={item.onPress}>
          {item.icon}
          <Text style={[styles.label, item.active && styles.activeLabel]}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingVertical: 8 },
  item: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  label: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  activeLabel: { color: '#6366F1' },
});
