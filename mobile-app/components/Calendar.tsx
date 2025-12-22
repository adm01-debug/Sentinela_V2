import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props { selectedDate?: Date; onDateSelect: (date: Date) => void; }

export function Calendar({ selectedDate, onDateSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text>Calendar Component</Text>
    </View>
  );
}

const styles = StyleSheet.create({ container: { padding: 10 } });