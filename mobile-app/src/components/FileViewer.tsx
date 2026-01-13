import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
export interface FileViewerProps { uri: string; type: string; }
export const FileViewer: React.FC<FileViewerProps> = ({ uri, type }) => {
  return (<View style={styles.container}><Text>File: {uri}</Text><Text>Type: {type}</Text></View>);
};
const styles = StyleSheet.create({ container: { padding: 20 } });
export default FileViewer;
