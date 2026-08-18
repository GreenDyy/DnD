import React, { useState } from 'react';
import { View, Text, Button, TextInput, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';

import { morseAudio } from '../../audio/MorseAudioEngine';
import { textToMorse } from '../../constants/morseMap';
import { styles } from './styles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { type CharacterType } from '../../utils/morseGenerator';

export default function AudioTest2() {
  type RootStackParamList = {
    AudioTest2: {
      frequency: number;
      wpm: number;
      groupCount: number;
      characterType: CharacterType;
    };
  };
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [text, setText] = useState('SOS');
  const [frequency, setFrequency] = useState(600);
  const [wpm, setWpm] = useState(20);
  const [groupCount, setGroupCount] = useState(10);
  const [characterType, setCharacterType] = useState<CharacterType>('letter');

  const handlePlay = async () => {
    const frequencyValue = Number(frequency);
    const wpmValue = Number(wpm);

    if (!Number.isFinite(frequencyValue)) {
      return;
    }

    morseAudio.setFrequency(frequencyValue);
    morseAudio.setWpm(wpmValue);
    morseAudio.setVolume(0.5);

    await morseAudio.playText(text);
  };

  const handlerMorseBoardGenerate = () => {
    navigation.navigate('AudioTest2', {
      frequency: frequency,
      wpm: wpm,
      groupCount: groupCount,
      characterType: characterType,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text>Morse Audio Test</Text>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Nhập text"
        style={styles.input}
      />

      <Text>Morse: {textToMorse(text)}</Text>

      <Text style={styles.label}>Frequency (Hz)</Text>

      {/* <TextInput
        value={frequency}
        onChangeText={setFrequency}
        keyboardType="numeric"
        placeholder="Nhập tần số, ví dụ 600"
        style={styles.input}
      /> */}

      <Text style={styles.label}>Frequency: {frequency} Hz</Text>

      <Slider
        minimumValue={100}
        maximumValue={3000}
        step={10}
        value={frequency}
        onValueChange={setFrequency}
      />

      <View style={styles.sliderRange}>
        <Text>100 Hz</Text>
        <Text>3000 Hz</Text>
      </View>

      <Text style={styles.label}>WPM</Text>

      <Text style={styles.label}>Tốc độ: {wpm} WPM</Text>

      <Slider
        minimumValue={5}
        maximumValue={100}
        step={5}
        value={wpm}
        onValueChange={setWpm}
      />

      <View style={styles.sliderRange}>
        <Text>5 WPM</Text>
        <Text>100 WPM</Text>
      </View>
      {/* <TextInput
        value={wpm}
        onChangeText={setWpm}
        keyboardType="numeric"
        placeholder="Nhập WPM, ví dụ 20"
        style={styles.input}
      /> */}

      <Text style={styles.label}>Chọn loại ký tự</Text>
      <Text style={styles.label}>
        {characterType === 'letter' ? 'Chữ' : 'Số'}
      </Text>
      <View>
        <Button title="chữ" onPress={() => setCharacterType('letter')} />
        <Button title="số" onPress={() => setCharacterType('number')} />
      </View>

      <Button title="Play Morse" onPress={handlePlay} />

      <Button title="Stop" onPress={() => morseAudio.stop()} />

      <View>
        <TextInput
          value={groupCount.toString()}
          onChangeText={value => setGroupCount(Number(value))}
          keyboardType="numeric"
          placeholder="Nhập số lượng nhóm"
          style={styles.input}
        />
      </View>

      <Button title="Tạo bảng điện Morse" onPress={handlerMorseBoardGenerate} />
    </ScrollView>
  );
}
