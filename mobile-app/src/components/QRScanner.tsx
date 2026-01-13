import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
export interface QRScannerProps { onScan: (data: string) => void; onError?: (error: string) => void; }
export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onError }) => {
  return (<View style={styles.container}><Text style={styles.text}>Point camera at QR code</Text></View>);
};
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center' }, text: { color: '#fff' } });
export default QRScanner;
