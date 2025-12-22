import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface Column { key: string; title: string; }
interface Props { columns: Column[]; data: Record<string, unknown>[]; }

export function DataTable({ columns, data }: Props) {
  return (
    <ScrollView horizontal>
      <View>
        <View style={styles.header}>{columns.map(c => <Text key={c.key} style={styles.headerCell}>{c.title}</Text>)}</View>
        {data.map((row, i) => <View key={i} style={styles.row}>{columns.map(c => <Text key={c.key} style={styles.cell}>{String(row[c.key])}</Text>)}</View>)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({ header: { flexDirection: 'row', backgroundColor: '#f5f5f5' }, headerCell: { padding: 10, fontWeight: 'bold', minWidth: 100 }, row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee' }, cell: { padding: 10, minWidth: 100 } });