import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';

interface Props { visible: boolean; message?: string; }

export function LoadingOverlay({ visible, message = 'Loading...' }: Props) {
  return (
    <Modal visible={visible} transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ActivityIndicator size='large' color='#007AFF' />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({ overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }, content: { backgroundColor: '#fff', padding: 30, borderRadius: 10, alignItems: 'center' }, message: { marginTop: 10, fontSize: 16 } });