import React, {useState} from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  StatusBar,
  useColorScheme,
  Text,
} from 'react-native';

import MorsePlayer from '../../services/MorsePlayer';
import { generatePracticeText } from '../../utils/morseGenerator';

function ElectroTableScreen() {
  const isDarkMode = useColorScheme() === 'dark';

  const [text, setText] = useState('DIEN');
  const [wpm, setWpm] = useState(20);

  const playMorse = async () => {
    MorsePlayer.setWpm(wpm);
    await MorsePlayer.playText(text);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />

      <View style={styles.content}>
        <Text style={styles.label}>Nhập nội dung</Text>

        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="VD: DIEN"
          autoCapitalize="characters"
        />

        <View style={styles.space} />

        <Text style={styles.label}>Tốc độ: {wpm} WPM</Text>

        <View style={styles.row}>
          <Button
            title="-"
            onPress={() => setWpm(prev => Math.max(5, prev - 5))}
          />

          <View style={{width: 12}} />

          <Button
            title="+"
            onPress={() => setWpm(prev => Math.min(50, prev + 5))}
          />
        </View>

        <View style={styles.space} />

        <Button
          title="Play Morse"
          onPress={playMorse}
        />

        <View style={styles.space} />

        <Button
          title="Stop"
          onPress={() => MorsePlayer.stop()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  label: {
    fontSize: 16,
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  space: {
    height: 16,
  },
});

export default ElectroTableScreen;