import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';

interface Props<T> { items: T[]; value: T; onChange: (item: T) => void; labelKey?: keyof T; }

export function Picker<T>({ items, value, onChange, labelKey }: Props<T>) {
  const [visible, setVisible] = useState(false);
  const getLabel = (item: T) => labelKey ? String(item[labelKey]) : String(item);
  return (
    <View>
      <TouchableOpacity style={styles.button} onPress={() => setVisible(true)}>
        <Text>{getLabel(value)}</Text>
      </TouchableOpacity>
      <Modal visible={visible} transparent>
        <View style={styles.modal}>
          <FlatList data={items} keyExtractor={(_, i) => String(i)} renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => { onChange(item); setVisible(false); }}>
              <Text>{getLabel(item)}</Text>
            </TouchableOpacity>
          )} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: { padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  modal: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  item: { padding: 15, backgroundColor: '#fff', marginBottom: 1 },
});