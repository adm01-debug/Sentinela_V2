import React from 'react';
import { View } from 'react-native';

interface Props { size?: number; horizontal?: boolean; }

export function Spacer({ size = 16, horizontal }: Props) {
  return <View style={horizontal ? { width: size } : { height: size }} />;
}