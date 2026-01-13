import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
export interface ChartsProps { data: Array<{ name: string; value: number }>; type?: 'bar' | 'line' | 'pie'; }
export const Charts: React.FC<ChartsProps> = ({ data, type = 'bar' }) => {
  return <View style={styles.container}><Text>Chart: {type}</Text></View>;
};
const styles = StyleSheet.create({ container: { padding: 20 } });
export default Charts;
