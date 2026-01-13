import React from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet } from 'react-native';
export interface ImagePickerProps { value?: string; onChange: (uri: string) => void; }
export const ImagePicker: React.FC<ImagePickerProps> = ({ value, onChange }) => {
  const pickImage = async () => { /* Implementation */ };
  return (<TouchableOpacity style={styles.container} onPress={pickImage}>{value ? <Image source={{ uri: value }} style={styles.image} /> : <Text>Select Image</Text>}</TouchableOpacity>);
};
const styles = StyleSheet.create({ container: { width: 100, height: 100, borderWidth: 1, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center' }, image: { width: '100%', height: '100%' } });
export default ImagePicker;
