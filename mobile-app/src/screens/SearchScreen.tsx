import React, { useState } from 'react';
import { View, TextInput, FlatList, StyleSheet } from 'react-native';
import { useSearch } from '../hooks/useSearch';
import { SearchResultItem } from '../components/SearchResultItem';
export const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const { results, isSearching } = useSearch(query);
  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Search..." value={query} onChangeText={setQuery} />
      <FlatList data={results} keyExtractor={(item) => item.id} renderItem={({ item }) => <SearchResultItem item={item} />} />
    </View>
  );
};
const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16 } });