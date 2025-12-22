import React from 'react';
import { RefreshControl as RNRefreshControl } from 'react-native';

interface Props { refreshing: boolean; onRefresh: () => void; }

export function RefreshControl({ refreshing, onRefresh }: Props) {
  return <RNRefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007AFF']} />;
}