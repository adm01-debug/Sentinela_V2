import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props { segments: string[]; selectedIndex: number; onChange: (index: number) => void; }

export function SegmentedControl({ segments, selectedIndex, onChange }: Props) {
  return (
    <View style={styles.container}>
      {segments.map((seg, i) => (
        <TouchableOpacity key={i} style={[styles.segment, selectedIndex === i && styles.selected]} onPress={() => onChange(i)}>
          <Text style={[styles.text, selectedIndex === i && styles.selectedText]}>{seg}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 8, padding: 2 }, segment: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 }, selected: { backgroundColor: '#fff' }, text: { color: '#666' }, selectedText: { color: '#000', fontWeight: '600' } });