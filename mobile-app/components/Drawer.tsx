import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Animated } from 'react-native';

interface Props { visible: boolean; onClose: () => void; children: React.ReactNode; }

export function Drawer({ visible, onClose, children }: Props) {
  return (
    <Modal visible={visible} transparent animationType='fade'>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.drawer}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({ overlay: { flex: 1, flexDirection: 'row' }, backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }, drawer: { width: 280, backgroundColor: '#fff', padding: 20 } });