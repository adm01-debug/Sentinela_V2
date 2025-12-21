import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

interface ListProps {
  items: ListItem[];
  onItemPress?: (item: ListItem) => void;
  emptyMessage?: string;
}

export function List({ items, onItemPress, emptyMessage = 'No items' }: ListProps) {
  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.item} onPress={() => onItemPress?.(item)} disabled={!onItemPress}>
          <View style={styles.content}>
            <Text style={styles.title}>{item.title}</Text>
            {item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
          </View>
          {item.right}
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#FFFFFF' },
  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: '500', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#E5E7EB' },
  empty: { padding: 24, alignItems: 'center' },
  emptyText: { color: '#9CA3AF', fontSize: 14 },
});
