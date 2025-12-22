import React from 'react';
import { Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';

interface Props { href: string; children: React.ReactNode; }

export function Link({ href, children }: Props) {
  return (
    <TouchableOpacity onPress={() => Linking.openURL(href)}>
      <Text style={styles.link}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({ link: { color: '#007AFF', textDecorationLine: 'underline' } });