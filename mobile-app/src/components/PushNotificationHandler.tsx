import React, { useEffect } from 'react';
import { View } from 'react-native';
export interface PushNotificationHandlerProps { onNotification: (data: any) => void; }
export const PushNotificationHandler: React.FC<PushNotificationHandlerProps> = ({ onNotification, children }) => {
  useEffect(() => { /* Register for push notifications */ }, []);
  return <View style={{ flex: 1 }}>{children}</View>;
};
export default PushNotificationHandler;
