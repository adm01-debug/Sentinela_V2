import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

interface Props { value: string; onChange: (time: string) => void; }

export function TimePicker({ value, onChange }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <View>
      <TouchableOpacity style={styles.button} onPress={() => setVisible(true)}>
        <Text>{value || 'Select time'}</Text>
      </TouchableOpacity>
      <Modal visible={visible} transparent>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.option} onPress={() => { onChange('09:00'); setVisible(false); }}>
            <Text>09:00</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={() => { onChange('12:00'); setVisible(false); }}>
            <Text>12:00</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={() => { onChange('18:00'); setVisible(false); }}>
            <Text>18:00</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: { padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  modal: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  option: { padding: 15, backgroundColor: '#fff', marginBottom: 1 },
});