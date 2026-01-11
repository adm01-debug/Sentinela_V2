import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
export const HelpScreen = () => {
  const faqs = [{ q: 'How to track?', a: 'Auto tracked when agent runs.' }];
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Help</Text>
      {faqs.map((f, i) => <View key={i} style={styles.faq}><Text style={styles.q}>{f.q}</Text><Text>{f.a}</Text></View>)}
      <TouchableOpacity style={styles.btn} onPress={() => Linking.openURL('mailto:support@sentinela.com')}><Text style={styles.btnText}>Contact</Text></TouchableOpacity>
    </ScrollView>
  );
};
const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 }, faq: { marginBottom: 16 }, q: { fontWeight: '600' }, btn: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8 }, btnText: { color: '#fff', textAlign: 'center' } });