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
import {useNavigation} from '@react-navigation/native';

import {
  generatePracticeText,
  PracticeMode,
} from '../../utils/morseGenerator';

function ElectroTableScreen() {
  const navigation = useNavigation<any>();

  const isDarkMode = useColorScheme() === 'dark';

  const [groups, setGroups] = useState('10');
  const [groupLength, setGroupLength] = useState('5');

  const [wpm, setWpm] = useState(20);

  const [mode, setMode] =
    useState<PracticeMode>('letters');

  const generateTable = () => {
    const text = generatePracticeText({
      groups: Number(groups),
      groupLength: Number(groupLength),
      mode,
    });

    navigation.navigate('PracticeScreen', {
      text,
      wpm,
      groups: Number(groups),
      groupLength: Number(groupLength),
      mode,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={
          isDarkMode
            ? 'light-content'
            : 'dark-content'
        }
      />

      <View style={styles.content}>
        <Text style={styles.label}>
          Số nhóm điện
        </Text>

        <TextInput
          style={styles.input}
          value={groups}
          onChangeText={setGroups}
          keyboardType="numeric"
        />

        <View style={styles.space} />

        <Text style={styles.label}>
          Số ký tự / nhóm
        </Text>

        <TextInput
          style={styles.input}
          value={groupLength}
          onChangeText={setGroupLength}
          keyboardType="numeric"
        />

        <View style={styles.space} />

        <Text style={styles.label}>
          Loại điện
        </Text>

        <View style={styles.row}>
          <Button
            title={
              mode === 'letters'
                ? '✓ Chữ'
                : 'Chữ'
            }
            onPress={() =>
              setMode('letters')
            }
          />

          <View style={{width: 8}} />

          <Button
            title={
              mode === 'numbers'
                ? '✓ Số'
                : 'Số'
            }
            onPress={() =>
              setMode('numbers')
            }
          />

          <View style={{width: 8}} />

          <Button
            title={
              mode === 'mixed'
                ? '✓ Hỗn hợp'
                : 'Hỗn hợp'
            }
            onPress={() =>
              setMode('mixed')
            }
          />
        </View>

        <View style={styles.space} />

        <Text style={styles.label}>
          Tốc độ: {wpm} WPM
        </Text>

        <View style={styles.row}>
          <Button
            title="-"
            onPress={() =>
              setWpm(prev =>
                Math.max(5, prev - 5),
              )
            }
          />

          <View style={{width: 12}} />

          <Button
            title="+"
            onPress={() =>
              setWpm(prev =>
                Math.min(50, prev + 5),
              )
            }
          />
        </View>

        <View style={styles.space} />

        <Button
          title="Tạo bảng điện"
          onPress={generateTable}
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
    padding: 24,
  },

  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
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