import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props { lat: number; lng: number; zoom?: number; }

export function Map({ lat, lng, zoom = 15 }: Props) {
  return (
    <View style={styles.container}>
      <Text>Map: {lat}, {lng}</Text>
      <Text>Zoom: {zoom}</Text>
    </View>
  );
}

const styles = StyleSheet.create({ container: { height: 200, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' } });