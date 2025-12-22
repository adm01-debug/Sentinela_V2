import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';

interface Option { label: string; value: string; }
interface Props { options: Option[]; value: string[]; onChange: (values: string[]) => void; placeholder?: string; }

export function MultiSelect({ options, value, onChange, placeholder = 'Select...' }: Props) {
  const [visible, setVisible] = useState(false);
  const toggle = (v: string) => { onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]); };
  return (
    <View>
      <TouchableOpacity style={styles.trigger} onPress={() => setVisible(true)}>
        <Text>{value.length ? `${value.length} selected` : placeholder}</Text>
      </TouchableOpacity>
      <Modal visible={visible} transparent>
        <TouchableOpacity style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.list}>
            {options.map(o => <TouchableOpacity key={o.value} style={styles.option} onPress={() => toggle(o.value)}><Text>{value.includes(o.value) ? '✓ ' : ''}{o.label}</Text></TouchableOpacity>)}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({ trigger: { padding: 15, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 }, overlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }, list: { margin: 20, backgroundColor: '#fff', borderRadius: 10 }, option: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' } });