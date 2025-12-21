import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface Props { value: Date; onChange: (date: Date) => void; }

export function DatePicker({ value, onChange }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <View>
      <TouchableOpacity style={styles.button} onPress={() => setVisible(true)}>
        <Text>{value.toLocaleDateString()}</Text>
      </TouchableOpacity>
      <Modal visible={visible} transparent>
        <View style={styles.modal}>
          <TouchableOpacity onPress={() => { onChange(new Date()); setVisible(false); }}>
            <Text>Select Today</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: { padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  modal: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
});