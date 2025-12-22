import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Tab { key: string; label: string; icon: string; }
interface Props { tabs: Tab[]; activeTab: string; onTabPress: (key: string) => void; }

export function BottomNavigation({ tabs, activeTab, onTabPress }: Props) {
  return (
    <View style={styles.container}>
      {tabs.map(tab => (
        <TouchableOpacity key={tab.key} style={styles.tab} onPress={() => onTabPress(tab.key)}>
          <Text>{tab.icon}</Text>
          <Text>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flexDirection: 'row', backgroundColor: '#fff' }, tab: { flex: 1, alignItems: 'center', padding: 10 } });