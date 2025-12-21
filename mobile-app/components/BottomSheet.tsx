import React from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';

interface Props { visible: boolean; onClose: () => void; children: React.ReactNode; }

export function BottomSheet({ visible, onClose, children }: Props) {
  return (
    <Modal visible={visible} transparent animationType='slide'>
      <TouchableOpacity style={styles.overlay} onPress={onClose}>
        <View style={styles.content}>{children}</View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  content: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
});