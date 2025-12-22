import React from 'react';
import { Image as RNImage, StyleSheet, ImageStyle } from 'react-native';

interface Props { source: string | { uri: string }; style?: ImageStyle; resizeMode?: 'cover' | 'contain' | 'stretch'; }

export function Image({ source, style, resizeMode = 'cover' }: Props) {
  const src = typeof source === 'string' ? { uri: source } : source;
  return <RNImage source={src} style={[styles.image, style]} resizeMode={resizeMode} />;
}

const styles = StyleSheet.create({ image: { width: '100%', height: 200 } });