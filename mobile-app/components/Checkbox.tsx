import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

interface Props { checked: boolean; onChange: (checked: boolean) => void; label?: string; }

export function Checkbox({ checked, onChange, label }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onChange(!checked)}>
      <View style={[styles.box, checked && styles.checked]}>{checked && <Text>✓</Text>}</View>
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({ container: { flexDirection: 'row', alignItems: 'center' }, box: { width: 24, height: 24, borderWidth: 2, borderColor: '#007AFF', borderRadius: 4, alignItems: 'center', justifyContent: 'center' }, checked: { backgroundColor: '#007AFF' }, label: { marginLeft: 10 } });