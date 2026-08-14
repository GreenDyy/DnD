import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
} from 'react-native';

import { morseAudio } from '../../audio/MorseAudioEngine';
import { textToMorse } from '../../constants/morseMap';

export default function AudioTestScreen() {
  const [text, setText] = useState('SOS');
  const [frequency, setFrequency] = useState(600);

  const handlePlay = async () => {
    morseAudio.setFrequency(frequency);
    morseAudio.setVolume(0.5);
    morseAudio.setWpm(20);

    await morseAudio.playText(text);
  };

  return (
    <View style={{ padding: 24, gap: 16 }}>
      <Text>Morse Audio Test</Text>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Nhập text"
        style={{
          borderWidth: 1,
          padding: 12,
        }}
      />

      <Text>
        Morse: {textToMorse(text)}
      </Text>

      <Text>
        Frequency: {frequency} Hz
      </Text>

      <Button
        title="500 Hz"
        onPress={() => setFrequency(500)}
      />

      <Button
        title="600 Hz"
        onPress={() => setFrequency(600)}
      />

      <Button
        title="800 Hz"
        onPress={() => setFrequency(800)}
      />

      <Button
        title="Play Morse"
        onPress={handlePlay}
      />

      <Button
        title="Stop"
        onPress={() => morseAudio.stop()}
      />
    </View>
  );
}