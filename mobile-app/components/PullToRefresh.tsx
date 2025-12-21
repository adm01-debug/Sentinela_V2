import React from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

interface Props { refreshing: boolean; onRefresh: () => void; children: React.ReactNode; }

export function PullToRefresh({ refreshing, onRefresh, children }: Props) {
  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366f1']} />}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });