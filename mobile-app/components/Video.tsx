import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props { uri: string; autoPlay?: boolean; controls?: boolean; }

export function Video({ uri, autoPlay, controls = true }: Props) {
  const [playing, setPlaying] = React.useState(autoPlay);
  return (
    <View style={styles.container}>
      <View style={styles.video}>
        <Text>Video: {uri}</Text>
      </View>
      {controls && (
        <TouchableOpacity style={styles.playButton} onPress={() => setPlaying(!playing)}>
          <Text style={styles.playText}>{playing ? '⏸️' : '▶️'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ container: { position: 'relative' }, video: { width: '100%', height: 200, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }, playButton: { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -25 }, { translateY: -25 }] }, playText: { fontSize: 50 } });