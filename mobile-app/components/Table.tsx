import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface Props { headers: string[]; rows: string[][]; }

export function Table({ headers, rows }: Props) {
  return (
    <ScrollView horizontal>
      <View>
        <View style={styles.headerRow}>{headers.map((h, i) => <Text key={i} style={styles.headerCell}>{h}</Text>)}</View>
        {rows.map((row, i) => <View key={i} style={styles.row}>{row.map((cell, j) => <Text key={j} style={styles.cell}>{cell}</Text>)}</View>)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({ headerRow: { flexDirection: 'row', backgroundColor: '#f5f5f5' }, headerCell: { padding: 12, fontWeight: 'bold', minWidth: 100 }, row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee' }, cell: { padding: 12, minWidth: 100 } });