import { Button, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  generateMorseBoard,
  type CharacterType,
} from '../../../utils/morseGenerator';
import { morseAudio } from '../../../audio/MorseAudioEngine';
import { Slider } from 'react-native-elements';
import { styles } from './styles';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PlaygroundStackParamList } from '../../../types/navigation';

type Props = NativeStackScreenProps<PlaygroundStackParamList, 'AudioTest2Screen'>;

const AudioTest2Screen = ({ route }: Props) => {
  const [frequency, setFrequency] = useState(600);
  const [wpm, setWpm] = useState(20);
  const [board, setBoard] = useState<{ groups: string[] }>({ groups: [] });

  const { groupCount, characterType } = route.params;

  useEffect(() => {
    const generated = generateMorseBoard({
      groupCount: groupCount,
      characterType: characterType,
    });
    setBoard(generated);
  }, [groupCount, characterType]);

  const handlePlay = async () => {
    morseAudio.setFrequency(Number(frequency));
    morseAudio.setWpm(Number(wpm));
    morseAudio.setVolume(0.5);

    await morseAudio.playText(board.groups.join(' '));
  };

  return (
    <View>
      <Text>AudioTest2</Text>
      <Text>Group Count: {groupCount}</Text>
      <Text>Character Type: {characterType}</Text>
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
      <Button title="Phát" onPress={handlePlay} />
      <Button title="Tạm dừng" onPress={() => morseAudio.pause()} />
      <Button title="Tiếp tục" onPress={() => morseAudio.resume()} />
      <Button title="Phát lại từ đầu" onPress={() => morseAudio.restart()} />
      <Text>Generated Morse Board:</Text>
      {board.groups.map((group, index) => (
        <Text key={index}>{group}</Text>
      ))}
    </View>
  );
};
export default AudioTest2Screen;
