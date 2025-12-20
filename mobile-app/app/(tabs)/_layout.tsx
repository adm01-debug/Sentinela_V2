import { Tabs } from 'expo-router';
import { Home, MapPin, FileText, User } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#3b82f6' }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="location" 
        options={{ 
          title: 'Localização',
          tabBarIcon: ({ color }) => <MapPin size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="reports" 
        options={{ 
          title: 'Relatórios',
          tabBarIcon: ({ color }) => <FileText size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Perfil',
          tabBarIcon: ({ color }) => <User size={24} color={color} />
        }} 
      />
    </Tabs>
  );
}
