import React from 'react';
import { RefreshControl, ScrollView } from 'react-native';
export interface PullToRefreshProps { onRefresh: () => Promise<void>; children: React.ReactNode; }
export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const handleRefresh = async () => { setRefreshing(true); await onRefresh(); setRefreshing(false); };
  return <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>{children}</ScrollView>;
};
export default PullToRefresh;
