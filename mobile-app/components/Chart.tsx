import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props { data: number[]; labels: string[]; }

export function Chart({ data, labels }: Props) {
  return (
    <View style={styles.container}>
      <Text>Chart Component</Text>
    </View>
  );
}

const styles = StyleSheet.create({ container: { padding: 10 } });