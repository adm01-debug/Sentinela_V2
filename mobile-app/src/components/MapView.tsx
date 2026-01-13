import React from 'react';
import { View, StyleSheet } from 'react-native';
export interface MapViewProps { markers?: Array<{ lat: number; lng: number; title: string }>; onMarkerPress?: (marker: any) => void; }
export const MapView: React.FC<MapViewProps> = ({ markers = [], onMarkerPress }) => {
  return <View style={styles.container}>{/* Map implementation */}</View>;
};
const styles = StyleSheet.create({ container: { flex: 1 } });
export default MapView;
